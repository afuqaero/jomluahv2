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

*   **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, shadcn/ui.
*   **Backend & Database**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
*   **Vector Database**: pgvector (via Supabase) for storing and retrieving conversational embeddings.
*   **LLM Integration**: OpenRouter & Ollama (for Llama 3/Mistral models) with LangChain.js orchestration.

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
*   **[brainstorming_ideas.md](./brainstorming_ideas.md)** — Advanced engineering concepts under exploration (Cognitive Distortion Classifiers, Semantic Topic Clustering, and Distress Escalation UIs).
