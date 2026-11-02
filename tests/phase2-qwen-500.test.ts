import assert from "node:assert/strict";
import test from "node:test";
import { createEmbedding, rankRecords } from "../app/lib/aiRetrieval.ts";

test("Qwen HTTP 500 safely falls back to lexical retrieval", async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = {
    geminiApiKey: process.env.GEMINI_API_KEY,
    endpoint: process.env.EMBEDDING_API_URL,
    apiKey: process.env.EMBEDDING_API_KEY,
    model: process.env.EMBEDDING_MODEL,
  };
  let requestedUrl = "";

  process.env.GEMINI_API_KEY = "";
  process.env.EMBEDDING_API_URL = "https://qwen-stub.invalid/embeddings";
  process.env.EMBEDDING_API_KEY = "test-only-not-a-real-key";
  process.env.EMBEDDING_MODEL = "qwen-test-model";
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify({ error: "simulated provider failure" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const embedding = await createEmbedding("How did my exam preparation go?");
    assert.equal(requestedUrl, "https://qwen-stub.invalid/embeddings");
    assert.equal(embedding, null);

    const retrieved = rankRecords(
      "exam preparation",
      [
        { id: "journal-exam", content: "I started exam preparation early", embedding: [1, 0] },
        { id: "journal-garden", content: "I watered the garden this morning", embedding: [0, 1] },
      ],
      embedding,
      5,
    );
    assert.deepEqual(retrieved.map(({ id }) => id), ["journal-exam"]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalEnv.geminiApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalEnv.geminiApiKey;
    if (originalEnv.endpoint === undefined) delete process.env.EMBEDDING_API_URL;
    else process.env.EMBEDDING_API_URL = originalEnv.endpoint;
    if (originalEnv.apiKey === undefined) delete process.env.EMBEDDING_API_KEY;
    else process.env.EMBEDDING_API_KEY = originalEnv.apiKey;
    if (originalEnv.model === undefined) delete process.env.EMBEDDING_MODEL;
    else process.env.EMBEDDING_MODEL = originalEnv.model;
  }
});
