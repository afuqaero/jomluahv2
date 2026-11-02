# JomLuah Isolated Security/RAG Validation — Preparation Report

**Status:** Harness prepared; live execution blocked by missing isolated infrastructure and the required OS-enforced test sandbox. **No production resources were contacted.**

## Verdict

| Layer | Verdict | Basis |
|---|---|---|
| Source/config reconnaissance | PASS (source inspection only) | Existing schema, policies, retrieval, agent, safety, and test runner were traced. |
| Isolation guardrails | PASS (static review only) | Test scripts require explicit test env confirmation, exact endpoint host allowlists, named isolated database path, fictional `.invalid` identities, and provider opt-in. No execution occurred. |
| Neon Auth identity behavior | NOT TESTED | No dedicated Neon test project/accounts were provisioned. |
| Journal RLS and User A/B isolation | NOT TESTED | No isolated Data API endpoint/JWTs; production credentials were intentionally not used. |
| Migration 006 effective deployment | NOT TESTED | SQL source exists, but no isolated database was available to exercise the policy. |
| Live Qwen embeddings / retrieval | NOT TESTED | No isolated DB or dedicated OpenRouter test key. |
| DeepSeek tool calling / answer grounding | NOT TESTED | No isolated DB, dedicated DeepSeek key/model, or live provider opt-in. |
| Prompt injection and tool permission | NOT TESTED live | Synthetic adversarial fixture and live harness are prepared. A separate explicitly labeled mocked-planner guard test is included but was not run. |
| Crisis response | NOT TESTED | English/Malay/Manglish assertions against the current local classifier/urgent response are prepared but were not run. |
| Full Next `/api/chat` end-to-end | NOT TESTED | The present harness exercises actual core modules, not the full HTTP route/session integration. |

## Findings and risks

1. **P0 — Evidence blocked by missing isolated environment (not a confirmed vulnerability).** Exact prerequisites are a new empty Neon project with database `jomluah_security_test`, two test-only `.invalid` Auth identities with no profiles, exact Auth/Data API URLs and hostnames, and an OS-enforced execution sandbox. Provider tests additionally require separate test-only Qwen/OpenRouter and DeepSeek credentials/model, plus explicit paid-call opt-in.
2. **P1 — Journal sensitive fields are plaintext at application level.** The schema stores `title`, `mood`, `excerpt`, `tags`, and `embedding` in ordinary SQL/JSONB columns (`neon_migrations/001_initial_schema.sql`). RLS is the access boundary; this run did not behaviorally validate its deployed policies. No encryption/schema change was made, per instruction.
3. **P1 — Migration source is not proof of deployed policy.** Migration 006 defines a `profiles_insert_own` policy requiring `auth.uid() = id` and role `user`, but only an isolated runtime attempt can establish whether the target database has it active. The harness checks an own-ID `admin` insert and requires a policy/authorization denial; unrelated enum/schema failures do not count as a pass.
4. **P1 — RAG/tool identity isolation needs live proof.** The chat route applies `user_id` filters when loading journal/memory records and when writing missing embeddings, and passes the authenticated `user.id` into `searchRecall`. The harness tests API RLS plus a real synthetic retrieval path, but neither was run here. A route-level `/api/chat` harness remains to be added after isolated app configuration is available.
5. **P1 — Safety coverage is limited by phrase matching.** `app/lib/chatSafety.ts` uses finite English/Malay phrase patterns. Static comparison shows the proposed Manglish phrase `I tak nak hidup lagi` is not covered by the current urgent patterns (the English equivalent and `nak mati`/`bunuh diri` are covered). The test harness includes that wording to detect the gap, but runtime result is NOT TESTED. Nuanced distress and clinical outcomes remain unvalidated; no safety certification is claimed.

## Prepared artifacts

- `tests/integration/neon-isolation.test.ts` — isolated login, profile role gate, synthetic journal ownership/RLS, cross-user read/insert/update/delete, and unauthenticated rejection.
- `tests/integration/agentic-live.test.ts` — real Qwen/OpenRouter embeddings, owner-scoped Neon retrieval, real DeepSeek tool selection and answer generation, malicious synthetic retrieved text, safety classifier checks, plus an explicitly marked mocked-planner permission regression.
- `scripts/isolated-test-guards.mjs` — fail-closed configuration and endpoint guards; never reads `.env.local`.
- `scripts/preflight-isolated-tests.mjs` — preflight without network requests or secret display.
- `README.md` — isolated provisioning, required variables, commands, matrix, limits.

Live trace files are produced only after live tests run and contain synthetic fixture IDs, provider status/latency, selected tool/arguments, retrieval result IDs, and outcome metadata. They never include API keys. No live trace exists yet.

## Prioritized next actions

1. Provision the fresh isolated Neon project and two test-only accounts; manually apply the checked-in migrations there in numeric order. Never point the harness at production or a production branch.
2. Set only the listed `JOMLUAH_TEST_*` variables in a clean, allowlisted sandbox process, then run database-only preflight and RLS tests.
3. Provision dedicated, spend-limited provider test keys and set the explicit paid-call opt-in; run Qwen/DeepSeek tests and inspect the generated trace and answer criteria.
4. Add a route-level HTTP test against a local app process configured exclusively with the isolated Neon Auth/Data API endpoints. Keep it blocked until the app runtime can be launched with an empty/allowlisted environment and no `.env.local` loading.
5. Review privacy design, migration/backfill strategy, performance impact, and rollback plan before considering journal-field or embedding encryption. No such changes should precede the isolation evidence and design review.

## Execution policy

No test, build, server, database request, API request, migration, frontend edit, or schema change was run/performed in this turn. The available host cannot provide the OS-enforced network-denied/allowlisted sandbox required by the security-audit skill. Therefore every live behavior above remains NOT TESTED; previous synthetic/unit results are historical and were not substituted for these checks.
