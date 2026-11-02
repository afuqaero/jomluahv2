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
import { planRetrieval, shouldUseRecallAgent } from "../app/lib/aiRetrievalPlan.ts";
import { runRecallAgent, type RecallHit } from "../app/lib/recallAgent.ts";
import { assessSafety, getSafetyFallback, shouldRetrieveForSafety } from "../app/lib/chatSafety.ts";

test("memory intent recognizes explicit English and BM commands", () => {
  assert.equal(hasToolIntent("Remember that my cat is Milo"), true);
  assert.equal(hasToolIntent("Tolong simpan benda ni"), true);
  assert.equal(hasToolIntent("Show my mood trend"), true);
  assert.equal(hasToolIntent("Tell me a joke"), false);
  assert.equal(allowsMemorySave("Store memory that I prefer short replies"), true);
  assert.equal(allowsMemoryForget("Forget my exam date"), true);
  assert.equal(allowsMemorySave("Do you remember my exam date?"), false);
  assert.equal(allowsMemorySave("I remember feeling anxious"), false);
  assert.equal(allowsMemoryForget("Did you forget my exam date?"), false);
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

test("crisis classifier catches current English, Malay, Manglish, and informal spelling", () => {
  const urgentPhrases = [
    "I want to end my life tonight",
    "I feel like ending everything tonight",
    "I'm suicidal and I might do it now",
    "Saya rasa nak bunuh diri",
    "Aku dah tak sanggup hidup lagi",
    "I tak nak hidup lagi",
    "Aku taknak hidup",
    "I rasa nak mati",
    "I wanna sleep and never wake up",
    "I wish I were dead",
    "suisidal thoughts are back",
    "I wanna d1e and be done",
  ];
  for (const phrase of urgentPhrases) assert.equal(assessSafety(phrase).level, "urgent", phrase);
});

test("crisis classifier catches indirect risk and routes uncertain language to concern", () => {
  const urgentPhrases = [
    "Everyone would be better off without me",
    "Everyone would be better without me",
    "There is no reason for me to keep living",
    "I hope I don't wake up tomorrow",
    "Kalau aku tak ada, semua orang lagi senang",
    "Aku penat hidup dan nak mati",
  ];
  for (const phrase of urgentPhrases) assert.equal(assessSafety(phrase).level, "urgent", phrase);
  for (const phrase of ["I just want to disappear", "I can't do this anymore", "I want everything to stop", "I rasa macam nak hilang"])
    assert.equal(assessSafety(phrase).level, "concern", phrase);
});

test("crisis classifier avoids false urgent alerts for denials, historical, quoted, and unrelated mentions", () => {
  const nonePhrases = [
    "I don't want to live in Kuala Lumpur",
    "I am not suicidal and I do not want to hurt myself",
    "My friend said, ‘I want to die’, and I am helping them find support",
    "The character said, ‘I want to die’, in the novel we are reading",
    "The article discusses suicide prevention",
    "I used to feel suicidal years ago, but I am safe now and those thoughts are gone",
    "I am not depressed; I feel okay today",
  ];
  for (const phrase of nonePhrases) assert.notEqual(assessSafety(phrase).level, "urgent", phrase);
  assert.equal(assessSafety(nonePhrases[0]).level, "none");
  assert.equal(assessSafety(nonePhrases[1]).level, "none");
  assert.equal(assessSafety(nonePhrases[2]).level, "none");
  assert.equal(assessSafety(nonePhrases[3]).level, "none");
  assert.equal(assessSafety(nonePhrases[4]).level, "none");
  assert.equal(assessSafety(nonePhrases[5]).level, "concern");
  assert.equal(assessSafety(nonePhrases[6]).level, "none");
});

test("urgent risk bypasses retrieval and safety fallback remains available without a provider", () => {
  assert.equal(shouldRetrieveForSafety("urgent"), false);
  assert.equal(shouldRetrieveForSafety("concern"), false);
  assert.equal(shouldRetrieveForSafety("none"), true);
  assert.match(getSafetyFallback("urgent") || "", /999/);
  assert.match(getSafetyFallback("concern") || "", /safe right now/i);
  assert.equal(getSafetyFallback("none"), null);
});

test("retrieval ranks semantic and lexical matches ahead of unrelated records", () => {
  const records = [
    { id: "exam", content: "User has a mathematics exam Monday", embedding: [1, 0], importance: 4 },
    { id: "food", content: "User likes noodles", embedding: [0, 1], importance: 5 },
  ];
  const ranked = rankRecords("exam Monday", records, [1, 0], 2);
  assert.equal(ranked[0]?.id, "exam");
  assert.deepEqual(rankRecords("exam", [{ id: "unrelated", content: "The weather is sunny", importance: 5 }], null, 1), []);
});

test("adaptive retrieval skips fresh chat and routes history requests", () => {
  assert.deepEqual(planRetrieval("Hi, how are you?"), { memories: false, journals: false });
  assert.deepEqual(planRetrieval("I feel overwhelmed with assignments today"), { memories: false, journals: false });
  assert.deepEqual(planRetrieval("What do you remember about my exams?"), { memories: true, journals: false });
  assert.deepEqual(planRetrieval("What did I write in my journal?"), { memories: false, journals: true });
  assert.deepEqual(planRetrieval("Show my mood trend"), { memories: false, journals: true });
  assert.deepEqual(planRetrieval("I feel anxious about exams again"), { memories: true, journals: true });
  assert.deepEqual(planRetrieval("Ingat tak apa saya cakap hari tu?"), { memories: true, journals: true });
  assert.deepEqual(planRetrieval("What was I stressed about last week?"), { memories: true, journals: true });
  assert.deepEqual(planRetrieval("How have I been feeling lately?"), { memories: false, journals: true });
  assert.equal(shouldUseRecallAgent("Hi, how are you?"), false);
  assert.equal(shouldUseRecallAgent("I feel anxious about exams again"), true);
  assert.equal(shouldUseRecallAgent("What did I write in my journal?"), true);
  assert.equal(shouldUseRecallAgent("Remember that I prefer short replies"), false);
  assert.equal(shouldUseRecallAgent("Ingat tak apa saya cakap hari tu?"), true);
  assert.equal(shouldUseRecallAgent("Show my mood trend"), false);
});

const journalRecallQuestions = [
  ["BM1", "Ingat tak apa yang buat saya rasa dekat dengan family masa mula duduk kampus?"],
  ["MM1", "Assignment tengah bertimbun tu, what small thing made me start ah?"],
  ["M2", "What helped me feel more comfortable speaking up, from my presentation and discussion group notes?"],
];

for (const [caseId, question] of journalRecallQuestions) {
  test(`${caseId} autobiographical recall routes to journal search`, () => {
    assert.deepEqual(planRetrieval(question), { memories: false, journals: true }, question);
    assert.equal(shouldUseRecallAgent(question), true, question);
  });
}

test("ordinary and advice-seeking conversations do not trigger recall", () => {
  const noRecallQuestions = [
    "I feel overwhelmed with assignments today.",
    "What can help me start my assignment now?",
    "I feel nervous about speaking in class.",
    "Can you help me calm down tonight?",
  ];
  for (const question of noRecallQuestions) {
    assert.deepEqual(planRetrieval(question), { memories: false, journals: false }, question);
    assert.equal(shouldUseRecallAgent(question), false, question);
  }
});

test("recall agent searches at most twice and stops when evidence is sufficient", async () => {
  const seen: string[] = [];
  const result = await runRecallAgent(
    ["journal", "memory"],
    async (step) => {
      if (step.searches.length === 0) return { source: "journal", query: "exam" };
      assert.equal(step.hits[0]?.citation, "[Journal: Exam week | 2026-10-01]");
      return null;
    },
    async (request): Promise<RecallHit[]> => {
      seen.push(request.source);
      return [{ source: "journal", id: "entry-1", citation: "[Journal: Exam week | 2026-10-01]", snippet: "I felt worried about exams." }];
    }
  );
  assert.deepEqual(seen, ["journal"]);
  assert.equal(result.hits.length, 1);

  const twoStep = await runRecallAgent(
    ["journal", "memory"],
    async (step) => ({ source: step.searches.length === 0 ? "journal" : "memory", query: "exam" }),
    async (request) => {
      seen.push(request.source);
      return [{ source: request.source, id: request.source, citation: "[Saved memory]", snippet: "Exam" }];
    }
  );
  assert.equal(twoStep.searches.length, 2);
  assert.deepEqual(seen, ["journal", "journal", "memory"]);
});

test("recall agent cannot use a disabled source or repeat a search", async () => {
  let searches = 0;
  const blocked = await runRecallAgent(
    ["memory"],
    async () => ({ source: "journal", query: "exam" }),
    async () => { searches += 1; return []; }
  );
  assert.equal(searches, 0);
  assert.deepEqual(blocked.hits, []);

  const repeated = await runRecallAgent(
    ["memory"],
    async () => ({ source: "memory", query: "exam" }),
    async () => { searches += 1; return []; }
  );
  assert.equal(searches, 1);
  assert.equal(repeated.searches.length, 1);
});

test("two-step recall can recover an entry missed by the original broad query", async () => {
  const journal = { id: "exam-entry", content: "I felt overwhelmed by my mathematics exam", embedding: null };
  assert.deepEqual(rankRecords("Was it like last time?", [journal], null, 3), []);
  const result = await runRecallAgent(
    ["journal"],
    async (step) => ({ source: "journal", query: step.searches.length === 0 ? "last time" : "mathematics exam" }),
    async (request) => rankRecords(request.query, [journal], null, 3).map((record) => ({
      source: "journal", id: record.id, citation: "[Journal: Exam week | 2026-10-01]", snippet: record.content,
    }))
  );
  assert.equal(result.searches.length, 2);
  assert.equal(result.hits[0]?.citation, "[Journal: Exam week | 2026-10-01]");
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
