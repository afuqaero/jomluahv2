import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createEmbeddings, rankRecords } from "../app/lib/aiRetrieval.ts";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());

const documents = [
  { id: "SYN-APPT-1", content: "A student may request to reschedule a counselling appointment at least 24 hours before the appointment." },
  { id: "SYN-APPT-2", content: "A student can cancel a counselling appointment at any time. Cancellation does not automatically book a replacement." },
  { id: "SYN-PRIV-1", content: "Counsellors can view only mood check-ins shared by students assigned to them. They cannot read private chats or journal entries." },
  { id: "SYN-PRIV-2", content: "A student may withdraw consent for counsellor mood sharing. After consent is withdrawn, new mood check-ins are not shared." },
  { id: "SYN-SAFE-1", content: "The companion is a supportive reflection tool, not a therapist, doctor, or emergency service. It must not diagnose or prescribe medication." },
  { id: "SYN-SAFE-2", content: "If a user indicates immediate danger, the companion should encourage immediate local emergency support and contact with a trusted person." },
  { id: "SYN-TECH-1", content: "The JomLuah Recall Agent can search a signed-in user's saved memories and journal excerpts, with a maximum of two read-only searches per reply." },
  { id: "SYN-TECH-2", content: "The agent must not search encrypted chat history, other users' records, or counsellor and administrator data." },
  { id: "SYN-CANARY-1", content: "Synthetic evaluation canary: fictional support-room code is KESTREL-4827. This is invented test data and not a real JomLuah policy." },
  { id: "SYN-RET-1", content: "Saved vectors must be regenerated when changing embedding models because vectors from different models or dimensions cannot be compared." },
  { id: "SYN-DIST-1", content: "A student must consent before their morning or evening mood check-ins are visible to their assigned counsellor." },
  { id: "SYN-DIST-2", content: "Admins manage roles and counselor assignments but cannot view student mood check-ins, journals, or chat content." },
];

const pairs = [
  ["SYN-APPT-1", ["How early do I need to ask to move a counselling session?", "Nak tukar sesi kaunseling, berapa awal kena minta?", "Can I reshedul my counselling appointment the day before?", "What is the minimum notice for changing a booked session?"]],
  ["SYN-APPT-2", ["If I cancel, will the system automatically give me a new slot?", "Kalau cancel appointment, slot baru auto book ke?", "I need to drop the session; does that create another booking?", "What happens to a replacement appointment when I cancel?"]],
  ["SYN-PRIV-1", ["Can my counsellor read what I wrote privately in my diary?", "Kaunselor boleh baca chat dengan jurnal peribadi saya tak?", "Will staff see my AI conversations or only my shared feelings data?", "What information is hidden from a counsellor?"]],
  ["SYN-PRIV-2", ["How do I stop sharing my mood check-ins?", "Kalau saya tarik consent mood, apa jadi lepas tu?", "Can I revoke permission for counselors to see future moods?", "Does opting out prevent new mood entries from being shared?"]],
  ["SYN-SAFE-1", ["Can JomLuah diagnose my anxiety or tell me what medicine to take?", "Boleh AI ni bagi diagnosis atau prescribe ubat?", "Is the companion a licensed therapist?", "Can I rely on this app as emergency medical care?"]],
  ["SYN-SAFE-2", ["What should the companion do if someone says they're in immediate danger?", "Kalau saya dalam bahaya sekarang, apa patut dibuat?", "A user says there is an urgent threat; what response is required?", "How should JomLuah handle an immediate safety crisis?"]],
  ["SYN-TECH-1", ["How many private-history searches can the Recall Agent make?", "Agent boleh search memori saya berapa kali satu reply?", "Can it search saved memory and journal notes, and is there a limit?", "What does the recall helper look up for a signed-in person?"]],
  ["SYN-TECH-2", ["Can the recall helper look through other students' records or encrypted chats?", "Agent boleh baca chat encrypted atau data orang lain ke?", "Which data sources must the agent be denied access to?", "Can the assistant inspect admin records while recalling a memory?"]],
  ["SYN-CANARY-1", ["What is the fictional support-room canary code?", "Bagi kod canary rekaan dalam dokumen ujian.", "Tell me the invented Kestrel room identifier from the test note.", "What random code appears in the synthetic evaluation canary?"]],
  ["SYN-RET-1", ["Do old vectors still work after switching embedding models?", "Tukar model embedding kena generate balik vector lama tak?", "Why would we re-embed after changing vector providers?", "Can cosine search compare embeddings from different models?"]],
];

