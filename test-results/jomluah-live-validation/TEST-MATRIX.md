# Test matrix

All test messages and journal fixtures are fictional. The live A/B test created and deleted only its own synthetic records and Auth identities; no existing real-user record was queried or changed. Durations are only reported where observed.

| ID | Objective / actual component | Mode | Expected | Actual / duration | Verdict |
|---|---|---|---|---|---|
| U-01 | `tests/*.test.ts` through `npm run test:backend` | Local offline; mocked Gemini `fetch` in one adapter test | Unit cases pass | 24/24, including four live A/B guard cases | PASS |
| S-01 | `app/lib/chatSafety.ts` direct import, 9 phrases | Local real classifier, no model/DB | English/BM/Manglish urgent, concern, historical/quoted/educational classifications | 9/9 after two phrase-pattern fixes; duration not isolated | PASS |
| C-01 | TypeScript `--noEmit` | Local static compile | Exit 0 | Exit 0 after three redundant comparisons removed | PASS |
| P-01 | `--check` on both `tests/integration/*.test.ts` files | Local parse only | Syntax valid | Both exit 0 | PASS (syntax only) |
| E-01 | Actual `createEmbedding` against OpenRouter, fictional text only | Real provider from `.env.local`, no database | Nonempty Qwen vector | 4096 dimensions, 1,494 ms; no sensitive content | PASS (provider-only) |
| DB-META-01 | Live Neon `pg_class`/`pg_policies` catalog queries in read-only transaction | Live database metadata, no user tables queried | Journal RLS and owner-scoped policies, migration 006 self-insert restriction | Five inspected tables have RLS; four journal owner policies; profile insert user-only | PASS (deployed policy metadata only) |
| G-03 | `npm run preflight:live-ab` | Local no-network guard | Explicit live-write opt-in, exact `.env.local` endpoints, two dedicated accounts | Exit 1 on missing opt-in; no network request | BLOCKED |
| DB-LIVE-AB | `npm run test:live-ab:once` executes `tests/integration/live-ab-isolation.test.ts` | Real live Auth/Data API, disposable fictional A/B identities | Journal own CRUD, cross-user denial, owner transfer denial, anonymous fail-closed, cleanup | 4/4 pass twice, 1,230 and 1,291 ms; final test-account count 0 | PASS (scoped live boundary) |
| G-01 | `scripts/preflight-isolated-tests.mjs` | Local no-network guard | Only allow isolated Neon config | Exit 1 with missing variable names; no request | BLOCKED |
| G-02 | Provider preflight | Local no-network guard | Test-only keys and paid-call opt-in | Exit 1 with missing variable names; no request | BLOCKED |
| DB-01 | Neon Auth A/B identity login | Real isolated Neon | Distinct synthetic users | No isolated identities | BLOCKED |
| DB-02 | Journal CRUD and cross-user read/write/owner-transfer | Real isolated Neon Data API/RLS | Own access only | Not invoked after G-01 failure | BLOCKED |
| DB-03 | Migration 006 self-promotion prevention | Real authenticated request | `admin` self-insert denied by RLS | Deployed policy inspected, but no authenticated write attempted | NOT TESTED (behavior) |
| RAG-01 | Qwen embed + actual owner-filtered journal retrieval | Real provider + isolated Neon | User A/B separation and relevant top-K | Not invoked | BLOCKED |
| RAG-02 | English/BM/Manglish, spelling, paraphrase, indirect, multi-chunk, no-evidence retrieval | Real provider + isolated Neon | Recall@K, MRR, p50/p95 measured | No isolated fixture corpus; unavailable | NOT TESTED |
| AG-01 | DeepSeek tool selection, arguments, actual tool result, final answer | Real provider + isolated Neon | Correct bounded calls and grounded answer | Not invoked | BLOCKED |
| AG-02 | Empty result, tool/provider failure, repeated-call suppression | Isolated real route and controlled faults | Safe fallback, no false memory | No isolated app runtime | NOT TESTED |
| HTTP-01 | Authenticated `/api/chat` complete path | Local app pointed exclusively at isolated Neon | Session, retrieval, model, stream and authorization work | Not invoked | BLOCKED |
| SAFE-01 | Crisis via `/api/chat`, provider/telemetry failures | Isolated authenticated route | Appropriate classification and local fallback | Direct classifier only; route not invoked | NOT TESTED |
| INJ-01 | Synthetic retrieved prompt injection | Real isolated RAG/agent | Ignore hostile document instructions | No isolated database or DeepSeek configuration | BLOCKED |
| PERF-01 | DB, Qwen, rank, DeepSeek, API p50/p95 and bounded concurrency | Real isolated integration | Recorded timings and resource use | No isolated environment; no stress test run | NOT TESTED |
| PRIV-01 | Deployed RLS/operator access and provider policy | Live metadata plus separate behavioral/provider review | Protection boundaries established | Live policy metadata inspected; operator access and provider terms not verified | PARTIAL |

An earlier backend run had 19 pass/1 fail due to an inverted educational-mention test expectation. That expectation was corrected to its intended negative-case result. The current suite has 24/24 passing cases, including four live A/B guard tests. Those guard tests do not prove live cross-user isolation. Two crisis phrases were added after direct execution found false negatives; the classifier now passes those cases.
