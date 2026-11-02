type ChatMessage = {
  role: string;
  content: string | null;
  [key: string]: unknown;
};

type ChatCompletionOptions = {
  purpose: "summary" | "tools" | "recall";
  toolset?: readonly unknown[];
  toolChoice?: "auto" | "required";
  maxTokens?: number;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    };
  }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
};

export function chatProviderConfig() {
  const baseUrl = (process.env.FIQSTORE_BASE_URL || "https://rootsys.cloud/v1").replace(/\/+$/, "");
  const model = process.env.FIQSTORE_MODEL || "glm-5.3-flash";
  return { baseUrl, model };
}

export function chatProviderHeaders() {
  const apiKey = process.env.FIQSTORE_API_KEY;
  if (!apiKey) throw new Error("Chat provider is not configured");
  return { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
}

export async function callChatProvider(
  messages: ChatMessage[],
  options: ChatCompletionOptions,
  signal: AbortSignal,
): Promise<ChatCompletionResponse> {
  const headers = chatProviderHeaders();
  const { baseUrl, model } = chatProviderConfig();

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      signal,
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        max_tokens: options.maxTokens ?? (options.purpose === "summary" ? 450 : 700),
        temperature: options.purpose === "summary" ? 0.1 : 0.4,
        thinking: { type: "disabled" },
        ...(options.toolset ? {
          tools: options.toolset,
          tool_choice: options.toolChoice ?? "auto",
          parallel_tool_calls: false,
        } : {}),
      }),
    });

    if (!response.ok) throw new Error("Chat provider is temporarily unavailable");
    return await response.json() as ChatCompletionResponse;
  } catch {
    if (signal.aborted) throw new Error("Chat provider request timed out");
    throw new Error("Chat provider is temporarily unavailable");
  }
}
