import { neon } from "./neonClient";

const ENVELOPE_PREFIX = "jlenc:v1:";
const PBKDF2_ITERATIONS = 600_000;
const keyCache = new Map<string, CryptoKey>();

type VaultRow = {
  salt: string;
  wrap_iv: string;
  wrapped_key: string;
};

type EncryptedPayload = {
  text: string;
  options?: string[];
  replyToText?: string;
  replyToSender?: "bot" | "user";
};

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function isEncrypted(value: string | null | undefined): value is string {
  return typeof value === "string" && value.startsWith(ENVELOPE_PREFIX);
}

async function deriveWrappingKey(password: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: Uint8Array.from(salt).buffer as ArrayBuffer, iterations: PBKDF2_ITERATIONS },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function createVaultKey(password: string) {
  const rawKey = crypto.getRandomValues(new Uint8Array(32));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const wrapIv = crypto.getRandomValues(new Uint8Array(12));
  const wrappingKey = await deriveWrappingKey(password, salt);
  const wrappedKey = await crypto.subtle.encrypt({ name: "AES-GCM", iv: wrapIv }, wrappingKey, rawKey);
  const dataKey = await crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  rawKey.fill(0);
  return {
    dataKey,
    row: { salt: toBase64(salt), wrap_iv: toBase64(wrapIv), wrapped_key: toBase64(new Uint8Array(wrappedKey)) },
  };
}

async function unwrapVaultKey(password: string, row: VaultRow) {
  const salt = fromBase64(row.salt);
  const wrappingKey = await deriveWrappingKey(password, salt);
  const rawKey = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(row.wrap_iv) },
    wrappingKey,
    fromBase64(row.wrapped_key),
  );
  return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

function encodeEnvelope(iv: Uint8Array, ciphertext: ArrayBuffer) {
  return `${ENVELOPE_PREFIX}${toBase64(iv)}:${toBase64(new Uint8Array(ciphertext))}`;
}

async function encryptValue<T>(key: CryptoKey, value: T) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return encodeEnvelope(iv, ciphertext);
}

async function decryptValue<T>(key: CryptoKey, envelope: string): Promise<T> {
  if (!isEncrypted(envelope)) throw new Error("Chat content is not encrypted");
  const [ivText, ciphertextText] = envelope.slice(ENVELOPE_PREFIX.length).split(":");
  if (!ivText || !ciphertextText) throw new Error("Encrypted chat data is damaged");
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(ivText) },
    key,
    fromBase64(ciphertextText),
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

async function readVaultRow(userId: string) {
  const { data, error } = await neon.from("user_chat_encryption_keys")
    .select("salt, wrap_iv, wrapped_key")
    .eq("user_id", userId)
    .limit(1);
  if (error) throw error;
  return (data?.[0] as VaultRow | undefined) ?? null;
}

async function migrateLegacyHistory(userId: string, key: CryptoKey) {
  const batchSize = 500;
  for (let sessionOffset = 0; ; sessionOffset += batchSize) {
    const { data: sessions, error: sessionsError } = await neon.from("chat_sessions")
      .select("id, title, context_summary")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .range(sessionOffset, sessionOffset + batchSize - 1);
    if (sessionsError) throw sessionsError;

    for (const session of sessions ?? []) {
      if (isEncrypted(session.title)) await decryptValue(key, session.title);
      if (isEncrypted(session.context_summary)) await decryptValue(key, session.context_summary);
      const sessionUpdate: Record<string, string> = {};
      if (!isEncrypted(session.title)) sessionUpdate.title = await encryptValue(key, { value: session.title });
      if (!isEncrypted(session.context_summary)) sessionUpdate.context_summary = await encryptValue(key, { value: session.context_summary ?? "" });
      if (Object.keys(sessionUpdate).length) {
        const { error } = await neon.from("chat_sessions").update(sessionUpdate).eq("id", session.id);
        if (error) throw error;
      }

      for (let messageOffset = 0; ; messageOffset += batchSize) {
        const { data: messages, error: messagesError } = await neon.from("chat_messages")
          .select("id, text, options, reply_to_text, reply_to_sender")
          .eq("session_id", session.id)
          .order("created_at", { ascending: true })
          .range(messageOffset, messageOffset + batchSize - 1);
        if (messagesError) throw messagesError;

        for (const message of messages ?? []) {
          if (isEncrypted(message.text)) {
            await decryptValue(key, message.text);
            continue;
          }
          const payload: EncryptedPayload = {
            text: message.text,
            options: message.options ?? [],
            replyToText: message.reply_to_text ?? undefined,
            replyToSender: message.reply_to_sender ?? undefined,
          };
          const { error } = await neon.from("chat_messages").update({
            text: await encryptValue(key, payload),
            options: [],
            reply_to_text: null,
            reply_to_sender: null,
          }).eq("id", message.id);
          if (error) throw error;
        }
        if (!messages || messages.length < batchSize) break;
      }
    }
    if (!sessions || sessions.length < batchSize) break;
  }
}

