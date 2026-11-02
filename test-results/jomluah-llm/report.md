# JomLuah RAG and Agent Evaluation — Continued

## Executive verdict

**Overall: NOT TESTED end-to-end.** The synthetic Qwen embedding/ranker slice and backend unit suite pass. This continuation measured local ranker CPU/heap behavior only. No isolated database was available, so PostgreSQL comparison, DB retrieval, real agent calls, grounding, cross-user execution isolation, and live mental-health safety remain untested. No production credentials were used, no production data was queried or changed, and no frontend or app source was modified.

## Architecture findings

- Embedding: OpenAI-compatible endpoint/model configured for Qwen3 Embedding 8B previously returned 4096D vectors on synthetic text. Gemini takes precedence if `GEMINI_API_KEY` is present.
- Storage/retrieval: Neon Data API stores embeddings as JSONB arrays. Application fetches latest 100 records per enabled source and computes cosine + lexical + importance. No PostgreSQL vector search/index or separate reranker is integrated.
- Scoring/limits: `0.70*cosine + 0.25*lexical + 0.05*importance`; pass threshold is cosine >0.25 OR any lexical overlap. Results are capped at 6 memories/4 journals. Journal candidates are first narrowed to 12 via lexical-only rank before embedding missing vectors and semantic reranking.
- Agent: `JomLuah Recall Agent` uses DeepSeek for a maximum of two read-only tool searches, up to three results each. Source allowlist, preferences, authenticated user ID filtering, 160-character query cap, and duplicate-search guard are implemented. Urgent classified messages bypass retrieval.
- Privacy concern: inspected schema stores journal title, mood, excerpt, tags, and embeddings as plaintext text/JSONB. The chat encryption migration does not cover those fields. This is code/schema inspection only; no user record was opened.
- Model compatibility: current path accepts 4096D JSONB arrays. Standard pgvector HNSW/IVFFlat indexed types documented upstream support up to 2,000D `vector` and 4,000D `halfvec`; 4096D cannot be directly indexed with those standard indexed representations. No architecture change was made.

## Executed results

### Previously executed synthetic quality/provider evaluation

| Measure | Result | Verdict |
|---|---:|---|
| Qwen embedding calls | 40 query + 12 document synthetic vectors, 4096D | PASS (provider only) |
| Recall@1 | 95% | PASS (synthetic only) |
| Recall@3 | 97.5% | PASS (synthetic only) |
| Recall@5 | 100% | PASS (synthetic only) |
| MRR@5 | 0.9688 | PASS (synthetic only) |
| Backend tests | 13/13 passed on this continuation | PASS (unit level) |

These are in-memory, single-known-relevant-document fixture results, not production corpus recall. The original fixture did not include unsupported-question abstention or a representative number of spelling/indirect-language cases.

### New local ranker performance benchmark

Synthetic deterministic 4096D vectors; 40 queries/corpus; current `rankRecords` implementation; Node process, no database/provider calls. Burst latency includes queue delay from concurrent promises processed by one synchronous JS event loop; it is not a multi-worker server benchmark. Heap/RSS deltas are process-level snapshots and RSS is GC-sensitive.

| Corpus | Heap delta | Burst-1 avg / p50 / p95 | Burst-4 avg / p50 / p95 | Burst-8 avg / p50 / p95 |
|---:|---:|---:|---:|---:|
| 100 | 3.34 MiB | 4.68 / 4.68 / 4.96 ms | 11.46 / 9.69 / 18.46 ms | 19.47 / 18.61 / 34.31 ms |
| 500 | 17.62 MiB | 23.29 / 23.38 / 25.06 ms | 50.16 / 45.07 / 93.86 ms | 29.79 / 27.55 / 53.37 ms |
| 1,000 | 39.91 MiB | 29.59 / 15.04 / 72.45 ms | 36.59 / 37.86 / 65.55 ms | 64.75 / 63.12 / 121.80 ms |

The high variance and non-monotonic burst averages indicate this small single-process microbenchmark is directional only. At 1,000 vectors the app ranker holds about 40 MiB additional heap for synthetic arrays; this excludes DB client payloads, other app memory, and server concurrency. Do not use it to claim a production capacity or choose an index. Raw output and reproducible script: `local_ranker_benchmark.json`, `scripts/benchmark-rag-ranker.mjs`.

## Blocked tests and exact missing configuration

