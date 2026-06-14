import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const apiKey = process.env.OLLAMA_API_KEY;

    // Default system prompt instructing local Malaysian support channels, bilingual capabilities, and Manglish support
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

    const mappedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
    ];

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const modelName = process.env.OLLAMA_MODEL || "llama3.2";

    // Determine the API endpoint format (Ollama native vs OpenAI compatibility)
    // Ollama compatible endpoint usually has /v1/chat/completions or /api/chat
    const isLocalOllama = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
    const endpoint = isLocalOllama 
      ? `${baseUrl}/api/chat`
      : `${baseUrl}/v1/chat/completions`;

    const requestBody = isLocalOllama
      ? {
          model: modelName,
          messages: mappedMessages, // Send the system prompt so it enforces Malaysian/casual rules
          stream: false,
        }
      : {
          model: modelName === "llama3.2" ? "meta-llama/llama-3.2-3b-instruct" : modelName,
          messages: mappedMessages,
          stream: false,
        };

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API Error: ${response.statusText} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    let replyText = "";

    if (isLocalOllama) {
      replyText = data.message?.content || "";
    } else {
      replyText = data.choices?.[0]?.message?.content || "";
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
