import assert from "node:assert/strict";
import { randomUUID, webcrypto } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { readIsolatedConfig } from "./isolated-test-guards.mjs";

const config = readIsolatedConfig();
const marker = `jl-encryption-rollout-${randomUUID()}`;
const cacheDir = path.join(process.cwd(), "node_modules", ".cache");
fs.mkdirSync(cacheDir, { recursive: true });
const tempDir = fs.mkdtempSync(path.join(cacheDir, "jl-encryption-rollout-"));
const originalFetch = globalThis.fetch;
const env = process.env;
const label = "A";
let userId;
let jwt;
let sessionId;
let journalId;
let keyId;
let moduleApi;

async function authenticate() {
  const email = env[`JOMLUAH_TEST_USER_${label}_EMAIL`];
  const password = env[`JOMLUAH_TEST_USER_${label}_PASSWORD`];
  const response = await originalFetch(new URL("sign-in/email", `${config.authUrl}/`), {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3101" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(12000),
  });
  assert.equal(response.ok, true, `isolated test login failed (HTTP ${response.status})`);
  const cookie = (response.headers.getSetCookie?.() ?? []).map((item) => item.split(";", 1)[0]).join("; ");
  assert.ok(cookie, "isolated test login returned no session cookie");
  const sessionResponse = await originalFetch(new URL("get-session", `${config.authUrl}/`), {
    headers: { cookie, origin: "http://localhost:3101" },
    signal: AbortSignal.timeout(12000),
  });
  assert.equal(sessionResponse.ok, true);
  jwt = sessionResponse.headers.get("set-auth-jwt");
  const session = await sessionResponse.json();
  userId = session.user?.id ?? session.session?.user?.id;
  assert.ok(userId && jwt?.split(".").length === 3, "isolated login lacked user ID or Data API JWT");
}

async function api(table, query = "", init = {}) {
  const response = await originalFetch(`${config.dataUrl}/${table}${query ? `?${query}` : ""}`, {
    ...init,
    headers: {
      authorization: `Bearer ${jwt}`,
      "content-type": "application/json",
      accept: "application/json",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(12000),
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  return { response, data };
}

async function compileClient() {
  const repoRoot = process.cwd();
  for (const filename of ["neonClient.ts", "chatEncryption.ts"]) {
    const sourcePath = path.join(repoRoot, "app", "lib", filename);
    const source = fs.readFileSync(sourcePath, "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    fs.writeFileSync(path.join(tempDir, filename.replace(/\.ts$/, ".js")), output);
  }
  const require = createRequire(import.meta.url);
  moduleApi = require(path.join(tempDir, "chatEncryption.js"));
}

async function seed() {
  const session = await api("chat_sessions", "select=id", {
    method: "POST", headers: { prefer: "return=representation" },
    body: JSON.stringify({ user_id: userId, title: `${marker} legacy chat title`, context_summary: `${marker} legacy summary` }),
  });
  assert.equal(session.response.status, 201, `could not seed synthetic chat session (HTTP ${session.response.status})`);
  sessionId = session.data[0].id;
  const message = await api("chat_messages", "select=id", {
    method: "POST", headers: { prefer: "return=representation" },
    body: JSON.stringify({ session_id: sessionId, sender: "user", text: `${marker} legacy message`, options: ["synthetic option"], reply_to_text: "legacy reply", reply_to_sender: "bot" }),
  });
  assert.equal(message.response.status, 201, `could not seed synthetic chat message (HTTP ${message.response.status})`);
  const journal = await api("journal_entries", "select=id", {
    method: "POST", headers: { prefer: "return=representation" },
    body: JSON.stringify({ user_id: userId, title: `${marker} photo`, mood: "test", excerpt: `${marker} synthetic only`, tags: [marker], images: [`data:image/png;base64,${Buffer.from(marker).toString("base64")}`], embedding: null }),
  });
  assert.equal(journal.response.status, 201, `could not seed synthetic journal photo (HTTP ${journal.response.status})`);
  journalId = journal.data[0].id;
}

async function verifyMigrated() {
  const sessions = await api("chat_sessions", `id=eq.${sessionId}&select=title,context_summary`);
  const messages = await api("chat_messages", `session_id=eq.${sessionId}&select=text,options,reply_to_text,reply_to_sender`);
  const journals = await api("journal_entries", `id=eq.${journalId}&select=images`);
  const keys = await api("user_chat_encryption_keys", `user_id=eq.${userId}&select=user_id`);
  assert.equal(sessions.response.status, 200);
  assert.equal(messages.response.status, 200);
  assert.equal(journals.response.status, 200);
  assert.equal(keys.response.status, 200);
  assert.match(sessions.data[0].title, /^jlenc:v1:/);
  assert.match(sessions.data[0].context_summary, /^jlenc:v1:/);
  assert.match(messages.data[0].text, /^jlenc:v1:/);
  assert.deepEqual(messages.data[0].options, []);
  assert.equal(messages.data[0].reply_to_text, null);
  assert.equal(messages.data[0].reply_to_sender, null);
  assert.match(journals.data[0].images[0], /^jlenc:v1:/);
  assert.equal(keys.data.length, 1);
  keyId = keys.data[0].user_id;
}

try {
  await authenticate();
  await seed();
  process.env.NEXT_PUBLIC_NEON_URL = config.dataUrl;
  await compileClient();
  if (!globalThis.crypto?.subtle) Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
  const savedFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    if (typeof input === "string" && input.startsWith("/api/auth/get-session")) {
      return new Response("{}", { status: 200, headers: { "set-auth-jwt": jwt } });
    }
    return savedFetch(input, init);
  };
  await moduleApi.unlockAndMigrateChat(userId, env.JOMLUAH_TEST_USER_A_PASSWORD, false);
  await verifyMigrated();
  moduleApi.clearChatEncryptionKey(userId);
  await assert.rejects(() => moduleApi.unlockAndMigrateChat(userId, "definitely-wrong-test-password", false));
  await verifyMigrated();
  moduleApi.clearChatEncryptionKey(userId);
  console.log("PASS: actual encryption module migrated fictional legacy chat, summary, message metadata, and journal photo in isolated Neon.");
  console.log("PASS: wrong password rejected without changing migrated ciphertext.");
} finally {
  globalThis.fetch = originalFetch;
  if (jwt && sessionId) await api("chat_sessions", `id=eq.${sessionId}`, { method: "DELETE" }).catch(() => undefined);
  if (jwt && journalId) await api("journal_entries", `id=eq.${journalId}`, { method: "DELETE" }).catch(() => undefined);
  fs.rmSync(tempDir, { recursive: true, force: true });
  if (jwt && sessionId && journalId) {
    const sessions = await api("chat_sessions", `id=eq.${sessionId}&select=id`).catch(() => null);
    const journals = await api("journal_entries", `id=eq.${journalId}&select=id`).catch(() => null);
    assert.equal(sessions?.data?.length ?? 0, 0, "synthetic chat fixture cleanup failed");
    assert.equal(journals?.data?.length ?? 0, 0, "synthetic journal fixture cleanup failed");
    console.log("PASS: synthetic chat and journal fixtures cleaned up; test-only encryption key retained for the isolated identity.");
  }
}
