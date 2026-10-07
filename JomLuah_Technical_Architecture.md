# JomLuah — Technical Architecture & System Specification

> **Project Name:** JomLuah (AI Emotional Companion & Counseling Triage PWA)  
> **Target Institution:** Universiti Tun Hussein Onn Malaysia (UTHM) — Pusat Kaunseling Universiti (PCU)  
> **Document Status:** Active Technical Specification  

---

## 1. Executive Summary & Core Domain Context

**JomLuah** (*Malay:* "Let's Express") is a Progressive Web Application (PWA) designed as an AI-powered emotional management companion for university students and a triage dashboard for university counselors.

### Key Objectives
* **Student-Facing**: Provides 24/7 conversational reflection, private journaling, mood check-ins, memory recall (RAG), and localized crisis hotline guidance.
* **Counselor-Facing**: Surfaces aggregated mood trends, automated session summaries, and risk triage alerts for students expressing severe distress (depression, self-harm, suicidal ideation keywords).
* **Domain Adaptation**: Custom-tailored to the Malaysian academic context (UTHM), featuring colloquial Malaysian Malay (*Bahasa Melayu Pasar*) and *Manglish* language capabilities.

---

## 2. Tech Stack & Framework Architecture

### 2.1 Core Framework & Libraries
| Component | Technology | Version | Description & Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js** | `16.2.6` | React Full-Stack Framework with App Router & SSR support |
| **UI Library** | **React** | `19.2.4` | Modern component-based frontend framework |
| **Language** | **TypeScript** | `^5` | Strict static typing across API routes, UI, and Supabase schemas |
| **Styling** | **Tailwind CSS** | `^4` | Utility-first CSS engine with PostCSS processing (`@tailwindcss/postcss`) |
| **Icons** | **Lucide / Phosphor** | `^1.17` / `^2.1` | Icon libraries for UI elements, mood tags, and action buttons |
| **Auth & Data** | **Supabase SSR** | `^0.12` / `^2.108` | Server-Side Supabase Client with JWT cookie session handling |

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
                                │   proxy.ts (Zero Network Calls)     │
                                └──────────────────┬──────────────────┘
                                                   │
                ┌──────────────────────────────────┴──────────────────────────────────┐
                │                                                                     │
┌───────────────▼────────────────────────┐                         ┌───────────────────▼──────────────────┐
│         App Router API Services        │                         │     Database & Storage Layer         │
│     /api/chat Route & Controllers      │                         │         Supabase PostgreSQL          │
│ • System Prompt Engineering            │                         │ • Row Level Security (RLS)           │
│ • Malaysian Localization Rules         │                         │ • Data Tables (Journal, Folders, Chat)│
│ • Safety Hotline Interceptors          │                         │ • pgvector Vector Embeddings         │
└───────────────┬────────────────────────┘                         └───────────────────▲──────────────────┘
                │                                                                      │
┌───────────────▼──────────────────────────────────────────────────────────────────────┴──────────────────┐
│                              AI Inference Engine & Vector RAG Pipeline                                  │
│  • Local Mode: Ollama REST API (http://localhost:11434 with llama3.2)                                   │
│  • Cloud Fallback: OpenRouter API (meta-llama/llama-3.2-3b-instruct / llama-3.1-70b)                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Performance & Security Architecture (Edge Middleware)

The application utilizes a custom performance-optimized Next.js Edge Middleware ([`proxy.ts`](file:///Users/feeq/Documents/Projects/JomLuahv2/proxy.ts)).

### Key Features
* **Zero Network Round-Trips**: Replaces traditional database/network auth checks (which add 400ms–850ms per request) with high-speed, local HTTP cookie evaluation (`<1ms`).
* **Session Detection**: Checks for Supabase SSR JWT cookies (`sb-*-auth-token`).
* **Onboarding Guard**: Checks a lightweight client cookie (`jl_ob=1`) set upon onboarding completion to direct users between `/onboarding` and `/dashboard`.

```typescript
// proxy.ts (Core Excerpt)
const hasSession = cookies.getAll().some(
  (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
);
const onboardingCompleted = cookies.get("jl_ob")?.value === "1";

if (!hasSession && isProtectedRoute) {
  return NextResponse.redirect(new URL("/login", request.url));
}
```

---

## 5. AI Engine, Localization & Safety Protocols

### 5.1 Dual-Provider Inference Strategy ([`app/api/chat/route.ts`](file:///Users/feeq/Documents/Projects/JomLuahv2/app/api/chat/route.ts))
The chat service dynamically chooses between local privacy-focused LLM execution and high-performance cloud inference:

1. **Local Mode (Ollama)**: Target endpoint `http://localhost:11434/api/chat` using model `llama3.2`. Designed for privacy compliance within university networks.
2. **Cloud Mode (OpenRouter)**: Target endpoint `https://openrouter.ai/api/v1/chat/completions` using models like `meta-llama/llama-3.2-3b-instruct` or `llama-3.1-70b-instruct`.

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
message history in Supabase for display but sends only a bounded recent window to
the model. When the unsummarised portion grows beyond the configured threshold,
`app/api/chat/route.ts` asks the selected LLM for a compact summary and persists it
in `chat_sessions.context_summary` together with `summary_message_count`. Future
requests send that summary plus the latest turns instead of the full history.

---

## 6. Database Schema & Vector RAG Specification

The database is built on PostgreSQL via Supabase. Rolling conversation summaries
are implemented in `chat_sessions`; pgvector-based retrieval remains a planned
extension for semantic journal-memory search.

### 6.1 Core Relational Tables
1. **`public.profiles`**: Stores user attributes, role enum (`user`, `counselor`), onboarding questionnaire state, and mental health background tags. Automatically synchronized from `auth.users` via trigger.
2. **`public.journal_entries`**: User journal entries with title, excerpt, mood tags, favorite status, and image URLs.
3. **`public.folders` & `public.notes`**: Personal organization board (todo lists, journal categorization).
4. **`public.chat_sessions` & `public.chat_messages`**: Historical AI chat records. Each session also stores a compact `context_summary` and the number of messages already summarised, so the full transcript does not need to be resent to the LLM.

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
│   │   └── chat/route.ts        # AI Chat API handler (Ollama & OpenRouter)
│   ├── chat/                    # AI Conversational interface
│   ├── dashboard/               # Student dashboard (Overview, streak counter, quotes)
│   ├── journal/                 # Private diary & reflection tools
│   ├── memories/                # Kenangan image attachments & throwback memories
│   ├── onboarding/              # User profile & mental history onboarding
│   ├── login/ & register/       # Auth pages
│   ├── layout.tsx               # Root layout & global providers
│   └── page.tsx                 # Landing page
├── proxy.ts                     # High-performance Next.js Middleware
├── supabase_schema.sql          # Primary relational schema & RLS policies
├── supabase_profiles.sql        # User profiles migration & auth triggers
└── supabase_chat.sql            # Chat sessions & message tables
```

---

## 8. Summary of Technical Features

* ✅ **Next.js 16 App Router & React 19** architecture.
* ✅ **Sub-millisecond Edge Auth Guarding** via zero-IO cookie inspection.
* ✅ **Hybrid LLM Backend** (Ollama Local Inference + OpenRouter Cloud API).
* ✅ **Colloquial Manglish & BM Pasar System Prompt Tuning**.
* ✅ **Malaysian Crisis Hotline Interception Logic**.
* ✅ **Persisted rolling conversation summaries for lower token usage**.
* 🧭 **PostgreSQL + pgvector Retrieval-Augmented Generation (RAG)** planned for a later memory-search phase.
* ✅ **Full Row-Level Security (RLS)** data privacy.
