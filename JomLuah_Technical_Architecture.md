# JomLuah — Technical Architecture & System Specification

> **Project Name:** JomLuah (AI Emotional Companion & Counseling Triage PWA)  
> **Target Institution:** Universiti Tun Hussein Onn Malaysia (UTHM) — Pusat Kaunseling Universiti (PCU)  
> **Document Status:** Active Technical Specification — reviewed 2 November 2026

---

## 1. Executive Summary & Core Domain Context

**JomLuah** (*Malay:* "Let's Express") is a Progressive Web Application (PWA) designed as an AI-powered emotional reflection companion for university students, with separate counselor and admin portals.

### Current dashboard scope (2 November 2026)
* `/counselor` displays only student-entered morning/evening mood scores for students assigned to the signed-in counselor, and only after the student explicitly consents. It does not expose chat, journal entries, narrative notes, or AI-inferred topics.
* `/admin` manages student/counselor roles and one active counselor assignment per student. Admin accounts are provisioned through a trusted database operation; admin pages and APIs do not expose student mood check-ins.
* Bootstrap the first admin only through trusted Neon SQL after migration: `UPDATE public.profiles SET role = 'admin'::public.user_role WHERE email = '<verified-admin-email>';`. Never expose admin promotion through the app.
* `mood_checkins`, `mood_sharing_consents`, `counselor_assignments`, and `admin_audit_log` are defined in `neon_migrations/004_counselor_mood_sharing.sql`. Migration `004` was applied to the `JomLuah` Neon production branch after dev-branch validation; production verification confirmed RLS on all four tables, eight dashboard functions, five mood-sharing policies, and the `admin` role value.
* The student dashboard remains separate. Student check-in/consent APIs exist, but the student UI for submitting scores or enabling sharing is not complete. Existing journal moods are not backfilled or shared.

### Key Objectives
* **Student-Facing**: Provides conversational reflection, private journaling, saved-memory recall, journal retrieval (RAG), and localized crisis guidance. The separate mood-sharing check-in UI is still pending.
* **Counselor-Facing**: Shows only consented morning/evening mood scores for assigned students. It does not show chats, journals, AI-generated session summaries, or risk alerts.
* **Admin-Facing**: Manages counselor roles and student assignments; it does not show student mood check-ins or private content.
* **Future work, not implemented**: Automated session summaries, counselor risk alerts, cross-student analysis, and student check-in/consent UI require separate product, consent, privacy, and clinical review.
* **Domain Adaptation**: Custom-tailored to the Malaysian academic context (UTHM), featuring colloquial Malaysian Malay (*Bahasa Melayu Pasar*) and *Manglish* language capabilities.

---

## 2. Tech Stack & Framework Architecture

### 2.1 Core Framework & Libraries
| Component | Technology | Version | Description & Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js** | `16.4.2` | React Full-Stack Framework with App Router & SSR support |
| **UI Library** | **React** | `19.2.4` | Modern component-based frontend framework |
| **Language** | **TypeScript** | `^5` | Strict static typing across API routes, UI, and Neon schemas |
| **Styling** | **Tailwind CSS** | `^4` | Utility-first CSS engine with PostCSS processing (`@tailwindcss/postcss`) |
| **Icons** | **Lucide / Phosphor** | `^1.17` / `^2.1` | Icon libraries for UI elements, mood tags, and action buttons |
| **Auth & Data** | **Neon Auth / Neon JS** | `^0.6` / `^0.8` | Managed Better Auth, signed Next.js sessions, and Neon Data API queries |

---

## 3. High-Level Solution Topology

