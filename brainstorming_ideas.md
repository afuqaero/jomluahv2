# Jom Luah System App - FYP Brainstorming & Research Concepts

This document saves the advanced research-grade and engineering-focused ideas designed to make this Final Year Project (PSM) highly competitive, secure, and academically rigorous for UTHM evaluators and Pusat Kaunseling UTHM.

---

## 1. Core Academic & Research Features

### A. Cognitive Distortion Classifier (AI-Driven CBT)
*   **Concept:** Integrate a Cognitive Behavioral Therapy (CBT) analysis pipeline into the LLM chat and journaling frameworks.
*   **Technical Implementation:** When a student enters text, the LLM parses the input to identify and tag negative thinking patterns (e.g., Catastrophizing, Overgeneralization, Black-and-White Thinking).
*   **Thesis Value:** Demonstrates applied psychology in software engineering, showing you can computationally model behavioral science concepts rather than just building a basic chat interface.

### B. Campus-Wide Semantic Topic Clustering
*   **Concept:** Provide aggregated, completely anonymized insights to the counselor dashboard to understand campus sentiment.
*   **Technical Implementation:** Use vector embeddings (via Supabase `pgvector`) to group and cluster journals and chats semantically without compromising individual user identity.
*   **Thesis Value:** Solves a major public health tracking challenge for the university counseling center. Counselors can view anonymized trend percentages (e.g., "Academic Stress: 45%", "Relationship Anxiety: 25%") to organize proactive institutional campaigns.

### C. Fail-Safe Distress Escalation & "Safe Zone" UI
*   **Concept:** A zero-friction emergency design system that triggers during psychological distress.
*   **Technical Implementation:** The system monitors user chats and entries for high-distress triggers. If detected:
    1.  The UI shifts to a soft, calming aesthetic with deep-breathing visual aids and grounding exercises (e.g., 5-4-3-2-1 technique).
    2.  Displays a one-touch button to call UTHM's emergency counselor hotline.
    3.  Sends a secure, real-time alert through Supabase Realtime to the counselor portal.
*   **Thesis Value:** Highlights rigorous ethical system design, addressing the safety, security, and human-computer interaction (HCI) challenges of mental health applications.

### D. Memory Throwback RAG Engine
*   **Concept:** A retroactive nostalgic timeline displaying growth analytics.
*   **Technical Implementation:** Uses semantic search to locate a student's diary or chat entries from months or a year prior, presenting a prompt detailing how they overcame past anxieties, thereby showing tangible personal growth.
*   **Thesis Value:** Elevates RAG (Retrieval-Augmented Generation) implementation to a functional self-reflection tool rather than a generic text retrieval search.

---

## 2. Best Tech Stack for cross-platform PWA

*   **Frontend:** Next.js (App Router) + Tailwind CSS + shadcn/ui. Provides lightweight, responsive, and aesthetically premium mobile-first interfaces.
*   **PWA Wrapper:** `@ducanh2912/next-pwa` for high compatibility, offline drafting capabilities, and smooth installation on both iOS and Android.
*   **Backend & DB:** Supabase (Auth, Postgres, Realtime triggers, PgVector for semantic search).
*   **Hosting:** Vercel (extremely fast, zero-config deployment for Next.js).
*   **AI Model:** Gemini 1.5 Flash (massive context length for parsing months of past chats, rapid response latency, and powerful structured JSON schema outputs).

---

## 3. Recommended Skills Registered
1.  **`prd-writer`**: Formulates detailed Product Requirements Documents (Chapter 3 / Methodology blueprint).
2.  **`academic-thesis-writer`**: Assists in writing thesis chapters (Chapters 1 to 5) with high academic prose and LaTeX/Markdown formatting.
3.  **`security-expert`** (Proposed): Guides data encryption, anonymization pipelines, and Supabase RLS (Row-Level Security) rules to secure patient data.
