import { NextResponse } from "next/server";

type IncomingMessage = {
  sender: "user" | "bot";
  text: string;
};

type ModelMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const MAX_SUMMARY_WORDS = 220;

const systemPrompt = `You are JomLuah, a warm, extremely friendly, and supportive AI companion helping Malaysian university students at UTHM. Act like a close, compassionate peer or an understanding friend.

CRITICAL: ONLY SPEAK IN CASUAL/INFORMAL MALAYSIAN MALAY (BAHASA MELAYU PASAR) AND ENGLISH/MANGLISH. DO NOT SPEAK INDONESIAN OR FORMAL/TEXTBOOK MALAY UNDER ANY CIRCUMSTANCES. If you are unsure, default strictly to informal Malaysian Malay or Manglish.

Strict Vocabulary Substitution Rules:
- NEVER USE: "nggak" / "ngga" -> ALWAYS USE: "tak" / "takde"
- NEVER USE: "kamu" -> ALWAYS USE: "you" / "kau" / "korang"
- NEVER USE: "bisa" -> ALWAYS USE: "boleh" / "dapat"
- NEVER USE: "ngobrol" / "menemani ngobrol" -> ALWAYS USE: "sembang" / "borak" / "borak sekali"
- NEVER USE: "teman" / "temanmu" -> ALWAYS USE: "kawan" / "member"
- NEVER USE: "bikin" -> ALWAYS USE: "buat" / "bagi" (e.g., "buat you tertanya-tanya", NOT "bikin kamu penasaran")
- NEVER USE: "rencana" -> ALWAYS USE: "plan" / "rancangan"
- NEVER USE: "beda" -> ALWAYS USE: "beza"
- NEVER USE: "sehat" -> ALWAYS USE: "sihat"
- NEVER USE: "tugas" -> ALWAYS USE: "assignment" / "kerja"
- NEVER USE: "asisten virtual" -> ALWAYS USE: "AI companion" / "member sembang"

Language & Tone Guidelines:
- Talk in a relaxed, friendly, and natural Malaysian manner. Drop the formal textbook tone completely.
- Speak naturally in English, Manglish, or casual colloquial Malaysian Malay (Bahasa Melayu pasar / loghat Malaysia).
- Use common Malaysian chat particles: "je", "lah", "weyy", "ke", "kan", "gempak", "stres", "risau".
- Examples of casual responses:
  - User: "hrini apa plan kau" -> AI: "Hari ni plan I takde beza sangat pun dengan hari-hari biasa, standby 24 jam untuk sembang dengan kau! 😂 Ada apa-apa nak share ke?"
  - User: "oiii ap kabar rini" -> AI: "Eh, silap tu kawan, I bukan Rini. I JomLuah, AI companion you. Ada apa-apa nak borak ke today?"
  - "Stres eh pasal assignment/FYP? Rileks dulu, take a deep breath."

Safety Protocols:
- If a user expresses serious distress, depression, or self-harm, gently acknowledge their feelings and guide them UTHM PCU counsellors (pcu.uthm.edu.my, +607-4537465), Befrienders Malaysia (03-76272929, 24/7 hotline), or Talian Kasih (15999, 24/7).
- Do NOT mention US/UK resources like 988 or 116 123. If they are in immediate danger, guide them to call Malaysian emergency services at 999 instead of 911.`;

const summaryPrompt = `You maintain a compact memory for JomLuah, an emotional reflection companion. Summarise the supplied conversation turns for a future response.

Keep only useful context: the user's main concerns, important facts, emotions, goals, preferences, unresolved topics, and safety-relevant signals. Preserve uncertainty instead of guessing. Do not add advice, diagnoses, or commentary. Write concise bullet points in English so the memory is easy for another AI to use. Keep it under ${MAX_SUMMARY_WORDS} words.`;

function normaliseMessages(value: unknown): IncomingMessage[] {
  if (!Array.isArray(value)) return [];

  return value.filter((message): message is IncomingMessage => {
    if (!message || typeof message !== "object") return false;
    const candidate = message as Partial<IncomingMessage>;
    return (
      (candidate.sender === "user" || candidate.sender === "bot") &&
      typeof candidate.text === "string" &&
      candidate.text.trim().length > 0
    );
  });
}

