# JomLuah — AI-Powered Emotional Management Assistant

JomLuah is a Progressive Web Application (PWA) developed as an AI-powered emotional management assistant for university students. It is specifically tailored to the context of Pusat Kaunseling Universiti (PCU) at Universiti Tun Hussein Onn Malaysia (UTHM).

JomLuah acts as a digital complement to human counselling, giving students a safe, private, and intelligent space to express and reflect on their emotional state outside of PCU operating hours.

---

## 🌟 Key Features

*   **Student Dashboard**: A grounding overview of the user's emotional state, journal streak, and recent logs.
*   **AI Conversational Reflection**: Real-time chat interface with an LLM that remembers past conversations and surfaces insights using a RAG (Retrieval-Augmented Generation) pipeline.
*   **Private Journaling**: A seamless journal module that allows users to reflect on their thoughts, which can also be transitioned into an AI reflection session.
*   **Risk Detection & Alerts**: Keyword and pattern-based detection that quietly flags distress signals (e.g., depression, self-harm keywords) and alerts counsellors on their dashboard.
*   **Counsellor & Admin Dashboards**: Dedicated views for counsellors to monitor assigned students, read AI-generated session reports, and track mood trends.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 16.4.2 (App Router), React 19, TypeScript, Tailwind CSS 4.
*   **Backend & Database**: Neon Postgres, Neon Auth, and Neon Data API. The verified runtime currently targets an isolated Neon migration branch pending production promotion.
*   **Retrieval**: Provider-neutral embeddings stored in PostgreSQL JSONB with cosine ranking and lexical fallback. A pgvector migration remains a future scale optimization.
*   **LLM Integration**: DeepSeek V4 Pro with token streaming, strict tool calling, saved memory, journal retrieval, and a separate safety layer.

---

## 📚 Official Technical Documentation

The primary, official technical documentation for building, deploying, and maintaining the website/application is located here:
**[JomLuah_Documentation.md](./JomLuah_Documentation.md)**

This comprehensive documentation covers:
*   **Project Overview & Objectives:** Alignment with Pusat Kaunseling Universiti (PCU), UTHM.
*   **System Architecture & Flow:** Detailed request flows, system prompts, sentiment analysis, and risk detection.
*   **Database Schema:** PostgreSQL schemas, tables, indices, and constraints.
*   **Feature Modules:** Detailed breakdown of all student and counsellor modules.
*   **Sprint & Deployment Plan:** Key roadmap milestones from Sprint 1 to Sprint 11.

---

## 📂 Project Assets & Reference Files

*   **[JomLuah_Documentation.md](./JomLuah_Documentation.md)** — Core project specification and system architecture.
*   **[JomLuah_Technical_Architecture.md](./JomLuah_Technical_Architecture.md)** — Current implementation architecture and runtime behavior.
*   **[AI_IMPLEMENTATION_TODO.md](./AI_IMPLEMENTATION_TODO.md)** — Detailed AI completion and deployment checklist.
*   **[brainstorming_ideas.md](./brainstorming_ideas.md)** — Advanced engineering concepts under exploration (Cognitive Distortion Classifiers, Semantic Topic Clustering, and Distress Escalation UIs).

---

## Development Change Log

All entries use Malaysia Time (`Asia/Kuala_Lumpur`, UTC+08:00). Newest entry stays first.

### Friday, 30 October 2026 — 01:26 MYT

#### Landing page redesign and design tooling

* Made the selected interactive Design 1 landing page the main `/` page and removed the temporary Aurora and alternative landing-page previews. The anti-slop comparison preview remains available for reference.
* Reworked the hero with a looping Companion AI conversation, a two-dimensional cartoon room illustration, and a layout that keeps the student's face and hand visible beside the chat card.
* Rebuilt the feature section around Companion AI, Private Journal, and Mood Spectrum using custom illustrated assets and vector icons instead of emoji-style graphics.
* Added the anti-slop project skills and recorded the landing-page visual direction in `DESIGN.md`.

#### Next steps

