import test from "node:test";
import assert from "node:assert/strict";
import {
  allowsMemoryForget,
  allowsMemorySave,
  containsSecretData,
  hasToolIntent,
  normaliseImportance,
  normaliseMemoryCategory,
  normaliseMemoryContent,
} from "../app/lib/aiPolicy.ts";
import { createEmbeddings, rankRecords } from "../app/lib/aiRetrieval.ts";
import { assessSafety } from "../app/lib/chatSafety.ts";

test("memory intent recognizes explicit English and BM commands", () => {
  assert.equal(hasToolIntent("Remember that my cat is Milo"), true);
  assert.equal(hasToolIntent("Tolong simpan benda ni"), true);
  assert.equal(hasToolIntent("Show my mood trend"), true);
  assert.equal(hasToolIntent("Tell me a joke"), false);
  assert.equal(allowsMemorySave("Store memory that I prefer short replies"), true);
  assert.equal(allowsMemoryForget("Forget my exam date"), true);
});

test("memory validation normalizes values and blocks credentials", () => {
  assert.equal(normaliseMemoryCategory("goal"), "goal");
  assert.equal(normaliseMemoryCategory("invalid"), "general");
  assert.equal(normaliseImportance(99), 5);
  assert.equal(normaliseImportance(-2), 1);
  assert.equal(normaliseMemoryContent(`  ${"a".repeat(1200)}  `).length, 1000);
  assert.equal(containsSecretData("Remember my password is hunter2"), true);
  assert.equal(containsSecretData("Remember my exam is Monday"), false);
});

test("safety classifier distinguishes urgent, concern, and ordinary location text", () => {
  assert.equal(assessSafety("I want to kill myself tonight").level, "urgent");
  assert.equal(assessSafety("Aku rasa putus asa sangat").level, "concern");
  assert.equal(assessSafety("I don't want to live in Kuala Lumpur").level, "none");
});

test("retrieval ranks semantic and lexical matches ahead of unrelated records", () => {
  const records = [
    { id: "exam", content: "User has a mathematics exam Monday", embedding: [1, 0], importance: 4 },
    { id: "food", content: "User likes noodles", embedding: [0, 1], importance: 5 },
  ];
  const ranked = rankRecords("exam Monday", records, [1, 0], 2);
  assert.equal(ranked[0]?.id, "exam");
});

test("Gemini embedding adapter sends a native batch request", async (context) => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  const originalModel = process.env.GEMINI_EMBED_MODEL;
  context.after(() => {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.GEMINI_EMBED_MODEL;
    else process.env.GEMINI_EMBED_MODEL = originalModel;
  });

  process.env.GEMINI_API_KEY = "test-key";
  process.env.GEMINI_EMBED_MODEL = "gemini-embedding-001";
  globalThis.fetch = async (input, init) => {
    assert.equal(
      input,
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents"
    );
    assert.equal(new Headers(init?.headers).get("x-goog-api-key"), "test-key");
    const body = JSON.parse(String(init?.body));
    assert.deepEqual(
      body.requests.map((request: { content: { parts: Array<{ text: string }> } }) =>
        request.content.parts[0]?.text
      ),
      ["first", "second"]
    );
    return Response.json({ embeddings: [{ values: [1, 0] }, { values: [0, 1] }] });
  };

  assert.deepEqual(await createEmbeddings(["first", "second"]), [[1, 0], [0, 1]]);
});
