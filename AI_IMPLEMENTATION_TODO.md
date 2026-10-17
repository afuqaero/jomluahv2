# JomLuah AI Implementation Checklist

## Phase 0 — DeepSeek V4 provider

- [x] Replace Ollama/OpenRouter routing with DeepSeek OpenAI-compatible API.
- [x] Default model to the current canonical Flash ID, `deepseek-flash`.
- [x] Disable thinking mode for low-latency companion replies and reliable tool selection.
- [ ] Rotate the exposed local `DEEPSEEK_API_KEY`, then upload the replacement to Vercel.
- [x] Configure the production `DEEPSEEK_MODEL` and `DEEPSEEK_BASE_URL` in Vercel; update the model to `deepseek-flash` per current DeepSeek docs (2026-10-17).

## Phase 1 — Saved cross-chat memory

- [x] Add RLS-protected `user_memories` table.
- [x] Add explicit `save_memory`, `forget_memory`, and `list_memories` tools.
- [x] Require explicit phrases such as “remember”, “save this”, “simpan”, or “forget”.
- [x] Reject secrets such as passwords, PINs, API keys, and bank credentials.
- [x] Inject only relevant memories into prompts.
- [x] Add authenticated memory CRUD API (`GET`, `POST`, `PATCH`, `DELETE`).
- [x] Add authenticated memory/journal preference API with RLS-backed storage.
- [x] Include memory, preferences, feedback, and LLM-event tables in the consolidated Neon migration and apply it to the `migration-supabase-to-neon` branch (2026-10-17 21:00 MYT).
- [ ] Add memory management UI for manual review/edit/delete and global on/off control.

## Phase 2 — Relevant memory retrieval

- [x] Add provider-neutral OpenAI-compatible embedding client.
- [x] Save memory embeddings when embedding provider is configured.
- [x] Rank with cosine similarity plus lexical relevance and importance.
- [x] Fall back to lexical ranking when no embedding provider is configured.
- [x] Add authenticated, bounded, resumable embedding backfill batches.
- [x] Add native Gemini `batchEmbedContents` support using `GEMINI_API_KEY` and `GEMINI_EMBED_MODEL`.
- [ ] Rotate the exposed Gemini key, then configure the replacement locally and in Vercel.
- [ ] Backfill embeddings for existing saved memories.

## Phase 3 — Controlled tool calling

- [x] Register strict DeepSeek tools for save, forget, list, and journal search.
- [x] Validate tool arguments and authenticated ownership in application code.
- [x] Limit tool planning to messages with likely tool intent.
- [x] Block memory writes without explicit user intent.
- [x] Add mood-history aggregation tool.
- [ ] Add counselor appointment tool only after authorization and approval rules exist.

## Phase 4 — Streaming responses

- [x] Stream DeepSeek tokens through `/api/chat` as NDJSON.
- [x] Render each delta immediately in Sanctuary Chat.
- [x] Return summary/safety/model metadata before text deltas.
- [x] Persist final assembled assistant message.
- [ ] Add user-facing cancel-generation button with `AbortController`.

## Phase 8 — Journal RAG with citations

- [x] Retrieve relevant user-owned journal entries.
- [x] Add lazy journal embeddings when an embedding provider is configured.
- [x] Store journal embeddings for reuse.
- [x] Require `[Journal: title | YYYY-MM-DD]` citations in responses.
- [x] Keep lexical fallback when embeddings are unavailable.
- [ ] Make journal citations clickable and open the original entry.

## Phase 9 — Separate safety classifier

- [x] Run deterministic English/BM risk detection before the main LLM.
- [x] Bypass the LLM with a fixed Malaysian urgent-support response for urgent matches.
- [x] Add concern-level instructions without diagnosing the user.
- [x] Log safety level, never matched private phrases.
- [ ] Have UTHM PCU review phrases, escalation text, and hotline details.
- [ ] Add classifier recall/precision tests using de-identified clinical review cases.

## Phase 10 — Feedback, evaluations, observability

- [x] Add thumbs-up/down feedback buttons.
- [x] Add RLS-protected `chat_feedback` table.
- [x] Log model, latency, token use, success, and safety level to `llm_events`.
- [x] Add route-level evaluation runner and starter cases.
- [ ] Create admin dashboard for aggregate quality/latency metrics.
- [ ] Add CI job using a dedicated evaluation project and budget cap.
- [ ] Review negative feedback weekly and turn failures into regression cases.