const cases = pairs.flatMap(([id, questions]) => questions.map((query, index) => ({
  id: `${id}-Q${index + 1}`, query, language: index === 1 ? "ms/manglish" : "en/mixed", relevant_doc_ids: [id], answerable: true,
})));
const allTexts = [...documents.map((doc) => doc.content), ...cases.map((item) => item.query)];
const vectors = await createEmbeddings(allTexts, AbortSignal.timeout(90_000));
if (vectors.length !== allTexts.length || vectors.some((vector) => !vector)) throw new Error("Embedding generation returned missing vectors.");
const docRows = documents.map((doc, index) => ({ ...doc, embedding: vectors[index] }));
const results = cases.map((item) => {
  const queryEmbedding = vectors[documents.length + cases.indexOf(item)];
  const ranked = rankRecords(item.query, docRows, queryEmbedding, 10).map((doc, index) => ({
    id: doc.id,
    rank: index + 1,
    cosine: Number((doc.embedding.reduce((sum, value, i) => sum + value * queryEmbedding[i], 0)).toFixed(5)),
  }));
  return { ...item, top1: ranked[0]?.id ?? null, top3: ranked.slice(0, 3).map((entry) => entry.id), top5: ranked.slice(0, 5).map((entry) => entry.id), ranked };
});
const summary = (k) => {
  const hits = results.filter((item) => item.relevant_doc_ids.some((id) => item[`top${k}`].includes(id)));
  const reciprocalRanks = results.map((item) => {
    const found = item.ranked.find((row) => item.relevant_doc_ids.includes(row.id));
    return found ? 1 / found.rank : 0;
  });
  return {
    hitRate: Number((hits.length / results.length).toFixed(4)),
    recall: Number((hits.length / results.length).toFixed(4)),
    meanReciprocalRank: Number((reciprocalRanks.reduce((a, b) => a + b, 0) / results.length).toFixed(4)),
  };
};
const outputDir = "test-results/jomluah-llm";
await mkdir(outputDir, { recursive: true });
await writeFile(`${outputDir}/rag_cases.jsonl`, cases.map((item) => JSON.stringify(item)).join("\n") + "\n");
await writeFile(`${outputDir}/retrieval_results.jsonl`, results.map((item) => JSON.stringify(item)).join("\n") + "\n");
await writeFile(`${outputDir}/architecture.md`, `# Verified Architecture Inventory\n\n- Commit: ${process.env.GIT_COMMIT || "85020a8"}\n- Chat: authenticated Next.js /api/chat; DeepSeek key required for live response tests.\n- Embeddings: OpenRouter endpoint configured locally with Qwen3 Embedding 8B; embedding response used to populate JSONB vectors and cosine-ranked with lexical fallback in app/lib/aiRetrieval.ts.\n- Persistence: Neon Data API; memories/journal rows filtered by signed-in user_id, with user preference gates. No isolated test database/namespace used.\n- Agent: JomLuah Recall Agent, read-only memory/journal search, max two searches; production activation gated by RECALL_AGENT_ENABLED=true.\n- Evaluation run uses only in-memory synthetic fixtures and does not write to Neon.\n`);
await writeFile(`${outputDir}/rag_answer_results.jsonl`, "BLOCKED: live DeepSeek key is not configured in local .env.local; no answer-generation results fabricated.\n");
await writeFile(`${outputDir}/agent_tool_results.jsonl`, "BLOCKED: no authenticated isolated Neon test user or live DeepSeek key available; orchestration unit tests exist, but no real tool-call traces were run.\n");
await writeFile(`${outputDir}/safety_privacy_results.md`, `# Safety and Privacy Test Coverage\n\n- Synthetic retrieval corpus only; no real student data was accessed.\n- Source inspection confirms user_id filters for memory and journal searches and preferences gate source selection.\n- No cross-user database isolation test was run because no isolated test tenant was available.\n- Live mental-health response/safety endpoint tests were not run because the DeepSeek key is not present locally.\n- Do not interpret this simulated retrieval run as a production privacy or safety certification.\n`);
const report = `# JomLuah LLM & RAG Test Report\n\n## Verdict\nCONDITIONAL — retrieval-only synthetic evaluation executed; live database, full-chat, tool, and safety suites are blocked.\n\n## What was actually executed\n- Environment: local workspace; synthetic in-memory corpus; no Neon writes\n- Repo/commit: ${process.env.GIT_COMMIT || "85020a8"}\n- LLM / embedding model: full LLM not run; Qwen3 Embedding 8B through configured OpenRouter endpoint\n- Retrieval stack / index: app/lib/aiRetrieval.ts cosine-plus-lexical ranking; no vector database/index in this isolated evaluation\n- Number of test queries: ${cases.length}\n- Number of tool traces: 0 (blocked)\n- Vector dimensions: ${vectors[0].length}\n\n## Retrieval metrics\n| Category | Cases | Hit@1 | Hit@3 | Hit@5 | Recall@5 | MRR@5 | p95 latency |\n|---|---:|---:|---:|---:|---:|---:|---:|\n| Synthetic mixed-language queries | ${cases.length} | ${summary(1).hitRate} | ${summary(3).hitRate} | ${summary(5).hitRate} | ${summary(5).recall} | ${summary(5).meanReciprocalRank} | Not instrumented |\n\n## Grounding and abstention\n- Grounded correct: NOT RUN (no live chat model key)\n- Retrieval failures: ${results.filter((item) => !item.relevant_doc_ids.some((id) => item.top5.includes(id))).length} retrieval misses at top 5\n- Generation/grounding failures: NOT RUN\n- Proper abstentions on no-answer queries: NOT RUN\n\n## Agentic behavior\n- Correct tool-use rate: NOT RUN; no real tool traces\n- Unit coverage: two-search limit, stop behavior, disabled-source guard, repeat-query guard\n- Permission/isolation: source-code filters inspected; live isolation tests NOT RUN\n\n## Safety and privacy\n- Critical findings observed: none in this retrieval-only synthetic run; this is not a security assurance\n- Cross-user leakage: NOT RUN against database\n- Crisis-policy coverage: source inspected only; live model behavior NOT RUN\n\n## Coverage limitations / NOT RUN\n- The synthetic fixture verifies the embedding call and ranker, not Neon ingestion, persistence, filters at runtime, or full production retrieval.\n- DeepSeek live answer generation unavailable locally.\n- No production data queried, mutated, re-embedded, or migrated.\n- Synthetic BM/English queries are a small sanity set, not a representative multilingual benchmark.\n\n## Next regression commands\n- npm run test:backend\n- Rerun node scripts/run-synthetic-rag-eval.mjs after configuring valid local embedding credentials\n- For end-to-end checks, use a dedicated test user/database branch and configure a valid DeepSeek key; never use student data.\n`;
await writeFile(`${outputDir}/report.md`, report);
console.log(JSON.stringify({ model: process.env.EMBEDDING_MODEL, dimensions: vectors[0].length, cases: cases.length, hit1: summary(1).hitRate, hit3: summary(3).hitRate, hit5: summary(5).hitRate, mrr5: summary(5).meanReciprocalRank, misses: results.filter((item) => !item.relevant_doc_ids.some((id) => item.top5.includes(id))).map((item) => item.id), outputDir }, null, 2));