* Inspect and refine the dashboard UI/UX.
* Inspect and refine the Companion AI chat UI/UX.
* Replace DeepSeek with Fiqstore using a new API key. Configure the key privately in local and deployment environment settings, then verify chat streaming, tool calls, and safety behavior before switching production traffic. Never commit the key to Git.

### Monday, 19 October 2026 — 12:41 MYT

#### Companion foundation, context controls, and Aurora design exploration

* Completed the Neon production migration for the per-user conversation context profile and schema-verified it after application. Users can select Quick (8K), Balanced (16K default), or Deep (32K) working context budgets; the server enforces each budget with bounded recent history, rolling summaries, relevant private retrieval, safety instructions, and reply allowance.
* Completed and locally verified the current production chat fixes: the DeepSeek runtime configuration, independent message-pane scrolling, stable dynamic viewport behavior, and removal of the unintended dark header strip.
* Added the production chat-history experience: a collapsible secondary history area on desktop, a mobile slide-over, compact recent-session rows, and scrolling for older conversations.
* Built interactive **temporary Aurora Companion** light and dark design previews for review. The previews include a dashboard return control, an animated companion state, reflection-history shelf, in-shelf scrolling, and a shelf collapse/reopen control.
* Corrected the Aurora preview collapse behavior so the shelf slides away while the central companion area remains centred. The Aurora work is a design prototype only; it has not replaced the live `/chat` UI yet.
* Confirmed secret values remain excluded from Git tracking. Credentials are never recorded in this change log.

### Monday, 19 October 2026 — 10:52 MYT

#### Remove the dark strip below the chat header

* Traced the visible black strip to the active-chat `Premium Gradient Top Fade` overlay, not to Chrome or a border-rendering issue.
* Removed the opaque dark gradient so the header divider transitions directly into the chat area.
* Added a regression test; backend tests pass (8/8) and the production build succeeds locally.

### Monday, 19 October 2026 — 00:06 MYT

#### Prevent chat background from shifting the viewport

* Live Chrome geometry showed the decorative background extended below the viewport and made the outer chat wrapper programmatically scroll by 73 px after the composer received focus.
* Changed both viewport wrappers from scrollable overflow hiding to `overflow-clip`, keeping the header and composer fixed while the dedicated message pane remains independently scrollable.
* Strengthened the layout regression test to cover both wrappers. Backend tests pass (7/7) and the production build succeeds locally.

### Sunday, 18 October 2026 — 23:59 MYT

#### Restore production AI chat and contain chat scrolling

* Reproduced the live fallback response and traced it through Vercel runtime logs to a missing production `DEEPSEEK_API_KEY`; added the existing key as a Vercel Production secret and redeployed.
* Verified the configured `deepseek-flash` model and request payload directly, then verified a successful streamed response in the deployed Chrome chat.
* Traced the displaced chat layout to `scrollIntoView()` moving the entire document after each message; chat autoscroll now targets only the message pane and the shell is locked to the dynamic viewport.
* Added chat layout regression tests. Backend tests pass (7/7) and the production build succeeds locally.

### Sunday, 18 October 2026 — 23:44 MYT

#### Read JWT directly from Neon Auth proxy

* Reproduced the live onboarding failure with the signed-in test account: the profile request still received an opaque session token.
* Browser token retrieval now reads the same-origin `set-auth-jwt` response header and rejects non-JWT values before calling Neon Data API.
* Local production build passes; commit pushed for Vercel deployment.

### Sunday, 18 October 2026 — 23:36 MYT

#### Fix cached Neon session token on onboarding

* Traced the production `Provided authentication token is not a valid JWT encoding` error to the Next.js Neon Auth session cache returning the opaque cookie token to the browser Data API client.
* Updated token retrieval to bypass the session cache and read the JWT-bearing Auth response before each Data API request.
* `npm run build` passes locally; authenticated production verification remains pending until this commit is deployed.

### Sunday, 18 October 2026 — 22:54 MYT

#### Fix onboarding Data API authentication

* Traced production onboarding failure: session loaded, but profile query returned `AuthRequiredError` because the client used Better Auth `token()` output instead of Neon Auth's Data API JWT accessor.
* Switched browser Data API token retrieval to `getJWTToken()` with a narrow SDK compatibility type.
* Verified backend tests (5/5), TypeScript, and production build locally.
* Production authenticated onboarding verification remains pending until Vercel deploys and a signed-in test session is available.

