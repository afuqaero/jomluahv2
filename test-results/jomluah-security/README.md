# JomLuah Isolated Security and Integration Test Kit

**2026-11-02 update:** A separate isolated Neon project is now provisioned and migrations `001`–`010` and live synthetic journal A/B checks passed. Provider and `/api/chat` integration remain blocked by missing test-only credentials and an isolated app runtime. See `../jomluah-live-validation/ISOLATED-E2E-REPORT.md` for executed results. The historical setup text below describes the original unprovisioned kit and should not be read as the current test outcome.

**Later update:** With the user's authorization to use existing provider keys on fictional data, the module-level agent and isolated authenticated chat route passed. See `../jomluah-live-validation/ISOLATED-E2E-RUN-2026-11-02.md` for final results. The earlier blocked statement above is historical.

The offline backend unit suite passed 20/20 on 2026-11-02. Isolated DB/provider integration remains **NOT TESTED**: preflight blocked because required test-only Neon configuration is missing. The kit does not read `.env.local`, apply migrations, or contact production resources.

## Existing implementation inspected

- Backend unit tests use Node's built-in test runner (`npm run test:backend`). Earlier reported 13/13 is historical unit evidence, not integration evidence.
- `neon_migrations/001_initial_schema.sql` defines owner-only journal RLS policies. `neon_migrations/006_profile_insert_role.sql` limits self-insert to role `user`.
- Chat retrieval in `app/api/chat/route.ts` filters records by `user_id`, loads at most 100 records, creates embeddings, ranks with `rankRecords`, and inserts embeddings back only for the same `user_id`.
- `app/lib/aiRetrieval.ts` supports Qwen-compatible embeddings and application-memory ranking. `app/lib/recallAgent.ts` allows at most two searches, validates source against caller-supplied `allowedSources`, and de-duplicates searches. DeepSeek handles tool selection and answer generation in the chat route.
- `app/lib/chatSafety.ts` implements a local phrase classifier and fixed urgent response. This is an engineering safety check, not clinical validation.

## Minimum safe infrastructure

1. Create a **new, empty Neon project** solely for this test kit. Do not clone or branch production. Its database must be named `jomluah_security_test`.
2. In that new project only, manually apply existing migrations `001_initial_schema.sql` through `010_counselor_self_assign_students.sql` in numeric order using the Neon SQL editor. This kit does not apply schema changes. Verify each migration completed before proceeding.
3. Create two test-only Neon Auth identities with emails ending in `.invalid`, e.g. `user-a@jomluah.invalid` and `user-b@jomluah.invalid`. Use unique random passwords of at least 16 characters. They must have no existing profile rows before a run. Do not use real users, staff, or inboxes.
4. Obtain this isolated project's Auth base URL and Data API URL. The Data API URL must end in `/jomluah_security_test/rest/v1`. Set the exact hostnames in the allowlist variables. Guards reject host mismatch, non-HTTPS endpoints, another database path, non-`.invalid` identities, and weak passwords.
5. Supply variables in the invoking process or a **dedicated ignored test-only environment file** loaded by an operator-controlled shell. Do not use `.env.local` or copy production settings. Scripts never load environment files.

### Database-only variables

```text
JOMLUAH_TEST_ENV_CONFIRM=ISOLATED_TEST_ONLY
JOMLUAH_TEST_AUTH_URL=https://<isolated-auth-host>/<auth-path>
JOMLUAH_TEST_DATA_API_URL=https://<isolated-data-host>/jomluah_security_test/rest/v1
JOMLUAH_TEST_ALLOWED_AUTH_HOST=<exact isolated auth hostname>
JOMLUAH_TEST_ALLOWED_DATA_HOST=<exact isolated apirest hostname>
JOMLUAH_TEST_USER_A_EMAIL=user-a@jomluah.invalid
JOMLUAH_TEST_USER_A_PASSWORD=<unique random test-only password>
JOMLUAH_TEST_USER_B_EMAIL=user-b@jomluah.invalid
JOMLUAH_TEST_USER_B_PASSWORD=<unique random test-only password>
```

### Additional live-provider variables

Live calls send only synthetic test prompts/documents and may consume quota. Explicitly set:

```text
JOMLUAH_ENABLE_LIVE_PROVIDER_TESTS=YES_I_EXPECT_SYNTHETIC_PAID_CALLS
JOMLUAH_TEST_QWEN_API_KEY=<test-only OpenRouter key>
JOMLUAH_TEST_QWEN_MODEL=qwen/qwen3-embedding-8b
JOMLUAH_TEST_DEEPSEEK_API_KEY=<test-only DeepSeek key>
JOMLUAH_TEST_DEEPSEEK_MODEL=<model enabled for this test key>
```

