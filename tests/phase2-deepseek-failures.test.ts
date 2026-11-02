import assert from "node:assert/strict";
import test from "node:test";
import { callChatProvider } from "../app/lib/chatProviderClient.ts";

const privateFixture = "synthetic-private-memory-fixture";

async function withProviderStub(
  stub: (request: Request) => Promise<Response>,
  run: (state: { requestCount: () => number }) => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  const originalEnv = {
    key: process.env.FIQSTORE_API_KEY,
    baseUrl: process.env.FIQSTORE_BASE_URL,
    model: process.env.FIQSTORE_MODEL,
  };
  let requests = 0;
  process.env.FIQSTORE_API_KEY = "test-only-not-a-real-key";
  process.env.FIQSTORE_BASE_URL = "https://fiqstore-stub.invalid/v1";
  process.env.FIQSTORE_MODEL = "glm-test-model";
  globalThis.fetch = async (input, init) => {
    requests += 1;
    return stub(new Request(input, init));
  };

  try {
    await run({ requestCount: () => requests });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalEnv.key === undefined) delete process.env.FIQSTORE_API_KEY;
    else process.env.FIQSTORE_API_KEY = originalEnv.key;
    if (originalEnv.baseUrl === undefined) delete process.env.FIQSTORE_BASE_URL;
    else process.env.FIQSTORE_BASE_URL = originalEnv.baseUrl;
    if (originalEnv.model === undefined) delete process.env.FIQSTORE_MODEL;
    else process.env.FIQSTORE_MODEL = originalEnv.model;
  }
}

const requestSignal = () => AbortSignal.timeout(1_000);

test("FiqStore HTTP 429 is sanitized and does not retry or invent memory", async () => {
  await withProviderStub(async () => new Response(JSON.stringify({
    error: `rate limited; ${privateFixture}; test-only-not-a-real-key`,
  }), { status: 429 }), async ({ requestCount }) => {
    await assert.rejects(
      callChatProvider([{ role: "user", content: privateFixture }], { purpose: "recall" }, requestSignal()),
      (error: Error) => {
        assert.equal(error.message, "Chat provider is temporarily unavailable");
        assert.equal(error.message.includes(privateFixture), false);
        assert.equal(error.message.includes("test-only-not-a-real-key"), false);
        return true;
      },
    );
    assert.equal(requestCount(), 1);
  });
});

test("FiqStore HTTP 500 is sanitized and does not retry or invent memory", async () => {
  await withProviderStub(async () => new Response(JSON.stringify({
    error: `server error; ${privateFixture}; test-only-not-a-real-key`,
  }), { status: 500 }), async ({ requestCount }) => {
    await assert.rejects(
      callChatProvider([{ role: "user", content: privateFixture }], { purpose: "recall" }, requestSignal()),
      (error: Error) => {
        assert.equal(error.message, "Chat provider is temporarily unavailable");
        assert.equal(error.message.includes(privateFixture), false);
        assert.equal(error.message.includes("test-only-not-a-real-key"), false);
        return true;
      },
    );
    assert.equal(requestCount(), 1);
  });
});

test("FiqStore timeout aborts the request once and returns a sanitized failure", async () => {
  await withProviderStub((request) => new Promise<Response>((_resolve, reject) => {
    request.signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
  }), async ({ requestCount }) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10);
    await assert.rejects(
      callChatProvider([{ role: "user", content: privateFixture }], { purpose: "recall" }, controller.signal),
      (error: Error) => {
        assert.equal(error.message, "Chat provider request timed out");
        assert.equal(error.message.includes(privateFixture), false);
        assert.equal(error.message.includes("test-only-not-a-real-key"), false);
        return true;
      },
    );
    assert.equal(requestCount(), 1);
  });
});