### Sunday, 18 October 2026 — 23:00 MYT

#### Harden Neon Data API URL configuration

* Investigated the production login `HTTP 404` using the auth route and deployment boundary.
* Confirmed the same-origin Neon Auth proxy is reachable (`get-session` returns `200`; sign-in returns the expected `401` for invalid credentials).
* Updated the browser Neon client to accept either a Neon base URL or the full `apirest/.../rest/v1` URL copied from the Neon dashboard, preventing duplicate Data API path construction.
* Local production build passes. Redeploy and retry sign-in to verify the authenticated production path.

### Sunday, 18 October 2026 — 23:30 MYT

#### Pin browser auth proxy URL

* Reproduced the production login failure in a fresh Chrome session: the browser SDK failed during `getSession()` with `HTTP 404`, while the same deployed auth route returned `200` directly and invalid sign-in returned the expected `401`.
* Pinned the browser Neon Auth client to the same-origin `/api/auth` proxy instead of relying on automatic Better Auth URL discovery.
* Production build passes. Redeploy and retry login; this removes hidden deployment URL overrides as a failure source.

### Sunday, 18 October 2026 — 21:14 MYT

#### Performance baseline before hosting changes

* Added a Vercel baseline checklist for homepage, dashboard, chat rendering, API TTFB, and chat time-to-first-token.
* Hosting changes will be considered only after application-level optimization and repeat measurements on mobile and desktop.

### Sunday, 18 October 2026 — 19:07 MYT

#### Performance phase added

* Added Phase 13 to track LLM latency, website rendering, Core Web Vitals, regional deployment comparisons, load testing, and VPS migration decisions.

### Saturday, 17 October 2026 — 22:26 MYT

#### Backend verification workflow

* Added GitHub Actions checks for backend unit tests, TypeScript, and the production build.
* Verified locally: 5 backend tests passed, TypeScript passed, and the production build passed.
* The provider-backed chat evaluation is currently blocked by the DeepSeek account returning HTTP 402 (`Insufficient Balance`), not by an application error.

### Saturday, 17 October 2026 — 22:05 MYT

#### Vercel Analytics enabled

* Installed `@vercel/analytics`.
* Mounted the Next.js `<Analytics />` component in the root app layout so page analytics load across the app.
* Verified the production build passes.

### Saturday, 17 October 2026 — 22:01 MYT

#### First production deployment ready

* Fixed the Vercel TypeScript failure where `sessionId` could be `null` at the `simulateBotResponse` call site.
* Found and corrected a Vercel project mismatch: Git was deploying `jomluahv2`, while environment variables had been attached to the unavailable `jom-luah` project.
* Added the production Neon variables to the actual Git-connected `jomluahv2` project and redeployed successfully.
* Production alias is now `https://jomluahv2.vercel.app`.
* Added and verified the actual production origin in the Neon Auth `production` trusted-domain list.
* Smoke-tested the homepage (`200`), protected dashboard redirect (`307` to `/login`), unauthenticated memories API (`401`), and auth session endpoint (`200 null`).

#### Remaining production limitation

* DeepSeek and Gemini API keys are not in Vercel yet, so authenticated live chat and embedding backfill still require provider-key configuration and testing.

### Saturday, 17 October 2026 — 21:49 MYT

#### GitHub connected to Vercel

* Connected `https://github.com/afuqaero/jomluahv2` to `afuqaeros-projects/jom-luah` and verified Vercel reports the repository is already connected.
* Confirmed there are no Vercel deployments yet.
* Confirmed local `main` is two commits ahead of `origin/main`, with the Neon/AI migration still present as 21 tracked changes and 19 untracked paths. Git deployment cannot contain those changes until they are reviewed, committed, and pushed.

#### Remaining audit findings

