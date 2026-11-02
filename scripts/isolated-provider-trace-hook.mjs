import { appendFileSync } from "node:fs";

const originalFetch = globalThis.fetch;
const tracePath = process.env.JOMLUAH_TEST_TRACE_FILE;

if (tracePath) {
  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input.toString() : input.url);
    const provider = url.hostname === "openrouter.ai" && url.pathname.endsWith("/embeddings")
      ? "qwen"
      : url.hostname === "rootsys.cloud" && url.pathname.includes("/chat/completions")
        ? "fiqstore"
      : url.hostname === "api.deepseek.com" ? "deepseek" : null;
    if (!provider) return originalFetch(input, init);

    const requestBody = typeof init?.body === "string" ? JSON.parse(init.body) : {};
    const started = performance.now();
    try {
      const response = await originalFetch(input, init);
      const trace = {
        provider,
        operation: provider === "qwen" ? "embedding" : requestBody.stream ? "answer_stream" : "tool_planning",
        model: requestBody.model || null,
        status: response.status,
        latency_ms: Math.round(performance.now() - started),
        input_count: provider === "qwen" && Array.isArray(requestBody.input) ? requestBody.input.length : undefined,
      };
      if ((provider === "deepseek" || provider === "fiqstore") && !requestBody.stream && response.ok) {
        const payload = await response.clone().json().catch(() => ({}));
        const toolCalls = payload.choices?.[0]?.message?.tool_calls || [];
        trace.usage = payload.usage || null;
        trace.tool_calls = toolCalls.map((call) => {
          let args = call.function?.arguments || null;
          if (typeof args === "string") {
            try { args = JSON.parse(args); } catch { args = "[invalid JSON arguments]"; }
          }
          return { name: call.function?.name || null, arguments: args };
        });
      }
      appendFileSync(tracePath, `${JSON.stringify(trace)}\n`);
      return response;
    } catch (error) {
      appendFileSync(tracePath, `${JSON.stringify({
        provider,
        operation: provider === "qwen" ? "embedding" : requestBody.stream ? "answer_stream" : "tool_planning",
        model: requestBody.model || null,
        status: null,
        latency_ms: Math.round(performance.now() - started),
        error: error instanceof Error ? error.name : "request_failed",
      })}\n`);
      throw error;
    }
  };
}
