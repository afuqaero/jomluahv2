# Isolated authenticated RAG/agent evaluation — 2026-11-02

**Update later on 2026-11-02:** The user authorized using the existing provider keys in `.env.local` for synthetic-only calls. Real module-level Qwen/Neon/DeepSeek tests and the authenticated `/api/chat` route now pass. This file preserves the earlier blocked state; see `ISOLATED-E2E-RUN-2026-11-02.md` and `ISOLATED-CHAT-ROUTE-TRACE.json` for the executed continuation and current verdict.

## Verdict

**End-to-end success criterion: NOT TESTED (blocked).** A separate Neon project and two fictional users are operational, and its live journal isolation checks pass. There are no test-only Qwen/OpenRouter or DeepSeek credentials, so no provider calls, agent tool calls, grounded answers, or authenticated `/api/chat` conversation were executed. This is not evidence that the application RAG or agent is correct or incorrect.

## Isolation boundary and setup

- Created a **new empty Neon project**, `JomLuah Isolated RAG Test` (`shy-wildflower-28479163`, endpoint prefix `ep-long-river-azdshj6q`). This is not a branch or copy of the JomLuah production project. Neon Auth and Data API were enabled on its default `neondb` database.
- Created a project-scoped Neon CLI profile named `jomluah-eval`. Direct connection host and database name were checked against the new project before any SQL. Applied migrations `001` through `010` in numeric order to that new project only; all completed.
- Signed up `user-a@jomluah.invalid` and `user-b@jomluah.invalid` with distinct generated 64-character passwords. Credentials reside only in ignored `.env.isolated.local`; values were not printed or committed. No real users or counselling records were queried or inserted.
- The integration guard now requires the exact isolated project ID, Auth host, Data API host, `neondb` path, fictional `.invalid` identities, and explicit opt-in for provider calls. It rejects the production host even if the caller changes the nominal allowlist variables.

## Executed evidence

| Check | Command / action | Outcome |
|---|---|---|
| Isolated DB preflight | `node --env-file=.env.isolated.local scripts/preflight-isolated-tests.mjs` | PASS |
| Guard unit tests | `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/isolated-test-guards.test.ts` | 3 PASS, 0 FAIL |
| Live Auth, migration 006, journal RLS | `node --env-file=.env.isolated.local --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/integration/neon-isolation.test.ts` | 3 PASS, 0 FAIL on rerun; synthetic rows cleaned up |
| Migration 006 | Authenticated User A tried to insert an `admin` profile | PASS: policy denied the attempted self-promotion |
| Cross-user journal isolation | Authenticated User A/B created fictional entries and attempted cross-user read, insert, update, delete, and ownership transfer | PASS: all cross-user attempts denied or returned no rows |
| No-auth access | Journal request without bearer JWT | PASS: Neon returned HTTP 400 with explicit `missing authentication credentials: required authorization bearer token in JWT format` |
| TypeScript | `npx tsc --noEmit` | PASS |
| Diff whitespace | `git diff --check` | PASS |
| Provider preflight | `node --env-file=.env.isolated.local scripts/preflight-isolated-tests.mjs --providers` | BLOCKED before provider calls: four required settings absent |

The first isolated RLS run had 2 PASS and 1 FAIL because the test assumed anonymous rejection must be HTTP 401/403. Direct inspection established Neon actually returns HTTP 400 with an explicit missing-bearer error. The assertion was narrowed to accept **only** that specific 400 body; the second run passed 3/3. This was a test expectation mismatch, not evidence of unauthenticated data disclosure.

## Layer verdicts

| Layer | Verdict | Evidence |
|---|---|---|
| Isolated Neon setup and migrations | PASS | New project, scoped CLI profile, 10 migrations applied |
| Synthetic authentication and journal RLS | PASS (scoped) | 3/3 live isolated checks, including A/B ownership and migration 006 |
| Qwen embeddings on isolated fixtures | NOT TESTED | Test-only OpenRouter key absent |
| Retrieval IDs, scores, latency and recall | NOT TESTED | No isolated provider embedding/fixture query was run |
| DeepSeek agent tool selection and traces | NOT TESTED | Test-only DeepSeek key/model absent; zero real tool calls observed |
| Answer grounding, unsupported questions, prompt injection | NOT TESTED | No real DeepSeek response was generated |
| Authenticated `/api/chat` HTTP conversation | NOT TESTED | No isolated app runtime/provider credentials; existing `agentic-live.test.ts` tests modules, not the Next route |
| Route crisis and provider-failure behavior | NOT TESTED | Direct unit classifier evidence is historical, not this route run |
| Production data isolation | PASS for this run | Only the newly created isolated Neon project was used; production credentials/data were not loaded |

## Exact blockers and safe next run

1. Provide a **test-only** OpenRouter Qwen embedding key and a **test-only** DeepSeek key/model, each with a small spending cap. Do not copy `.env.local` or existing production/shared keys. Set `JOMLUAH_TEST_QWEN_API_KEY`, `JOMLUAH_TEST_DEEPSEEK_API_KEY`, `JOMLUAH_TEST_DEEPSEEK_MODEL`, and `JOMLUAH_ENABLE_LIVE_PROVIDER_TESTS=YES_I_EXPECT_SYNTHETIC_PAID_CALLS` in the ignored isolated test environment. Then rerun provider preflight before `npm run test:isolated-agent` (with that environment loaded).
2. The full `/api/chat` route still needs an isolated Next runtime. Next automatically reads repository `.env.local`, so **do not start this checkout as-is** for route testing. Prepare a separate source copy with no `.env.local`, only isolated Auth/Data API/provider variables, and a route harness with a test-only Auth session. Validate its endpoints against the isolated project before making requests.
3. Existing `tests/integration/agentic-live.test.ts` can produce module-level provider/tool traces once test-only keys exist, but cannot establish the route-level success criterion by itself. Its current assertions cover one retrieved malicious fictional document; add an unsupported-answer and User B fixture to the route-level harness before claiming complete grounding/isolation coverage.

Only the new test project's schema was created by the existing migrations. No application schema files, frontend, production project, or production data was changed. No provider cost was incurred in this run.