* Production Vercel still lacks `DEEPSEEK_API_KEY` and `GEMINI_API_KEY`; the locally configured copies were exposed in chat and should be rotated before production upload.
* Production deployment and post-deployment authentication, CRUD, RLS, memory, embedding, and live-chat smoke tests remain pending.
* Backend tests, targeted backend lint, TypeScript, production build, and production dependency audit are green.
* Repository-wide lint still reports pre-existing UI debt: 23 errors and 46 warnings. Errors are concentrated in dashboard, memories, and journal code (`no-explicit-any`, render purity, and synchronous state updates in effects); UI remediation remains in the UI phase.

### Saturday, 17 October 2026 — 21:35 MYT

#### DeepSeek Flash and Gemini embedding adapter

* Checked the current official provider documentation and changed the configured model from the retired `deepseek-v4-flash` alias to the canonical `deepseek-flash` ID.
* Added native Gemini `batchEmbedContents` support for `gemini-embedding-001`, while preserving the existing generic OpenAI-compatible embedding fallback and lexical-only fallback.
* Updated the embedding backfill route to accept either Gemini or the generic provider configuration.
* Added safe non-secret model settings locally and in Vercel. The DeepSeek and Gemini keys pasted into chat were treated as exposed and were not stored or deployed.
* Backend tests pass 5/5, including the new Gemini request-contract test. TypeScript, targeted ESLint, the production build, and `git diff --check` pass.

#### Security action required

* Revoke both exposed provider keys and create replacements in their respective dashboards.
* Add only the replacement keys to `.env.local`; they can then be uploaded securely to Vercel before deployment.

### Saturday, 17 October 2026 — 21:31 MYT

#### Vercel production project prepared

* Authenticated Vercel CLI under `afuqaero` and linked this repository to `afuqaeros-projects/jom-luah`.
* Confirmed the previous `jom-luah` project record was unavailable and its public URL returned `404`, then recreated the project and linked its new exact project ID.
* Uploaded the Neon `production` branch database, Auth, JWKS, Data API, public client URL, and branch variables to Vercel without printing their values.
* Generated a separate strong production-only Neon Auth cookie secret and stored database/cookie credentials as protected Vercel secrets.
* Added the DeepSeek base URL and initial model setting to the production environment; the canonical Flash model update is recorded above.
* Added and verified `https://jom-luah.vercel.app` in the Neon `production` branch trusted-domain allowlist.

#### Remaining deployment blocker

* `DEEPSEEK_API_KEY` is still unavailable locally and in Vercel. Deployment remains paused so the production chat route is not released in a known-broken state.
* After the key is configured: deploy and run production authentication, CRUD, RLS, memory, and live-chat smoke tests.

### Saturday, 17 October 2026 — 21:22 MYT

#### Neon credentials hardened

* Rotated the previously exposed `neondb_owner` password independently on the Neon `production` and `migration-supabase-to-neon` branches using the official password-reset API.
* Waited for every Neon operation to finish before refreshing local credentials.
* Verified the rotated migration connection still contains 11 application tables.
* Verified the rotated production connection contains 11 application tables and 24 RLS policies.
* Refreshed `.env.local` with only the migration branch connection values; no database password was printed or committed.

#### Deployment blocker

* Vercel CLI 64.5.0 is available through `npx` but reports `Logged out`, and the repository has no `.vercel` project link.
* `DEEPSEEK_API_KEY` is not configured locally, so live AI production verification cannot run yet.
* Next action: authenticate/link Vercel, configure the production Neon and DeepSeek variables, register the deployed origin as a Neon Auth trusted domain, deploy, and run production smoke tests.

### Saturday, 17 October 2026 — 21:13 MYT

#### Application runtime cut over to Neon

* Replaced direct Supabase packages with `@neondatabase/auth` and `@neondatabase/neon-js`.
* Added a same-origin Neon Auth handler, signed session middleware, browser data client, and authenticated server Data API client.
* Preserved existing auth and `.from(...)` query behavior through a small compatibility facade while removing the Supabase runtime dependency.
* Pointed local development at the isolated `migration-supabase-to-neon` branch and removed obsolete local Supabase variables.
* Preserved registration profile metadata across verification/sign-in and connected profiles to Neon Auth UUIDs.
* Upgraded Next.js from 16.2.6 to 16.4.2 to resolve the critical production dependency advisory.

#### Runtime verification