```
                               ┌────────────────────────────────────────┐
                               │           User Client (PWA)            │
                               │ Next.js 16 + React 19 + Tailwind v4    │
                               └───────────────────┬────────────────────┘
                                                   │
                                ┌──────────────────┴──────────────────┐
                                │        Edge Middleware Layer        │
                                │ proxy.ts (Neon session validation) │
                                └──────────────────┬──────────────────┘
                                                   │
                ┌──────────────────────────────────┴──────────────────────────────────┐
                │                                                                     │
┌───────────────▼────────────────────────┐                         ┌───────────────────▼──────────────────┐
│         App Router API Services        │                         │     Database & Storage Layer         │
│     /api/chat Route & Controllers      │                         │           Neon Postgres              │
│ • System Prompt Engineering            │                         │ • Row Level Security (RLS)           │
│ • Malaysian Localization Rules         │                         │ • Data Tables (Journal, Folders, Chat)│
│ • Safety Hotline Interceptors          │                         │ • JSONB Embeddings + Cosine Ranking  │
└───────────────┬────────────────────────┘                         └───────────────────▲──────────────────┘
                │                                                                      │
┌───────────────▼──────────────────────────────────────────────────────────────────────┴──────────────────┐
│                              AI Inference Engine & Memory/RAG Pipeline                                  │
│  • FiqStore API: https://rootsys.cloud/v1/chat/completions                                              │
│  • Local model: glm-5.3-flash; production rollout is pending                                            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Performance & Security Architecture (Edge Middleware)

The application uses Next.js route protection in [`proxy.ts`](./proxy.ts).

### Key Features
* **Signed Session Validation**: Neon Auth middleware validates protected routes and refreshes the signed session cache when required.
* **Same-Origin Auth Proxy**: `/api/auth/[...path]` keeps browser and server sessions on the application origin.
* **Onboarding Guard**: Checks a lightweight client cookie (`jl_ob=1`) set upon onboarding completion to direct users between `/onboarding` and `/dashboard`.

```typescript
// proxy.ts (Core Excerpt)
const authResponse = await auth.middleware({ loginUrl: "/login" })(request);
if (authResponse.headers.has("location")) return authResponse;
```

---

## 5. AI Engine, Localization & Safety Protocols

### 5.1 FiqStore GLM Chat Provider ([`app/api/chat/route.ts`](./app/api/chat/route.ts), [`app/lib/chatProviderClient.ts`](./app/lib/chatProviderClient.ts))
The current local chat provider is FiqStore's OpenAI-compatible Chat Completions
API. It uses `FIQSTORE_BASE_URL` (default `https://rootsys.cloud/v1`),
`FIQSTORE_MODEL` (default `glm-5.3-flash`), and the secret `FIQSTORE_API_KEY`.
Replies stream from the server to the client. The request disables GLM reasoning
so the configured response-token budget is used for visible reply text. The
provider switch has passed a live text/stream smoke check and an isolated
synthetic-data agent test; production configuration and authenticated
`/api/chat` verification remain pending.

Qwen3 Embedding 8B is configured separately through the embedding provider
settings. FiqStore is the chat/tool provider; it is not used to create journal
embeddings.

### 5.2 System Prompt & Language Normalization
To ensure empathetic, natural conversations for UTHM students, the system prompt strictly enforces colloquial Malaysian Malay (*Bahasa Melayu Pasar*) and *Manglish*, while forbidding formal textbook Malay and Indonesian vocabulary:

* **Banned Terms**: "nggak" $\rightarrow$ "tak", "kamu" $\rightarrow$ "you/kau", "bikin" $\rightarrow$ "buat", "ngobrol" $\rightarrow$ "borak", "rencana" $\rightarrow$ "plan".
* **Tone**: Warm, friendly, peer-like companion using chat particles like *"lah", "je", "weyy", "gempak"*.

### 5.3 Crisis & Distress Protocol
When high distress, depression, or self-harm keywords are detected, the system immediately presents local Malaysian counseling resources:
* **UTHM PCU**: `pcu.uthm.edu.my` | `+607-4537465`
* **Befrienders Malaysia**: `03-76272929` (24/7)
* **Talian Kasih**: `15999` (24/7)
* **Emergency**: `999`

### 5.4 Rolling Conversation Context (Implemented)
To control token usage during long conversations, the chat client keeps the complete
message history in Neon Postgres for display but sends only a bounded recent window to
the model. When the unsummarised portion grows beyond the configured threshold,
`app/api/chat/route.ts` asks the selected LLM for a compact summary and persists it
in `chat_sessions.context_summary` together with `summary_message_count`. Future
requests send that summary plus the latest turns instead of the full history.

### 5.5 Saved Memory, Tools, and Journal Retrieval (Implemented)
Explicit requests such as “remember that...” or “simpan...” can invoke controlled
memory tools. Saved memories live in `user_memories`, separate from chat history,
and remain available across sessions. RLS binds every memory to its authenticated
owner. The API validates explicit intent before any write or delete.

Relevant memories and journal entries are ranked with embeddings when a compatible
embedding endpoint is configured. A lexical scorer remains available as a fallback.
Journal evidence is supplied with `[Journal: title | date]` citations.

Adaptive routing skips private retrieval for fresh conversation. For recall requests,
the **JomLuah Recall Agent** can choose a user-scoped, read-only memory or journal
search, inspect the returned evidence, and make at most one additional search.
Each search uses the existing embedding/keyword ranker rather than a new index.
The configured FiqStore key powers planning and the final answer. The agent
cannot access encrypted chat history, counselor/admin data, or write tools; source
preferences and urgent-safety handling remain enforced outside the model.
Development enables the agent by default, while production requires
`RECALL_AGENT_ENABLED=true` after live recall, privacy, latency, and cost evaluation.

### 5.6 Safety, Feedback, and Observability (Implemented)
A deterministic English/BM classifier runs before the configured chat model. Urgent self-harm
matches bypass generative output and return reviewed Malaysian crisis resources.
Users can rate assistant messages; feedback and privacy-safe LLM metrics are stored
in RLS-protected tables. No raw prompt text is written to `llm_events`.

