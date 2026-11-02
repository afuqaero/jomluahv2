import assert from "node:assert/strict";
import test from "node:test";
import { callDeepSeek } from "../app/lib/deepseekClient.ts";

const privateFixture = "synthetic-private-memory-fixture";

async function withProviderStub(
  stub: (request: Request) => Promise<Response>,
  run: (state: { requestCount: () => number }) => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  const originalEnv = {
    key: process.env.DEEPSEEK_API_KEY,
    baseUrl: process.env.DEEPSEEK_BASE_URL,
    model: process.env.DEEPSEEK_MODEL,
  };
  let requests = 0;
  process.env.DEEPSEEK_API_KEY = "test-only-not-a-real-key";
  process.env.DEEPSEEK_BASE_URL = "https://deepseek-stub.invalid";
  process.env.DEEPSEEK_MODEL = "test-model";
  globalThis.fetch = async (input, init) => {
    requests += 1;
    return stub(new Request(input, init));
  };

  try {
    await run({ requestCount: () => requests });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalEnv.key === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = originalEnv.key;
    if (originalEnv.baseUrl === undefined) delete process.env.DEEPSEEK_BASE_URL;
    else process.env.DEEPSEEK_BASE_URL = originalEnv.baseUrl;
    if (originalEnv.model === undefined) delete process.env.DEEPSEEK_MODEL;
    else process.env.DEEPSEEK_MODEL = originalEnv.model;
  }
}

const requestSignal = () => AbortSignal.timeout(1_000);

test("DeepSeek HTTP 429 is sanitized and does not retry or invent memory", async () => {
  await withProviderStub(async () => new Response(JSON.stringify({
    error: `rate limited; ${privateFixture}; test-only-not-a-real-key`,
  }), { status: 429 }), async ({ requestCount }) => {
    await assert.rejects(
      callDeepSeek([{ role: "user", content: privateFixture }], { purpose: "recall" }, requestSignal()),
      (error: Error) => {
        assert.equal(error.message, "DeepSeek is temporarily unavailable");
        assert.equal(error.message.includes(privateFixture), false);
        assert.equal(error.message.includes("test-only-not-a-real-key"), false);
        return true;
      },
    );
    assert.equal(requestCount(), 1);
  });
});

test("DeepSeek HTTP 500 is sanitized and does not retry or invent memory", async () => {
  await withProviderStub(async () => new Response(JSON.stringify({
    error: `server error; ${privateFixture}; test-only-not-a-real-key`,
  }), { status: 500 }), async ({ requestCount }) => {
    await assert.rejects(
      callDeepSeek([{ role: "user", content: privateFixture }], { purpose: "recall" }, requestSignal()),
      (error: Error) => {
        assert.equal(error.message, "DeepSeek is temporarily unavailable");
        assert.equal(error.message.includes(privateFixture), false);
        assert.equal(error.message.includes("test-only-not-a-real-key"), false);
        return true;
      },
    );
    assert.equal(requestCount(), 1);
  });
});

test("DeepSeek timeout aborts the request once and returns a sanitized failure", async () => {
  await withProviderStub((request) => new Promise<Response>((_resolve, reject) => {
    request.signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
  }), async ({ requestCount }) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10);
    await assert.rejects(
      callDeepSeek([{ role: "user", content: privateFixture }], { purpose: "recall" }, controller.signal),
      (error: Error) => {
        assert.equal(error.message, "DeepSeek request timed out");
        assert.equal(error.message.includes(privateFixture), false);
        assert.equal(error.message.includes("test-only-not-a-real-key"), false);
        return true;
      },
    );
    assert.equal(requestCount(), 1);
  });
});
