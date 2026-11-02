# JomLuah Isolated Security and AI Test Kit

Last reviewed: 2 November 2026

## Current status

- The isolated Neon project and synthetic User A/B identities are separate from production. Migrations `001`–`010`, journal ownership checks, and the migration `006` self-promotion check passed in earlier isolated runs.
- After the FiqStore switch, the latest isolated agent suite passed **4/4** with real Qwen embeddings, isolated Neon retrieval, and FiqStore GLM tool selection. The deterministic backend suite passed **36/36** and TypeScript passed.
- An authenticated `/api/chat` test passed **5/5 with the previous chat provider**. It has **not** been rerun with FiqStore yet.
- Production data, users, and database were not accessed for these runs. Automated safety results are not clinical or security certification.
- The runs used locally configured provider keys with synthetic prompts, not separate test-only provider keys. Check provider spending and rotate shared credentials before production use.

## What was checked

| Check | Latest result | Evidence |
| --- | --- | --- |
| Isolated Neon auth, migration 006, and journal ownership | PASS (earlier isolated run) | `../jomluah-live-validation/ISOLATED-E2E-REPORT.md` |
| Qwen embedding and User A-scoped Neon retrieval | PASS | `live-agent-trace-1793612242123.json` |
| User B cannot retrieve User A's synthetic journal | PASS | Same trace; cross-user retrieval disclosed no fixture |
| FiqStore GLM tool selection and grounded answer | PASS | Same trace; real `search_journal` selection |
| Local safety classifier and urgent branch | PASS for tested cases | `tests/ai-backend.test.ts`; not clinical validation |
| Authenticated `/api/chat` with FiqStore | NOT TESTED | Previous 5/5 route run used the prior provider |
| Production rollout | NOT DONE | Intentionally not touched |

## Safe isolated setup

Use only Neon test project `shy-wildflower-28479163` and fictional accounts ending in `.invalid`. The project already has migrations `001`–`010`; do not apply them again for routine test runs. Never point these scripts at production or use real counselling content.

- `.env.isolated.local` holds the isolated project endpoints and fictional test identities. Keep it ignored and never print its values.
- `.env.local` contains local provider settings. The approved runners pass only the Qwen/FiqStore values required for synthetic provider calls, not local production database credentials.
- Provider calls can incur cost. Keep inputs and output caps small; check account limits first. Credentials must never appear in logs, reports, or Git.

The guard checks the exact isolated Neon project and fixed provider hosts. If a preflight fails, stop; do not bypass the guard or substitute production configuration.

## Run commands

```powershell
# Deterministic local checks (no live provider/database calls)
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/ai-backend.test.ts tests/isolated-test-guards.test.ts tests/phase2-deepseek-failures.test.ts tests/phase2-neon-failures.test.ts tests/phase2-qwen-500.test.ts
npx tsc --noEmit

# Real Qwen + isolated Neon + FiqStore agent checks (synthetic data only)
node scripts/run-isolated-agent-with-provider.mjs tests/integration/agentic-live.test.ts

# Authenticated route harness; rerun this to verify FiqStore through /api/chat
node scripts/run-isolated-chat-route.mjs
```

The agent runner performs isolated preflight before provider calls and writes sanitized traces to `test-results/jomluah-security/live-agent-trace-*.json`. The route harness uses a temporary app copy without `.env.local` and must verify the isolated Auth/Data endpoints before it starts. Never launch a live test from an unconfigured shell.

## Historical reports

Files under `test-results/` preserve the result and provider configuration from their run date. Older reports may say DeepSeek or show a blocked state; those are historical snapshots, not the current provider configuration. See the current summary above before relying on an old result.
