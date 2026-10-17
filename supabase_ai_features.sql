-- JomLuah AI memory, feedback, and observability migration.
-- Run in Supabase SQL Editor after supabase_chat.sql and supabase_schema.sql.

ALTER TABLE public.journal_entries
    ADD COLUMN IF NOT EXISTS embedding JSONB;

CREATE TABLE IF NOT EXISTS public.ai_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    memory_enabled BOOLEAN NOT NULL DEFAULT true,
    journal_rag_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own AI preferences" ON public.ai_preferences;
CREATE POLICY "Users can manage their own AI preferences" ON public.ai_preferences
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
    category TEXT NOT NULL DEFAULT 'general'
        CHECK (category IN ('general', 'preference', 'personal', 'goal', 'support', 'schedule')),
    importance SMALLINT NOT NULL DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
    source_message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
    embedding JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own memories" ON public.user_memories;
CREATE POLICY "Users can manage their own memories" ON public.user_memories
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_memories_user_active_idx
    ON public.user_memories(user_id, is_active, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.chat_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating IN (-1, 1)),
    reason TEXT CHECK (reason IS NULL OR char_length(reason) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, message_id)
);

ALTER TABLE public.chat_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own chat feedback" ON public.chat_feedback;
CREATE POLICY "Users can manage their own chat feedback" ON public.chat_feedback
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.llm_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    purpose TEXT NOT NULL,
    latency_ms INTEGER CHECK (latency_ms IS NULL OR latency_ms >= 0),
    prompt_tokens INTEGER CHECK (prompt_tokens IS NULL OR prompt_tokens >= 0),
    completion_tokens INTEGER CHECK (completion_tokens IS NULL OR completion_tokens >= 0),
    safety_level TEXT NOT NULL DEFAULT 'none'
        CHECK (safety_level IN ('none', 'concern', 'urgent')),
    succeeded BOOLEAN NOT NULL DEFAULT true,
    error_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.llm_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own LLM events" ON public.llm_events;
CREATE POLICY "Users can view their own LLM events" ON public.llm_events
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own LLM events" ON public.llm_events;
CREATE POLICY "Users can insert their own LLM events" ON public.llm_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS llm_events_user_created_idx
    ON public.llm_events(user_id, created_at DESC);