| Test | Verdict | Reason / next prerequisite |
|---|---|---|
| Isolated Neon database retrieval and filters | NOT TESTED | No test-only Neon URL/tenant; existing DB config deliberately not used. Provision a fresh empty test project/branch with synthetic identities and records. |
| JSONB app-side vs PostgreSQL exact similarity | NOT TESTED | No PostgreSQL server/client, Docker, Neon CLI, or DB test endpoint. The benchmark above is not a substitute. |
| Concurrent DB query p50/p95 and DB memory | NOT TESTED | Requires isolated DB and reproducible data seeding; local app-only burst test is not equivalent. |
| Live DeepSeek response grounding/faithfulness/abstention | NOT TESTED | `DEEPSEEK_API_KEY` absent. Add a test-only key with spend cap. |
| Live agent tool selection/traces/failure fallback | NOT TESTED | Same missing DeepSeek key and isolated database; existing unit tests only test orchestration rules. |
| English/Malay/Manglish, typo, indirect and unsupported live queries | NOT TESTED | Needs test model plus isolated user data; the earlier synthetic suite only covers a small set and all examples had target evidence. |
| User A/B runtime isolation | NOT TESTED | No isolated test auth/database. Code-level `user_id` filters were inspected but not exercised against DB. |
| Model mental-health safety/crisis and unsafe advice | NOT TESTED | No live DeepSeek test credential; safety classifier unit tests do not test generated behavior. |

`.env.local` was checked for variable names only; values were not printed or used. It has generic DB configuration but no separate test DB configuration. No `DEEPSEEK_API_KEY` is configured. No Neon CLI, Docker, PostgreSQL server tools/service, or `pg`/pgvector dependency was available. No app/frontend edits, migrations, network database requests, or production-data access occurred.

## Recommendations (no architecture change made)

1. Fix the test environment first: create an empty Neon test project (not a production clone), synthetic User A/B auth, synthetic records, and test-only DB credentials. Add a low-spend DeepSeek key to the test environment.
2. Run DB benchmark against identical seeded records: app-side JSONB ranking vs exact SQL cosine, measuring query latency, DB/client memory, returned candidate consistency, and concurrent load. Separate provider embedding latency from DB retrieval latency.
3. Address journal lexical preselection before concluding recall: benchmark query embedding against all eligible vectors or widen candidates, then compare Recall@K/latency with the existing 12-candidate shortcut.
4. Add embedding metadata/version/dimension validation and a controlled re-embedding plan before switching embedding models; current mismatches silently degrade to lexical-only matches.
5. Treat unencrypted journal fields and embeddings as a high-priority privacy review finding. Before promising DB-owner unreadability, design and test client-side encryption for journal text/metadata/vectors and the required search trade-offs. This evaluation did not implement encryption.
6. Only consider pgvector indexing after a measured DB baseline. With Qwen 4096D, standard pgvector HNSW/IVFFlat `vector`/`halfvec` indexed dimensions are insufficient; assess supported alternatives using quality evaluation before changing schema/model.

## Layer verdicts

- Embedding provider on synthetic text: **PASS** (previously executed).
- In-process ranker synthetic quality: **PASS** (previously executed).
- In-process ranker CPU/heap microbenchmark: **PASS, limited scope** (executed now; reproducible artifact included).
- Backend unit tests: **PASS** (13/13 executed now).
- PostgreSQL/Neon retrieval and exact-search comparison: **NOT TESTED**.
- Context construction: **PASS by source inspection only; NOT TESTED end-to-end**.
- Real agent tool execution and fallback: **NOT TESTED**.
- Answer grounding/faithfulness/abstention: **NOT TESTED**.
- Cross-user isolation: **NOT TESTED at runtime**.
- Live mental-health safety: **NOT TESTED**.
- Production readiness of RAG/agentic system: **NOT TESTED / not established**.

## Evidence files

- `architecture.md` — detailed source trace, schema and compatibility findings.
- `local_ranker_benchmark.json` — raw in-process synthetic benchmark measurements.
- `../scripts/benchmark-rag-ranker.mjs` — reproducible benchmark script.
- `retrieval_results.jsonl`, `rag_cases.jsonl` — previous synthetic retrieval/query evidence.
- `agent_tool_results.jsonl`, `rag_answer_results.jsonl` — explicit live blockers.
- `safety_privacy_results.md` — runtime safety and isolation boundary.