async function createOrLoadKey(userId: string, password: string) {
  const existing = await readVaultRow(userId);
  if (existing) return unwrapVaultKey(password, existing);

  const encryptedSession = await neon.from("chat_sessions")
    .select("id")
    .eq("user_id", userId)
    .like("title", `${ENVELOPE_PREFIX}%`)
    .limit(1);
  if (encryptedSession.error) throw encryptedSession.error;
  const encryptedSummary = await neon.from("chat_sessions")
    .select("id")
    .eq("user_id", userId)
    .like("context_summary", `${ENVELOPE_PREFIX}%`)
    .limit(1);
  if (encryptedSummary.error) throw encryptedSummary.error;
  const encryptedMessage = await neon.from("chat_messages")
    .select("id")
    .like("text", `${ENVELOPE_PREFIX}%`)
    .limit(1);
  if (encryptedMessage.error) throw encryptedMessage.error;
  if (encryptedSession.data?.length || encryptedSummary.data?.length || encryptedMessage.data?.length) {
    throw new Error("The encryption key for existing chat history is missing. A new key was not created to protect your data.");
  }

  const created = await createVaultKey(password);
  const { error } = await neon.from("user_chat_encryption_keys").insert({ user_id: userId, ...created.row });
  if (!error) return created.dataKey;

  const racedRow = await readVaultRow(userId);
  if (racedRow) return unwrapVaultKey(password, racedRow);
  throw error;
}

export async function unlockAndMigrateChat(userId: string, password: string) {
  if (!password) throw new Error("Enter your account password to unlock encrypted chats.");
  const key = await createOrLoadKey(userId, password);
  keyCache.set(userId, key);
  try {
    await migrateLegacyHistory(userId, key);
  } catch (error) {
    keyCache.delete(userId);
    throw error;
  }
}

export function hasChatEncryptionKey(userId: string) {
  return keyCache.has(userId);
}

export function clearChatEncryptionKey(userId: string) {
  keyCache.delete(userId);
}

export async function encryptChatPayload(userId: string, value: EncryptedPayload) {
  const key = keyCache.get(userId);
  if (!key) throw new Error("Unlock chat encryption before saving messages.");
  return encryptValue(key, value);
}

export async function decryptChatPayload<T>(userId: string, value: string): Promise<T> {
  const key = keyCache.get(userId);
  if (!key) throw new Error("Unlock chat encryption before reading messages.");
  return decryptValue<T>(key, value);
}

export async function encryptSessionText(userId: string, value: string) {
  const key = keyCache.get(userId);
  if (!key) throw new Error("Unlock chat encryption before saving conversations.");
  return encryptValue(key, { value });
}

export async function decryptSessionText(userId: string, value: string) {
  const key = keyCache.get(userId);
  if (!key) throw new Error("Unlock chat encryption before reading conversations.");
  const payload = await decryptValue<{ value: string }>(key, value);
  return payload.value;
}
