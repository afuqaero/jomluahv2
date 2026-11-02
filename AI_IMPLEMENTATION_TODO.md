# JomLuah AI — Current Status and Next Steps

Last reviewed: 2 November 2026

## In simple words

JomLuah's local AI is now connected to FiqStore's GLM-5.3-Flash model. It can use Qwen embeddings, search fictional journal data in an isolated Neon project, and select the allowed journal-search tool. The local checks passed, but the production website has not yet been switched or verified with FiqStore.

## Current setup

- **Chat model:** FiqStore API, model `glm-5.3-flash`; the app disables GLM reasoning so the response budget produces visible text.
- **Embeddings:** Qwen3 Embedding 8B through the configured OpenRouter-compatible embedding endpoint.
- **Retrieval:** Neon Data API plus JSONB embeddings, semantic and lexical ranking, owner filters, and a lexical fallback if embeddings fail.
- **Recall Agent:** Can search only the signed-in student's permitted memories and journal entries; at most two searches per reply. Production activation remains controlled by `RECALL_AGENT_ENABLED`.
- **Urgent safety:** A local safety check runs before personalized retrieval and the language model. Automated tests are not clinical approval.
- **Local secrets:** Provider keys belong in ignored `.env.local`; never put key values in this document, source code, screenshots, or Git.

## Verified so far

- [x] FiqStore/GLM returned a live text answer and a streamed answer with reasoning disabled.
- [x] Isolated synthetic-data agent test passed 4/4, including Qwen retrieval and real FiqStore journal-tool selection.
- [x] Deterministic backend checks passed 36/36 after the provider switch.
- [x] TypeScript check passed after the provider switch.
- [ ] Authenticated production `/api/chat` test with FiqStore — not run yet.
- [ ] Production provider settings, deployment, and post-deployment checks — not completed yet.

Evidence for the isolated agent run is in `test-results/jomluah-security/live-agent-trace-1793612242123.json`. The test used synthetic entries and the dedicated isolated Neon project; it did not use production counselling records.

## Next actions — in order

### 1. Secure and configure provider keys

- [ ] Replace the FiqStore key that was shared in chat; store the replacement only in Vercel and the local ignored `.env.local` file.
- [ ] Revoke the old DeepSeek key. The app no longer reads it, and it was exposed in earlier terminal output.
- [ ] In Vercel, add `FIQSTORE_API_KEY` as a Secret and set `FIQSTORE_BASE_URL=https://rootsys.cloud/v1` and `FIQSTORE_MODEL=glm-5.3-flash` for the intended environments.
- [ ] Confirm the provider's account spend limits and data-retention terms before using real student conversations.

### 2. Deploy and verify chat

- [ ] Redeploy after adding the Vercel settings; environment changes do not update deployments that already exist.
- [ ] Test a signed-in normal chat, a recall question with a synthetic/test account, and a crisis message.
- [ ] Confirm streamed text, tool behavior, safe handling when the provider fails, and that provider errors do not include keys or private journal text.
- [ ] Keep the Recall Agent's production flag off until its production behavior is reviewed and approved.

### 3. Complete privacy and staff checks

- [ ] Deploy and verify client-side chat/photo encryption with a test account, including unlock and migration of existing records.
- [ ] Test counselor/admin sign-in, role assignment, student assignment, consent filtering, and cross-user access denial with test identities.
- [ ] Have UTHM counselors review urgent-risk phrases, escalation wording, and local support information. Automated tests are not clinical validation.

## Later product and engineering backlog

- [ ] Add a student-facing memory manager so users can review, edit, delete, and switch saved memory off.
- [ ] Make journal citations open the cited journal entry.
- [ ] Add cancel-generation and retry controls to chat.
- [ ] Consider offline chat drafting/outbox after the online flow is stable.
- [ ] Add aggregate AI quality/latency monitoring without exposing private chat content.
- [ ] Measure real production time-to-first-token, response latency, and provider failures before optimizing.
- [ ] Review negative feedback regularly and turn confirmed problems into regression tests.

## Environment variable names

Set values in local ignored `.env.local` or the appropriate Vercel environment. This list intentionally contains names and safe defaults only—never credentials.

```text
FIQSTORE_API_KEY=
FIQSTORE_BASE_URL=https://rootsys.cloud/v1
FIQSTORE_MODEL=glm-5.3-flash

EMBEDDING_API_URL=
EMBEDDING_API_KEY=
EMBEDDING_MODEL=qwen/qwen3-embedding-8b

DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_JWKS_URL=
NEON_AUTH_COOKIE_SECRET=
NEON_DATA_API_URL=
NEXT_PUBLIC_NEON_URL=
```