## Phase 11 — Backend mobile/PWA readiness

- [x] Bound chat history to 50 messages and 8,000 characters per message at API boundary.
- [x] Propagate browser disconnects and 90-second timeout signals to DeepSeek and embedding requests.
- [x] Mark private memory/preferences/backfill responses `no-store`.
- [x] Keep memory writes idempotent by updating exact duplicates.
- [x] Keep embedding backfill bounded to 25 records per source per request.
- [x] Return small JSON payloads and clear `400`, `401`, `404`, `422`, and `503` statuses.
- [x] Add backend unit tests for memory policy, safety classification, and retrieval ranking.
- [ ] Add PWA service-worker outbox for offline chat sends during UI phase.
- [ ] Add UI retry/cancel controls using `AbortController` during UI phase.

## Phase 12 — Supabase to Neon backend migration

- [x] Link the repository to the existing Neon `JomLuah` project.
- [x] Create the isolated `migration-supabase-to-neon` database branch.
- [x] Convert Supabase user foreign keys to `neon_auth."user"`.
- [x] Preserve user ownership policies with Neon `auth.uid()` and Data API roles.
- [x] Consolidate the application schema in `neon_migrations/001_initial_schema.sql`.
- [x] Apply the migration twice successfully with the direct connection.
- [x] Verify all 11 public tables have RLS, 24 policies exist, and 15 quotes seed exactly once.
- [x] Verify anonymous access is limited to quotes and unauthenticated writes are rejected.
- [x] Replace Supabase Auth calls with Neon Auth through a same-origin Next.js handler and compatibility facade.
- [x] Replace Supabase data clients with Neon Data API clients carrying Neon Auth JWTs.
- [x] Run signed-in CRUD and cross-user isolation acceptance tests on the migration branch.
- [x] Apply the verified migration to the Neon `production` branch and re-verify RLS/schema counts.
- [x] Remove direct Supabase dependencies and obsolete local Supabase environment variables.
- [x] Rotate the exposed `neondb_owner` password on production and the migration branch; refresh local migration credentials (2026-10-17 21:22 MYT).
- [x] Authenticate Vercel, recreate/link `afuqaeros-projects/jom-luah` after the stale project returned `404`, and upload the production Neon variables (2026-10-17 21:31 MYT).
- [x] Connect `https://github.com/afuqaero/jomluahv2` to the Vercel project and verify the connection (2026-10-17 21:49 MYT).
- [ ] Rotate the exposed local DeepSeek and Gemini keys, then upload the replacements to Vercel.
- [ ] Review, commit, and push the current Neon/AI migration so Git-based deployments contain it.
- [ ] Create the first production Vercel deployment.
- [x] Add and verify `https://jom-luah.vercel.app` in the Neon `production` branch trusted domains (2026-10-17 21:31 MYT).
- [ ] Run post-deployment production authentication, CRUD, RLS, and chat smoke tests.

## Required environment variables

```text
DATABASE_URL=
DATABASE_URL_UNPOOLED=
NEON_AUTH_BASE_URL=
NEON_AUTH_JWKS_URL=
NEON_AUTH_COOKIE_SECRET=
NEON_DATA_API_URL=
NEXT_PUBLIC_NEON_URL=

DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-flash

# Preferred Gemini embedding provider
GEMINI_API_KEY=
GEMINI_EMBED_MODEL=gemini-embedding-001

# Optional alternative OpenAI-compatible embedding provider
EMBEDDING_API_URL=
EMBEDDING_API_KEY=
EMBEDDING_MODEL=
```

## Deployment order

1. Keep database work on the Neon `migration-supabase-to-neon` branch.
2. Configure the listed Neon variables in the deployment environment.
3. Run signed-in CRUD, RLS-isolation, backend test, and production-build checks.
4. Configure Neon and DeepSeek environment variables in Vercel.
5. Configure the optional embedding provider; lexical retrieval works without it.
6. Run production smoke tests after deployment.
7. Run memory save/list/forget acceptance checks and `npm run eval:chat`.