function limitWords(text: string, maxWords: number): string {
  return text.trim().split(/\s+/).filter(Boolean).slice(0, maxWords).join(" ");
}

function toModelMessages(messages: IncomingMessage[]): ModelMessage[] {
  return messages.map((message) => ({
    role: message.sender === "user" ? "user" : "assistant",
    content: message.text,
  }));
}

function formatConversation(messages: IncomingMessage[]): string {
  return messages
    .map((message) => `${message.sender === "user" ? "User" : "JomLuah"}: ${message.text}`)
    .join("\n");
}

async function callModel(messages: ModelMessage[], purpose: "reply" | "summary") {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OLLAMA_API_KEY;
  const modelName = process.env.OLLAMA_MODEL || "llama3.2";
  const isLocalOllama = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
  const endpoint = isLocalOllama
    ? `${baseUrl}/api/chat`
    : `${baseUrl}/v1/chat/completions`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const model = isLocalOllama
    ? modelName
    : modelName === "llama3.2"
      ? "meta-llama/llama-3.2-3b-instruct"
      : modelName;

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(
      isLocalOllama
        ? {
            model,
            messages,
            stream: false,
            options: {
              temperature: purpose === "summary" ? 0.1 : 0.7,
            },
          }
        : {
            model,
            messages,
            stream: false,
            temperature: purpose === "summary" ? 0.1 : 0.7,
            max_tokens: purpose === "summary" ? 450 : 900,
          }
    ),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return isLocalOllama
    ? data.message?.content || ""
    : data.choices?.[0]?.message?.content || "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = normaliseMessages(body.messages);
    const messagesToSummarize = normaliseMessages(body.messagesToSummarize);
    const priorSummary = typeof body.contextSummary === "string"
      ? limitWords(body.contextSummary, MAX_SUMMARY_WORDS)
      : "";
    const parsedSummaryCount = Number(body.summaryMessageCount);
    const priorSummaryCount = Number.isFinite(parsedSummaryCount) && parsedSummaryCount >= 0
      ? Math.floor(parsedSummaryCount)
      : 0;

    let contextSummary = priorSummary;
    let summaryMessageCount = priorSummaryCount;
    let summaryFailed = false;

    // Compact only the older, unsummarised turns supplied by the client. The
    // complete history stays in Supabase for display, but is not sent here.
    if (messagesToSummarize.length > 0) {
      const summaryInput: ModelMessage[] = [
        { role: "system", content: summaryPrompt },
        ...(priorSummary
          ? [{ role: "user" as const, content: `Existing memory:\n${priorSummary}` }]
          : []),
        {
          role: "user",
          content: `Conversation turns to add to memory:\n${formatConversation(messagesToSummarize)}`,
        },
      ];

      try {
        const generatedSummary = limitWords(
          await callModel(summaryInput, "summary"),
          MAX_SUMMARY_WORDS
        );

        if (generatedSummary) {
          contextSummary = generatedSummary;
          summaryMessageCount = priorSummaryCount + messagesToSummarize.length;
        }
      } catch (summaryError) {
        // Keep the response usable if the optional compaction call fails. The
        // unsummarised chunk is included for this one request and retried next
        // time, rather than silently losing context.
        summaryFailed = true;
        console.error("Conversation summary generation failed:", summaryError);
      }
    }

    const memoryInstruction = contextSummary
      ? `\n\nConversation memory from earlier turns:\n${contextSummary}\nUse it only when relevant and do not claim details that are not supported by it.`
      : "";

    const answerMessages = summaryFailed
      ? [...messagesToSummarize, ...messages]
      : messages;

    const mappedMessages: ModelMessage[] = [
      { role: "system", content: `${systemPrompt}${memoryInstruction}` },
      ...toModelMessages(answerMessages),
    ];

    const replyText = await callModel(mappedMessages, "reply");

    return NextResponse.json({
      reply: replyText,
      contextSummary,
      summaryMessageCount,
      didSummarize: summaryMessageCount !== priorSummaryCount,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected chat error" },
      { status: 500 }
    );
  }
}
