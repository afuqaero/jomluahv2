# JomLuah — Technical Documentation

**Project:** JomLuah – LLM-Based Assistant for Emotional Management Among University Students  
**Developer:** Muhammad Afiq Bin Rudy Azmir (CI220139)  
**Supervisor:** Dr Suhaila Binti Mohd Yasin  
**Institution:** Universiti Tun Hussein Onn Malaysia (UTHM)  
**Stakeholder:** Pusat Kaunseling Universiti (PCU), UTHM  
**Timeline:** April 2026 – February 2027  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [System Objectives](#3-system-objectives)
4. [System Modules](#4-system-modules)
5. [Tech Stack](#5-tech-stack)
6. [System Architecture](#6-system-architecture)
7. [Database Schema Overview](#7-database-schema-overview)
8. [LLM Pipeline & RAG Flow](#8-llm-pipeline--rag-flow)
9. [Sentiment Analysis & Risk Detection](#9-sentiment-analysis--risk-detection)
10. [Journal ↔ AI Integration Flow](#10-journal--ai-integration-flow)
11. [Counsellor Dashboard Logic](#11-counsellor-dashboard-logic)
12. [Authentication & Role Management](#12-authentication--role-management)
13. [PWA Configuration](#13-pwa-configuration)
14. [Environment Variables](#14-environment-variables)
15. [Folder Structure](#15-folder-structure)
16. [Sprint Plan Summary](#16-sprint-plan-summary)
17. [Future Enhancements](#17-future-enhancements)

---

## 1. Project Overview

JomLuah is a Progressive Web Application (PWA) built to serve as an AI-powered emotional management assistant for university students, specifically tailored to the context of Pusat Kaunseling Universiti (PCU) at UTHM. The name "JomLuah" loosely translates to "let's express" in Malay — reflecting the core purpose of the app, which is to give students a safe, private, and intelligent space to express and reflect on their emotional state.

The system is not a replacement for human counselling. Instead, it acts as a digital complement — a first layer of support that students can access at any time, even outside PCU operating hours. The system remembers past conversations, builds a longitudinal picture of the user's emotional patterns, and surfaces insights for both the student and their counsellor.

The application has two sides:
- **Student-facing:** conversational AI reflection, private journaling, mood tracking, personal insights, memory of past entries
- **Counsellor-facing:** monitoring dashboard, automated session reports, risk alerts, aggregated mood trends

---

## 2. Problem Statement

PCU counsellors currently operate a fully manual intake process. Students contact the centre through walk-ins, phone calls, or messaging apps. There is no:
- Digital channel for students to receive immediate emotional support outside office hours
- Mechanism to track whether interventions are reducing student stress over time
- System to flag students who are repeatedly expressing distress-related signals (e.g., depression, suicidal ideation keywords)
- Structured way to give counsellors a pre-session picture of a student's recent emotional state

Research shows that over 43.8% of university students in Malaysia experience depression, 42.2% anxiety, and 33.5% stress (Maung et al., 2023), and counsellors face significant caseload pressure that makes proactive monitoring difficult (Marzo & Bhattacharya, 2022). JomLuah addresses these gaps directly.

---

## 3. System Objectives

1. To develop an LLM-based conversational assistant that supports emotional reflection among UTHM students
2. To implement a journal module that integrates with the AI conversation for seamless reflection continuity
3. To build a memory and retrieval system (RAG) that enables the AI to recall and associate past entries across sessions
4. To generate automated session reports and mood trend analytics accessible to PCU counsellors
5. To implement a risk detection mechanism that alerts counsellors when students repeatedly express distress indicators
6. To deploy the system as a mobile-first Progressive Web Application accessible across all devices

---

## 4. System Modules

### 4.1 User Registration & Authentication
- Sign up / login with email and password via Supabase Auth
- Role-based access: Student, Counsellor, Admin
- Onboarding questionnaire on first login — captures user background (ADHD, depression, anxiety, stress history, academic year, faculty)
- Profile management

### 4.2 Student Dashboard (Home Screen)
The student dashboard is the first screen a user sees after logging in. It is intentionally lightweight — it does not host the AI chat or the journal editor directly. Its purpose is to give the student a quick, grounding overview of where they are emotionally and what they have been doing in the app.

**What the dashboard displays:**

| Element | Description |
|---|---|
| Time, Day & Date | Live display of the current time, day of the week, and full date — shown prominently at the top |
| Greeting | Personalised greeting using the student's first name (e.g., "Good evening, Afiq") |
| Journal Streak | Number of consecutive days the user has written a journal entry — encourages consistency |
| This Week's Entries | Count of journal entries logged in the current week |
| Moods Logged | Count of mood check-ins completed this week |
| Recent Journal Entries | A scrollable preview of the last 3 journal entries with their title, date, and mood tag |
| Daily Quote | A rotating inspirational or reflective quote, refreshed daily |
| Mood Check-in CTA | A prominent button — "How are you feeling today?" — that opens the mood logging screen |

**Design notes:**
- The dashboard is read-only — no writing or chatting happens here
- It acts as a soft entry point that helps the student take stock before deciding whether to journal or chat with the AI
- The streak counter is intentionally visible to gently motivate regular use without being gamified in a stressful way
- The time and date display is especially relevant for students who use the app late at night or during stressful periods — grounding them in the present moment is a small but intentional UX decision

### 4.3 AI Conversational Reflection
- Real-time chat interface with an LLM
- Conversations are timestamped and auto-titled based on content (similar to ChatGPT conversation list)
- Conversations display date separators like WhatsApp
- Users can scroll through all past conversations
- Each conversation can be continued at any time
- System prompt shaped by the user's onboarding profile and past session summaries

### 4.4 Journal Management / Private Diary
- Rich text or plain text journaling
- Each entry has a timestamp, mood tag, and optional image attachment (kenangan/memories)
- Entries are private by default and never shared without explicit consent
- Users can quote or reference a journal entry and continue the reflection in the AI chat directly
- From the journal, a "Continue with AI" button opens a new chat seeded with that entry's content

### 4.5 Memory & Retrieval (RAG)
- Every conversation turn and journal entry is embedded as a vector and stored in pgvector (via Supabase)
- When a new conversation starts, the RAG pipeline retrieves the top-k semantically similar past entries and injects them into the LLM context window
- This allows the AI to say things like "you mentioned feeling overwhelmed last week — is that still the case?"
- The LLM orchestration layer (LangChain.js or custom pipeline) manages prompt assembly, memory summarisation, and retrieval
- Rolling summaries are used to manage long conversation histories efficiently

### 4.6 Analytics & Report Generation
- Sentiment scores extracted from each conversation turn using an NLP pipeline
- Scores aggregated over time to form a mood trend graph per user
- Automated session reports generated per user, summarising:
  - Key themes discussed
  - Detected emotional tone over the session
  - Notable entries flagged by the system
  - Disclaimer: AI-generated, for guidance only, not a clinical diagnosis
- Reports are stored in Supabase and accessible only to the assigned counsellor and the student

### 4.7 Counsellor Dashboard
- View all assigned students with their latest mood status
- Read session reports for each student
- Filter students by mood trend, risk level, last active date
- View mood charts and sentiment timelines per student
- Mark students as reviewed or add private counsellor notes

### 4.8 Admin Dashboard
- Manage user accounts (students, counsellors)
- Assign counsellors to students
- System-wide analytics overview
- Manage onboarding form fields
- Monitor system health and activity logs

### 4.9 Risk Detection & Alert
- A keyword and pattern-based detection layer running over every conversation turn
- Watches for high-frequency distress signals: repeated mentions of depression, hopelessness, self-harm references, suicidal ideation keywords
- When threshold is crossed (e.g., keyword appears X times within Y sessions), an alert is raised on the counsellor dashboard
- Alert includes a summary of the flagged entries and the sessions they appeared in
- The user is not notified that they were flagged, in line with ethical counselling practice
- All alerts are logged for audit purposes

### 4.10 Additional Features
- **Throwback Memories:** on the dashboard, the system surfaces a "On this day last year..." card showing a journal entry or conversation from the same date in a previous year — similar to Facebook memories
- **Daily Quotes:** a rotating inspirational or reflective quote displayed on the student dashboard
- **Image Upload:** students can attach images to journal entries as personal mementos (kenangan)
- **Conversation Quoting:** from any past chat, a user can quote a specific message into a new journal entry or a new conversation

---

## 5. Tech Stack

### 5.1 Frontend — Next.js + React + TypeScript

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 14+ | Full-stack React framework, SSR + API routes |
| React | 18+ | UI component library (Meta) |
| TypeScript | 5+ | Type-safe JavaScript across the codebase |
| Tailwind CSS | 3+ | Utility-first styling |
| shadcn/ui | Latest | Pre-built accessible UI components |

**Why Next.js:** Supports server-side rendering for fast initial loads, has built-in API routing so a separate Express server is unnecessary, and is the recommended framework for Vercel deployment. The App Router (Next.js 14) makes it easy to separate student, counsellor, and admin views through folder-based routing.

**Why TypeScript:** Catches type errors at compile time, improves IDE autocompletion, and makes the codebase safer as it grows across multiple modules with different data shapes (user profiles, conversation turns, sentiment scores, etc.).

### 5.2 Backend & Database — Supabase

| Feature | Details |
|---|---|
| Database | PostgreSQL (managed) |
| Auth | Supabase Auth — email/password, JWT tokens |
| Storage | Supabase Storage — for journal image uploads |
| Realtime | Supabase Realtime — live updates on counsellor dashboard |
| Row-Level Security | Enforced per user role so students can only read their own data |
| Edge Functions | Supabase Edge Functions for serverless backend logic |

**Why Supabase:** Open-source, free tier sufficient for development and early deployment, native PostgreSQL means pgvector works as a simple extension without a separate vector database service. Row-level security ensures student data is properly sandboxed by design.

### 5.3 Vector Database — pgvector

```sql
-- Enable the extension in Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- Example: conversation_embeddings table
CREATE TABLE conversation_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content TEXT,
  embedding VECTOR(1536),
  source_type TEXT, -- 'conversation' | 'journal'
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cosine similarity index for fast retrieval
CREATE INDEX ON conversation_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Why pgvector over Pinecone/Weaviate:** Runs inside the same Supabase instance, zero extra service cost, and PostgreSQL's relational structure allows joins between embeddings and user data in a single query. Perfect for a student project where simplicity and cost matter.

### 5.4 LLM Access — OpenRouter + Ollama

| Option | Use Case | Model Examples |
|---|---|---|
| OpenRouter | Cloud inference, development, testing | Llama 3.1 70B, Mistral 7B, Qwen2.5 |
| Ollama | Local inference, privacy-sensitive deployment | Llama 3.2, Mistral, Phi-3 |

**OpenRouter** provides a unified API endpoint compatible with the OpenAI SDK format, so switching models is just a config change. Free tier includes access to several capable open models.

**Ollama** runs models locally. Useful when PCU requires that no student conversation data leaves the university network. The local REST API at `http://localhost:11434` uses the same request/response format as OpenAI, so the same code works for both.

```typescript
// OpenRouter usage
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "meta-llama/llama-3.1-70b-instruct",
    messages: [...],
  })
});

// Ollama (local) - same format, different base URL
const response = await fetch("http://localhost:11434/api/chat", {
  method: "POST",
  body: JSON.stringify({
    model: "llama3.2",
    messages: [...],
    stream: false
  })
});
```

### 5.5 LLM Orchestration — LangChain.js (under evaluation)

LangChain.js is being evaluated as the orchestration layer. Relevant modules:

| LangChain Module | Purpose in JomLuah |
|---|---|
| `ConversationSummaryMemory` | Compresses long conversation history into rolling summaries |
| `SupabaseVectorStore` | Wraps pgvector for seamless retrieval |
| `RetrievalQAChain` | Retrieves relevant past entries and feeds them into the prompt |
| `PromptTemplate` | Structures the system prompt using user profile + context |

If LangChain.js proves too heavy for the PWA context, a custom lightweight RAG pipeline will be implemented directly using the Supabase JS client and the OpenAI embeddings API.

### 5.6 Deployment — Vercel

| Feature | Details |
|---|---|
| Hosting | Vercel — optimised for Next.js |
| CI/CD | Auto-deploys on every push to main branch |
| Environment Variables | Managed via Vercel dashboard |
| Edge Network | Global CDN for fast loads in Malaysia |
| Domain | Custom domain pointed to PCU subdomain (future) |

### 5.7 Additional Tools

| Tool | Purpose |
|---|---|
| Git + GitHub | Version control and sprint branch management |
| Figma | UI/UX wireframes and prototyping |
| Lucidchart | UML diagrams, ERD, system architecture |
| Visual Studio Code | Primary IDE |
| Notion | Product backlog and sprint tracking |
| Postman | API testing |

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser / PWA)             │
│           Next.js 14 + React + TypeScript             │
│    Student View │ Counsellor Dashboard │ Admin Panel  │
└──────────────────────┬──────────────────────────────-┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────-┐
│               Next.js API Routes (Edge)               │
│   /api/chat  /api/journal  /api/reports  /api/alerts  │
└──────┬───────────────┬──────────────────┬────────────┘
       │               │                  │
┌──────▼──────┐ ┌──────▼──────┐  ┌───────▼──────────┐
│  Supabase   │ │  LLM Layer  │  │  Sentiment /     │
│  (Postgres  │ │ OpenRouter  │  │  Risk Detection  │
│  + pgvector │ │  / Ollama   │  │  Pipeline        │
│  + Auth     │ │  + LangChain│  │                  │
│  + Storage) │ └─────────────┘  └──────────────────┘
└─────────────┘
```

**Request flow for a chat message:**
1. User sends message from the chat UI
2. Next.js API route receives it
3. The RAG pipeline queries pgvector for top-k similar past entries
4. Retrieved context + user profile summary + new message assembled into a prompt
5. Prompt sent to LLM (OpenRouter or Ollama)
6. LLM response returned to client and displayed
7. Conversation turn saved to Supabase, embedded and stored in pgvector
8. Sentiment score extracted and saved to the analytics table
9. Risk detection scans the turn for flagged keywords

---

## 7. Database Schema Overview

```sql
-- Users (managed by Supabase Auth, extended here)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  matric_no TEXT,
  role TEXT CHECK (role IN ('student', 'counsellor', 'admin')),
  counsellor_id UUID REFERENCES profiles(id),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Onboarding responses
CREATE TABLE onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  has_adhd BOOLEAN,
  has_depression BOOLEAN,
  has_anxiety BOOLEAN,
  has_stress BOOLEAN,
  academic_year INT,
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations (chat sessions)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ
);

-- Individual messages within a conversation
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT,
  sentiment_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  content TEXT,
  mood_tag TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vector embeddings (pgvector)
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  source_type TEXT CHECK (source_type IN ('message', 'journal')),
  source_id UUID,
  content TEXT,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Risk alerts
CREATE TABLE risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  counsellor_id UUID REFERENCES profiles(id),
  trigger_count INT,
  flagged_keywords TEXT[],
  source_message_ids UUID[],
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Counsellor session reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  counsellor_id UUID REFERENCES profiles(id),
  summary TEXT,
  key_themes TEXT[],
  mood_trend TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  disclaimer TEXT DEFAULT 'This report is AI-generated for guidance purposes only and does not constitute a clinical diagnosis.'
);
```

---

## 8. LLM Pipeline & RAG Flow

```
User message received
        │
        ▼
Embed the message using OpenAI text-embedding-3-small
        │
        ▼
Query pgvector for top 5 similar past entries
(cosine similarity, filtered by user_id)
        │
        ▼
Assemble prompt:
  [System prompt with user profile + disclaimer]
  [Retrieved past context (summarised)]
  [Last N messages in current conversation]
  [User's new message]
        │
        ▼
Send to LLM (OpenRouter or Ollama)
        │
        ▼
Stream response back to client
        │
        ▼
Save message + response to Supabase
Embed response and save to pgvector
Run sentiment extraction on the turn
Check for risk keywords
```

### System Prompt Template

```
You are JomLuah, a compassionate and thoughtful AI assistant supporting university 
students at UTHM with their emotional well-being. Your role is to listen, reflect, 
and help the user understand themselves better. You are not a therapist and you do 
not provide clinical advice. If a user expresses serious distress or mentions 
self-harm, gently acknowledge their feelings and encourage them to speak with a 
counsellor at PCU (pcu.uthm.edu.my, +607-4537465).

User profile:
- Name: {{user_name}}
- Background: {{onboarding_summary}}
- Notable patterns from past sessions: {{memory_summary}}

Relevant past context:
{{retrieved_context}}

Keep your responses warm, non-judgmental, and conversational. Ask one thoughtful 
follow-up question when appropriate. Do not overwhelm the user with multiple 
questions at once.
```

---

## 9. Sentiment Analysis & Risk Detection

### Sentiment Analysis

Each message is scored using one of the following approaches (to be confirmed during development):

| Approach | Tool | Notes |
|---|---|---|
| LLM-based | Ask the LLM to return a sentiment score alongside its response | Simple, no extra model needed |
| Dedicated model | HuggingFace transformers (e.g., distilbert-sentiment) via API | More accurate, slightly higher latency |
| Rule-based | Keyword scoring with VADER or custom Malay/English lexicon | Fast, explainable, works offline |

Sentiment scores are stored per message and aggregated per session and per week to produce the mood trend chart in the counsellor dashboard.

### Risk Detection

```typescript
const HIGH_RISK_KEYWORDS = [
  // English
  "kill myself", "end my life", "want to die", "no reason to live",
  "suicide", "self harm", "hurt myself", "cutting",
  // Malay
  "nak mati", "bunuh diri", "tak nak hidup", "menyakiti diri",
  // Thresholds also track frequency
  "depression", "hopeless", "worthless", "nobody cares"
];

function detectRisk(messageContent: string, recentMessages: string[]): boolean {
  const combined = [...recentMessages, messageContent].join(" ").toLowerCase();
  const matches = HIGH_RISK_KEYWORDS.filter(k => combined.includes(k));
  // Alert if hard keywords present OR soft keywords appear 3+ times in 5 sessions
  return matches.some(k => HARD_RISK_KEYWORDS.includes(k)) ||
    countFrequency(matches, combined) >= 3;
}
```

---

## 10. Journal ↔ AI Integration Flow

One of the unique design decisions in JomLuah is that the journal and AI chat are not fully separate — they are linked but not the same thing.

```
SCENARIO A: Journal → AI Chat
──────────────────────────────
User opens a journal entry
         │
         ▼
User clicks "Reflect with AI" button
         │
         ▼
New conversation is created, pre-seeded with:
  "I wrote this in my journal on [date]: [entry content]
   I'd like to talk about this further."
         │
         ▼
AI responds with acknowledgment and opens reflection

SCENARIO B: AI Chat → Journal (Save Option)
──────────────────────────────────────────
User has a long conversation with the AI
         │
         ▼
At end of session, a prompt appears:
  "Would you like to save a summary of this
   conversation as a journal entry?"
         │
         ▼
If yes, a summarised version is auto-saved
as a journal entry with the conversation ID
linked for reference

SCENARIO C: Direct journal entry, no AI
──────────────────────────────────────
User just wants to write privately
         │
         ▼
Entry saved to journal_entries table
Embedded and stored in pgvector for future RAG context
No conversation created unless user initiates
```

---

## 11. Counsellor Dashboard Logic

The counsellor dashboard shows a card per assigned student with:

```
┌──────────────────────────────────────────┐
│ Muhammad Afiq                            │
│ Last active: 2 days ago                  │
│ Mood trend: [Declining] (last 7 days)    │
│ Sessions this month: 4                   │
│ [ALERT] Risk alert: 1 unread             │
│ [View Report] [Add Note] [Mark Reviewed] │
└──────────────────────────────────────────┘
```

Mood trend is calculated from the rolling 7-day average of sentiment scores. The trend indicator is:
- `[Improving]` — average score trending upward
- `[Stable]` — score within +/-0.1 of previous week
- `[Declining]` — score trending downward by more than 0.1
- `[Critical]` — score below threshold OR risk alert active

Reports include an **AI disclaimer** at the top:
> *This report is generated by an AI system and is intended to assist, not replace, professional counselling judgement. All insights should be interpreted in the context of a direct counselling relationship.*

---

## 12. Authentication & Role Management

```
Supabase Auth handles JWT issuance.
Roles are stored in the profiles table and enforced via:
  1. Row-Level Security (RLS) in Supabase — database level
  2. Next.js middleware — route protection at the app level

Routes:
  /app/student/*     → requires role = 'student'
  /app/counsellor/*  → requires role = 'counsellor'
  /app/admin/*       → requires role = 'admin'
  /                  → public landing page
  /auth/*            → login / signup / onboarding
```

---

## 13. PWA Configuration

JomLuah is built as a Progressive Web Application so it installs like a native app on Android and iOS from the browser, with no app store required.

```json
// public/manifest.json
{
  "name": "JomLuah",
  "short_name": "JomLuah",
  "description": "Your personal emotional management companion",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1F4E78",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Key PWA behaviours:
- Installable on mobile home screen
- Works offline for reading past journal entries (cached via service worker)
- Push notifications possible via Web Push API for counsellor alerts (future)

---

## 14. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LLM - OpenRouter
OPENROUTER_API_KEY=your-openrouter-key

# LLM - Ollama (local, no key needed)
OLLAMA_BASE_URL=http://localhost:11434

# Embeddings
OPENAI_API_KEY=your-openai-key  # for text-embedding-3-small
# OR use Ollama embeddings: nomic-embed-text (free, local)

# App
NEXT_PUBLIC_APP_URL=https://jomluah.vercel.app
```

---

## 15. Folder Structure

```
jomluah/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── onboarding/
│   ├── (student)/
│   │   ├── dashboard/
│   │   ├── chat/
│   │   │   ├── page.tsx          # conversation list
│   │   │   └── [id]/page.tsx     # individual conversation
│   │   ├── journal/
│   │   │   ├── page.tsx          # journal list
│   │   │   └── [id]/page.tsx     # individual entry
│   │   └── profile/
│   ├── (counsellor)/
│   │   ├── dashboard/
│   │   ├── students/[id]/
│   │   └── reports/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   └── users/
│   └── api/
│       ├── chat/route.ts         # LLM chat endpoint
│       ├── embed/route.ts        # embedding pipeline
│       ├── sentiment/route.ts    # sentiment analysis
│       ├── report/route.ts       # report generation
│       └── risk/route.ts         # risk detection
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ConversationList.tsx
│   ├── journal/
│   │   ├── JournalEditor.tsx
│   │   └── EntryCard.tsx
│   ├── dashboard/
│   │   ├── MoodChart.tsx
│   │   ├── StudentCard.tsx
│   │   └── RiskAlert.tsx
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── llm/
│   │   ├── openrouter.ts
│   │   ├── ollama.ts
│   │   └── rag.ts                # RAG pipeline
│   ├── embeddings/
│   │   └── embed.ts
│   └── risk/
│       └── detect.ts
├── hooks/
│   ├── useChat.ts
│   ├── useJournal.ts
│   └── useRiskAlert.ts
├── types/
│   └── index.ts
├── public/
│   ├── manifest.json
│   └── icons/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 16. Sprint Plan Summary

| Sprint | Focus | Period | PSM Phase |
|--------|-------|--------|-----------|
| 1 | Planning, PCU requirements, onboarding flow | Apr 2026 | PSM 1 |
| 2 | User Registration & Authentication | Apr–May 2026 | PSM 1 |
| 3 | AI Conversational Reflection (LLM integration) | May–Jun 2026 | PSM 1 |
| 4 | Journal Management / Private Diary | Jul 2026 | PSM 1 |
| 5 | Memory & Retrieval (RAG, conversation linking) | Jul–Aug 2026 | PSM 1 |
| 6 | Chapters 1–4 documentation + 50% milestone | Aug–Sep 2026 | PSM 1 |
| 7 | Analytics & Report Generation | Oct 2026 | PSM 2 |
| 8 | Counsellor Dashboard & Risk Detection/Alert | Oct–Nov 2026 | PSM 2 |
| 9 | Admin Dashboard + extras (memories, quotes, images) | Dec 2026 | PSM 2 |
| 10 | Integration testing, deployment | Jan 2027 | PSM 2 |
| 11 | Chapters 5–7 documentation, review & closure | Jan–Feb 2027 | PSM 2 |

---

## 17. Future Enhancements

- **Multilingual support:** Malay-English code-switching in the LLM (currently handled by prompt engineering, future: fine-tuned model)
- **Mobile native app:** Wrap the PWA in Capacitor for Google Play and App Store distribution
- **Peer support module:** Anonymous peer-to-peer sharing with moderation
- **Integration with PCU CMS:** Direct API connection to the existing Counselling Management System at cms.uthm.edu.my so reports can flow into the existing counsellor workflow
- **Voice input:** Speech-to-text for journal entries and chat via Web Speech API
- **Clinician-validated prompt library:** Work with PCU to develop a set of evidence-based reflection prompts aligned with CBT and mindfulness frameworks

---

*Last updated: May 2026*  
*For technical questions, contact: Muhammad Afiq Bin Rudy Azmir (CI220139)*