### 5.7 Backend APIs and Mobile/PWA Readiness (Implemented)
Authenticated `/api/memories` endpoints provide server-side list, create, update,
reactivate, and permanent-delete operations for future settings UI. `/api/ai/preferences`
controls cross-chat memory and journal retrieval. `/api/ai/backfill` generates missing
embeddings in bounded, repeatable batches.

Chat requests cap message count and message size, enforce a provider timeout, and
propagate client disconnects to upstream chat-provider and embedding requests. Private
management endpoints use `Cache-Control: private, no-store`. These choices make the
backend safe for mobile clients with limited bandwidth and unstable connections.
Offline queues, background sync, retry buttons, and service-worker behavior remain
frontend/PWA responsibilities for the UI phase.

---

## 6. Database Schema & Vector RAG Specification

The database is built on Neon Postgres. Rolling conversation summaries
are implemented in `chat_sessions`; pgvector-based retrieval remains a planned
extension for semantic journal-memory search.

### 6.1 Core Relational Tables
1. **`public.profiles`**: Stores user attributes, role values (`user`, `counselor`, `admin`), onboarding questionnaire state, and profile fields. Its UUID references `neon_auth.user`; registration/onboarding performs the profile upsert.
2. **`public.journal_entries`**: User journal entries with title, excerpt, mood tags, favorite status, and an `images TEXT[]` column containing client-side AES-GCM ciphertext for photo data. The browser decrypts photos after unlocking the user's data key; journal text and metadata remain readable in the database.
3. **`public.folders` & `public.notes`**: Personal organization board (todo lists, journal categorization).
4. **`public.chat_sessions` & `public.chat_messages`**: Historical AI chat records. Each session also stores a compact `context_summary` and the number of messages already summarised, so the full transcript does not need to be resent to the LLM.
5. **`public.user_memories` & `public.ai_preferences`**: RLS-protected cross-chat memories and user-controlled AI personalization switches.
6. **`public.chat_feedback` & `public.llm_events`**: Response ratings and privacy-conscious operational telemetry.

### 6.2 Security & Row Level Security (RLS)
All database tables enforce strict RLS policies to guarantee data isolation:

```sql
-- RLS Policy Example: Journal Entries Isolation
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries" 
ON public.journal_entries 
FOR SELECT USING (auth.uid() = user_id);
```

---

## 7. Folder Structure & Application Layout

```
JomLuahv2/
├── app/
│   ├── api/
│   │   ├── auth/[...path]/      # Same-origin Neon Auth handler
│   │   └── chat/route.ts        # FiqStore streaming, tools, memory, RAG, safety
│   ├── chat/                    # AI Conversational interface
│   ├── dashboard/               # Student dashboard (unchanged by staff dashboard work)
│   ├── counselor/               # Assigned-student, consent-gated mood dashboard
│   ├── admin/                   # Counselor role and assignment management
│   ├── journal/                 # Private diary & reflection tools
│   ├── memories/                # Kenangan image attachments & throwback memories
│   ├── onboarding/              # User profile & mental history onboarding
│   ├── login/ & register/       # Auth pages
│   ├── layout.tsx               # Root layout & global providers
│   └── page.tsx                 # Landing page
├── app/lib/neonClient.ts        # Browser Auth + Data API compatibility client
├── app/lib/serverNeon.ts        # Authenticated server Data API client
├── proxy.ts                     # Neon Auth protected-route middleware
└── neon_migrations/             # Versioned Neon schema and RLS migrations
```

Staff API routes:
* `app/api/admin/route.ts` — role and counselor-assignment management; privileged operations are checked by database functions.
* `app/api/counselor/route.ts` and `app/api/counselor/checkins/route.ts` — assigned roster and consent-filtered mood scores.
* `app/api/wellbeing/checkins/route.ts` and `app/api/wellbeing/consent/route.ts` — current-user mood data and explicit consent endpoints for future student UI integration.

---

## 8. Summary of Technical Features

* ✅ **Next.js 16 App Router & React 19** architecture.
* ✅ **Neon Auth route guarding** with signed session caching.
* ✅ **FiqStore GLM-5.3-Flash Backend** locally with streaming and controlled tool calls; production rollout is pending.
* ✅ **Colloquial Manglish & BM Pasar System Prompt Tuning**.
* ✅ **Malaysian Crisis Hotline Interception Logic**.
* ✅ **Persisted rolling conversation summaries for lower token usage**.
* ✅ **Cross-chat saved memory** with explicit user control and RLS.
* ✅ **Embedding-ready memory and journal RAG**, with lexical fallback and journal citations.
* ✅ **Separate urgent-risk classifier**, response feedback, evaluations, and LLM telemetry.
* ✅ **Full Row-Level Security (RLS)** data privacy.