Provider URLs are fixed to `https://openrouter.ai/api/v1/embeddings` and `https://api.deepseek.com/chat/completions`; alternate hosts are rejected. Secret values are not printed. Use newly issued test-only keys with spending limits where available.

## Running after provisioning

Run in an OS-isolated environment with only explicitly allowlisted variables and no `.env.local` inherited. Permit outbound traffic only to the exact isolated Neon and provider hosts; use scratch-only writes and resource/time limits.

```powershell
npm run preflight:isolated
npm run test:isolated-security
npm run preflight:isolated:providers
npm run test:isolated-agent
```

`test:isolated-security` tests Neon Auth sign-in, JWT-backed Data API RLS, migration 006's `admin` self-insert rejection, journal ownership checks, and unauthenticated rejection. It creates no profile rows and deletes only exact synthetic journal records using their owner JWT.

`test:isolated-agent` calls real OpenRouter Qwen and DeepSeek endpoints, Neon Data API, and repository `runRecallAgent`, `rankRecords`, and safety classifier modules. It stores only synthetic fixture IDs and tool/provider metadata (never keys) in a unique `live-agent-trace-*.json` evidence file.

## Coverage matrix — current state

| Check | Executable artifact | Outcome | Evidence / blocker |
|---|---|---|---|
| Test configuration and endpoint guardrails | `scripts/isolated-test-guards.mjs`, `scripts/preflight-isolated-tests.mjs` | PASS — 3 unit cases | Synthetic values verify database path/host checks and provider opt-in. |
| Isolated Neon Auth identities | `tests/integration/neon-isolation.test.ts` | NOT TESTED | Isolated project and two `.invalid` identities unavailable. |
| RLS journal A/B select, insert, update, delete | `tests/integration/neon-isolation.test.ts` | NOT TESTED | Requires isolated Data API and test JWTs. |
| Migration 006 self-promotion prevention | `tests/integration/neon-isolation.test.ts` | NOT TESTED | Source SQL exists; deployed policy behavior requires isolated run. |
| Cross-user RAG retrieval | `tests/integration/agentic-live.test.ts` | NOT TESTED | Needs isolated DB/identities and test Qwen access. |
| Agent tool permission and execution traces | `tests/integration/agentic-live.test.ts` | NOT TESTED | Needs isolated DB and test DeepSeek access. |
| Prompt injection in fictional retrieved entry | `tests/integration/agentic-live.test.ts` | NOT TESTED | Needs live provider credentials and isolated DB. |
| Grounding and unsafe medication advice resistance | `tests/integration/agentic-live.test.ts` | NOT TESTED | No live answer was generated. |
| Crisis English/Malay/Manglish classifier and fixed response | `tests/ai-backend.test.ts` | PASS — offline unit coverage | Current phrase, context, fallback, and retrieval-gate assertions passed; this is not clinical validation. |
| Full `/api/chat` HTTP auth/session-to-provider E2E | Not implemented | NOT TESTED | Current kit tests core agent/retrieval modules, not the Next route itself. |
| Production counselling data / production DB | Not applicable | NOT TESTED — intentionally | Prohibited; no production endpoint was contacted. |

## Current blockers and limits

- `npm run test:backend` passed 20/20 offline unit tests. Both integration test files passed Node syntax checks. See `FOLLOW-UP-REPORT.md` for exact commands/results.
- `npm run preflight:isolated` was run and blocked with exit 1 because required `JOMLUAH_TEST_*` endpoint, identity, and confirmation variables are absent. No network request was made.
- No isolated Neon project, test Auth users, or test-only provider credentials were supplied. `.env.local` was intentionally not read or used.
- Migration 006 check attempts an authenticated self-insert with role `admin` and requires an authorization/policy rejection. It creates no profile row. Fresh test identities are required for repeatable results.
- Agent traces cover real DeepSeek tool selection plus repository agent orchestration and owner-scoped retrieval; this is not a substitute for the full Next `/api/chat` HTTP route. Route-level E2E remains NOT TESTED.
- Crisis phrase tests are not clinical certification; a phrase-based classifier can miss indirect or nuanced risk language.
- No frontend, database schema, encryption, or production resources were changed. Safety handling changes are documented in `FOLLOW-UP-REPORT.md`.
