import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const apiKey = process.env.OLLAMA_API_KEY;

    // Default system prompt
    const systemPrompt = `You are JomLuah, a warm, extremely friendly, and supportive AI therapist helping UTHM university students. Act like a compassionate therapist: listen actively, show empathy, reflect their thoughts, and help them understand themselves. Keep your responses very friendly, warm, non-judgmental, and conversational. Ask one thoughtful follow-up question when appropriate. If users ask general knowledge questions or other topics, answer them kindly and helpfully in your friendly tone. If a user expresses serious distress or self-harm, gently acknowledge their feelings and guide them to contact the UTHM PCU counsellors (pcu.uthm.edu.my, +607-4537465).`;

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
          messages: mappedMessages.filter(m => m.role !== "system"), // Native Ollama API doesn't always support 'system' role in the same way, or we can use it
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