* Verified unauthenticated protected pages redirect to `/login` and private APIs return `401`.
* Verified branch-only sign-up, session restoration, JWT issuance, profile creation, owned folder CRUD, memory CRUD, and AI preference updates.
* Verified a cross-user insert is rejected with `403` by RLS.
* TypeScript, targeted backend ESLint, 4/4 backend tests, `git diff --check`, and the Next.js 16.4.2 production build passed.
* Production dependency audit reports zero known vulnerabilities. The full repository lint still reports pre-existing UI lint debt outside the Neon backend cutover.
* Applied the same migration twice to Neon `production`, then verified 11/11 tables have RLS, 24 policies exist, nine user foreign keys target Neon Auth, and 15 quotes are present.
* Application deployment remains pending until the Neon variables are configured in Vercel and production smoke tests are run.

### Saturday, 17 October 2026 — 21:00 MYT

#### Neon database migration branch ready

* Linked this repository to the existing Neon `JomLuah` project and created the isolated `migration-supabase-to-neon` branch.
* Added [`neon_migrations/001_initial_schema.sql`](./neon_migrations/001_initial_schema.sql), consolidating profiles, journals, folders, notes, quotes, chat history/context, saved memory, preferences, feedback, and LLM telemetry.
* Replaced Supabase `auth.users` foreign keys with Neon Auth `neon_auth."user"` references.
* Preserved ownership isolation with Neon `auth.uid()`, `authenticated`, and `anonymous` Data API roles.
* Removed the Supabase-only auth trigger from the Neon migration; profile creation remains part of authenticated onboarding and will be finalized during the Neon Auth client cutover.
* Tightened profile privacy from globally readable profiles to self-only access.

#### Migration verification

* Applied the migration twice through the direct, unpooled Neon connection; both passes succeeded.
* Verified 11 application tables all have RLS enabled and 24 policies are installed.
* Verified all user foreign keys target Neon Auth, 15 initial quotes seed idempotently, anonymous users can read only quotes, and unauthenticated writes are rejected.
* Production remains unchanged. The next backend task is replacing Supabase Auth/data calls with Neon clients and running signed-in isolation tests on the migration branch before promotion.

### Saturday, 17 October 2026 — 07:03 MYT

#### Supabase migration attempt

* Confirmed the configured project reference and attempted `supabase_ai_features.sql` through both the Supabase dashboard and a direct PostgreSQL connection.
* Migration is blocked: both the project API host and database host from `.env.local` return DNS `NXDOMAIN`; the dashboard also remains on Supabase's loading-error screen.
* No database schema changes were applied. Replace the stale Supabase URL, anon key, and `DATABASE_URL` with credentials from an active project, then rerun the migration.

### Saturday, 17 October 2026 — 06:53 MYT

#### Backend phase continued

* **2026-10-19 MYT:** Added user-selectable conversation context profiles: Quick (8K), Balanced (16K, default), and Deep (32K). The chat API now enforces the selected application-level working budget across recent conversation, retrieved private context, rolling summary, and answer allowance. Balanced reserves 4.5K recent chat, 2.5K relevant memory/journal context, 1K summary, 1.2K system/safety reserve, and 2K response allowance. `neon_migrations/002_add_context_profile.sql` was applied and schema-verified on the Neon production branch.
* **2026-10-19 MYT:** Reworked chat history into a collapsible secondary sidebar. On desktop it sits beside the conversation; on mobile it becomes a slide-over. It presents up to 10 compact recent conversations at once and scrolls to older sessions without extending the chat page.
* Added authenticated `/api/memories` CRUD endpoints for future memory-management UI.
* Added RLS-backed `ai_preferences` with `memory_enabled` and `journal_rag_enabled` controls.
* Connected AI preferences to chat retrieval and memory writes.
* Added authenticated `/api/ai/backfill` for bounded, repeatable memory/journal embedding batches.
* Added `get_mood_history` DeepSeek tool with bounded 7–365 day aggregation.
* Added message-count and message-size limits at chat API boundary.
* Added 90-second upstream timeout and browser-disconnect propagation to DeepSeek and embedding calls.
* Added private `no-store` responses for memory, preference, and backfill routes.
* Kept exact duplicate memory writes idempotent.
* Added backend unit tests for memory policy, secret rejection, safety levels, false-positive handling, and retrieval ranking.

