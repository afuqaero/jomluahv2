type DeepSeekMessage = {
  role: string;
  content: string | null;
  [key: string]: unknown;
};

type DeepSeekOptions = {
  purpose: "summary" | "tools" | "recall";
  toolset?: readonly unknown[];
  toolChoice?: "auto" | "required";
  maxTokens?: number;
};

type DeepSeekResponse = {
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

export function deepSeekHeaders() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DeepSeek is not configured");
  return { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
}

export async function callDeepSeek(
  messages: DeepSeekMessage[],
  options: DeepSeekOptions,
  signal: AbortSignal,
): Promise<DeepSeekResponse> {
  const headers = deepSeekHeaders();

  const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
  const model = process.env.DEEPSEEK_MODEL || "deepseek-flash";

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
        reasoning_effort: "none",
        ...(options.toolset ? {
          tools: options.toolset,
          tool_choice: options.toolChoice ?? "auto",
          parallel_tool_calls: false,
        } : {}),
      }),
    });

    if (!response.ok) throw new Error("DeepSeek is temporarily unavailable");
    return await response.json() as DeepSeekResponse;
  } catch {
    if (signal.aborted) throw new Error("DeepSeek request timed out");
    throw new Error("DeepSeek is temporarily unavailable");
  }
}
