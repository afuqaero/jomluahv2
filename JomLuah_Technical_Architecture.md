# JomLuah — Technical Architecture & System Specification

> **Project Name:** JomLuah (AI Emotional Companion & Counseling Triage PWA)  
> **Target Institution:** Universiti Tun Hussein Onn Malaysia (UTHM) — Pusat Kaunseling Universiti (PCU)  
> **Document Status:** Active Technical Specification  

---

## 1. Executive Summary & Core Domain Context

**JomLuah** (*Malay:* "Let's Express") is a Progressive Web Application (PWA) designed as an AI-powered emotional management companion for university students and a triage dashboard for university counselors.

### Current dashboard scope (30 October 2026)
* `/counselor` displays only student-entered morning/evening mood scores for students assigned to the signed-in counselor, and only after the student explicitly consents. It does not expose chat, journal entries, narrative notes, or AI-inferred topics.
* `/admin` manages student/counselor roles and one active counselor assignment per student. Admin accounts are provisioned through a trusted database operation; admin pages and APIs do not expose student mood check-ins.
* Bootstrap the first admin only through trusted Neon SQL after migration: `UPDATE public.profiles SET role = 'admin'::public.user_role WHERE email = '<verified-admin-email>';`. Never expose admin promotion through the app.
* `mood_checkins`, `mood_sharing_consents`, `counselor_assignments`, and `admin_audit_log` are defined in `neon_migrations/004_counselor_mood_sharing.sql`. Migration `004` has been applied to the `JomLuah` Neon production branch after dev-branch validation; production verification confirmed RLS on all four tables, eight dashboard functions, five mood-sharing policies, and the `admin` role value. The check-in table currently has no records.
* The student dashboard is unchanged. Student check-in/consent APIs exist, but there is no student UI for submitting scores or enabling sharing yet. Existing journal moods are not backfilled or shared.

### Key Objectives
* **Student-Facing**: Provides 24/7 conversational reflection, private journaling, mood check-ins, memory recall (RAG), and localized crisis hotline guidance.
* **Counselor-Facing**: Surfaces aggregated mood trends, automated session summaries, and risk triage alerts for students expressing severe distress (depression, self-harm, suicidal ideation keywords).
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
│  • DeepSeek API: https://api.deepseek.com/chat/completions                                              │
│  • Default model: deepseek-v4-pro with streaming and strict tool calling                               │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Performance & Security Architecture (Edge Middleware)

The application utilizes a custom performance-optimized Next.js Edge Middleware ([`proxy.ts`](file:///Users/feeq/Documents/Projects/JomLuahv2/proxy.ts)).

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

### 5.1 DeepSeek V4 Inference Strategy ([`app/api/chat/route.ts`](file:///Users/feeq/Documents/Projects/JomLuahv2/app/api/chat/route.ts))
The chat service uses DeepSeek's OpenAI-compatible Chat Completions endpoint. The
default model is `deepseek-flash`; `DEEPSEEK_BASE_URL` and `DEEPSEEK_MODEL` can
override the endpoint and model. Replies use server-to-client token streaming.
Tool selection and rolling summaries use non-thinking mode for predictable,
low-latency structured behavior.

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

### 5.6 Safety, Feedback, and Observability (Implemented)
A deterministic English/BM classifier runs before DeepSeek. Urgent self-harm
matches bypass generative output and return reviewed Malaysian crisis resources.
Users can rate assistant messages; feedback and privacy-safe LLM metrics are stored
in RLS-protected tables. No raw prompt text is written to `llm_events`.

### 5.7 Backend APIs and Mobile/PWA Readiness (Implemented)
Authenticated `/api/memories` endpoints provide server-side list, create, update,
reactivate, and permanent-delete operations for future settings UI. `/api/ai/preferences`
controls cross-chat memory and journal retrieval. `/api/ai/backfill` generates missing
embeddings in bounded, repeatable batches.

Chat requests cap message count and message size, enforce a provider timeout, and
propagate client disconnects to upstream DeepSeek and embedding requests. Private
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
1. **`public.profiles`**: Stores user attributes, role enum (`user`, `counselor`), onboarding questionnaire state, and mental health background tags. Its UUID references `neon_auth.user`; registration/onboarding performs the profile upsert.
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
│   │   └── chat/route.ts        # DeepSeek streaming, tools, memory, RAG, safety
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
* ✅ **DeepSeek V4 Pro Backend** with streaming and controlled tool calls.
* ✅ **Colloquial Manglish & BM Pasar System Prompt Tuning**.
* ✅ **Malaysian Crisis Hotline Interception Logic**.
* ✅ **Persisted rolling conversation summaries for lower token usage**.
* ✅ **Cross-chat saved memory** with explicit user control and RLS.
* ✅ **Embedding-ready memory and journal RAG**, with lexical fallback and journal citations.
* ✅ **Separate urgent-risk classifier**, response feedback, evaluations, and LLM telemetry.
* ✅ **Full Row-Level Security (RLS)** data privacy.