#### Backend verification

* `npm run test:backend`: 4/4 passed.
* Targeted backend ESLint: passed.
* TypeScript: passed.
* Next.js production build: passed; new routes detected successfully.
* Protected-route smoke tests: unauthenticated memory, preference, and backfill calls correctly returned `401`.
* Invalid empty chat correctly returned `400`.
* DeepSeek-compatible streaming smoke test passed.

#### Backend work still requiring environment access

* Run `supabase_ai_features.sql` in the correct Supabase project.
* Configure DeepSeek and optional embedding-provider environment variables.
* Run signed-in RLS and CRUD acceptance tests against migrated Supabase.
* Run real DeepSeek evaluations after API key configuration.

UI/UX, offline service-worker outbox, retry/cancel controls, memory settings screens, and clickable journal citations remain deferred to the UI phase.

### Saturday, 17 October 2026 — 06:33 MYT

#### Implemented in code

* Replaced Ollama/OpenRouter chat routing with the official DeepSeek OpenAI-compatible endpoint and default model `deepseek-v4-pro`.
* Added real token streaming from DeepSeek through `/api/chat` into Sanctuary Chat.
* Kept rolling per-session context summaries: full transcripts remain in Supabase while bounded context reaches the LLM.
* Added cross-chat saved memory with explicit save, list, and forget tools.
* Added explicit English/BM intent gates so memory writes require phrases such as “remember”, “store memory”, or “simpan”.
* Added secret-data rejection for passwords, PINs, bank credentials, and API keys.
* Added RLS-protected `user_memories`, `chat_feedback`, and `llm_events` database definitions.
* Added embedding-ready memory retrieval using cosine similarity, lexical relevance, and importance scoring.
* Added lexical retrieval fallback when no embedding provider is configured.
* Added journal RAG with lazy embeddings and `[Journal: title | YYYY-MM-DD]` source citations.
* Added DeepSeek tool calling for memory management and journal search.
* Added separate English/BM distress classifier. Urgent matches bypass generative output and return fixed Malaysian crisis resources.
* Added thumbs-up/down response feedback.
* Added privacy-conscious telemetry for model, latency, token use, status, and safety level. Raw prompts are not logged in `llm_events`.
* Added route-level evaluation cases and `npm run eval:chat`.
* Updated technical architecture for DeepSeek, memory, retrieval, safety, streaming, feedback, and telemetry.

#### Verified

* Production build: passed.
* TypeScript: passed.
* ESLint for changed AI/chat files: passed.
* Normal DeepSeek-compatible SSE streaming smoke test: passed using controlled mock provider.
* Urgent-risk bypass smoke test: passed.
* Whitespace/error check with `git diff --check`: passed.

#### Required before features become live

* Run [`supabase_ai_features.sql`](./supabase_ai_features.sql) in Supabase SQL Editor.
* Configure `DEEPSEEK_API_KEY` locally and in Vercel.
* Configure `DEEPSEEK_BASE_URL=https://api.deepseek.com` and `DEEPSEEK_MODEL=deepseek-v4-pro`.
* Configure an optional OpenAI-compatible embedding endpoint. DeepSeek currently handles chat/tool generation; no DeepSeek embedding endpoint is assumed by this implementation.
* Run signed-in acceptance tests for save, list, forget, journal retrieval, feedback, and RLS isolation.
* Run live-model evaluation with `npm run eval:chat` after starting the application.

#### Still pending

* Memory-management settings screen with manual edit/delete and global memory toggle.
* Backfill embeddings for existing memories and journals.
* Mood-history aggregation tool and authorized counselor appointment tool.
* Cancel-generation button using `AbortController`.
* Clickable journal citations that open their original entries.
* PCU review of crisis detection phrases and escalation wording.
* Admin quality/latency dashboard and CI evaluation job.

Full task-level status lives in [`AI_IMPLEMENTATION_TODO.md`](./AI_IMPLEMENTATION_TODO.md).
