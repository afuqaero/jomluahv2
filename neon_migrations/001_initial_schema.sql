-- JomLuah initial Neon schema
-- Apply with the direct (unpooled) Neon connection on a development branch.
-- Neon Auth identities live in neon_auth."user"; auth.uid() is supplied by
-- Neon for Supabase-compatible RLS policies used through the Data API.

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public' AND t.typname = 'user_role'
    ) THEN
        CREATE TYPE public.user_role AS ENUM ('user', 'counselor');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    student_id TEXT,
    role public.user_role NOT NULL DEFAULT 'user'::public.user_role,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    age INTEGER CHECK (age IS NULL OR age BETWEEN 1 AND 120),
    gender TEXT CHECK (gender IS NULL OR gender IN ('Male', 'Female')),
    mental_history TEXT[] NOT NULL DEFAULT '{}',
    goals TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    title TEXT NOT NULL,
    mood TEXT NOT NULL,
    excerpt TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    favorite BOOLEAN NOT NULL DEFAULT false,
    images TEXT[] NOT NULL DEFAULT '{}',
    embedding JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_id TEXT NOT NULL,
    icon_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('journal', 'todo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'Unknown',
    owner_id UUID REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT daily_quotes_text_author_key UNIQUE (text, author)
);

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New chat',
    context_summary TEXT NOT NULL DEFAULT '',
    summary_message_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chat_sessions_summary_message_count_nonnegative
        CHECK (summary_message_count >= 0)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('bot', 'user')),
    text TEXT NOT NULL,
    options TEXT[] NOT NULL DEFAULT '{}',
    reply_to_text TEXT,
    reply_to_sender TEXT CHECK (reply_to_sender IS NULL OR reply_to_sender IN ('bot', 'user')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_preferences (
    user_id UUID PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    memory_enabled BOOLEAN NOT NULL DEFAULT true,
    journal_rag_enabled BOOLEAN NOT NULL DEFAULT true,
    context_profile TEXT NOT NULL DEFAULT 'balanced'
        CHECK (context_profile IN ('quick', 'balanced', 'deep')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.chat_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating IN (-1, 1)),
    reason TEXT CHECK (reason IS NULL OR char_length(reason) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, message_id)
);

CREATE TABLE IF NOT EXISTS public.llm_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS journal_entries_user_id_idx
    ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_timestamp_idx
    ON public.journal_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS folders_user_id_idx
    ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS notes_folder_id_idx
    ON public.notes(folder_id);
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx
    ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx
    ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx
    ON public.chat_messages(created_at ASC);
CREATE INDEX IF NOT EXISTS user_memories_user_active_idx
    ON public.user_memories(user_id, is_active, updated_at DESC);
CREATE INDEX IF NOT EXISTS llm_events_user_created_idx
    ON public.llm_events(user_id, created_at DESC);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS journal_entries_insert_own ON public.journal_entries;
CREATE POLICY journal_entries_insert_own ON public.journal_entries
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS journal_entries_select_own ON public.journal_entries;
CREATE POLICY journal_entries_select_own ON public.journal_entries
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS journal_entries_update_own ON public.journal_entries;
CREATE POLICY journal_entries_update_own ON public.journal_entries
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS journal_entries_delete_own ON public.journal_entries;
CREATE POLICY journal_entries_delete_own ON public.journal_entries
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS folders_insert_own ON public.folders;
CREATE POLICY folders_insert_own ON public.folders
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS folders_select_own ON public.folders;
CREATE POLICY folders_select_own ON public.folders
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS folders_update_own ON public.folders;
CREATE POLICY folders_update_own ON public.folders
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS folders_delete_own ON public.folders;
CREATE POLICY folders_delete_own ON public.folders
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS notes_insert_own ON public.notes;
CREATE POLICY notes_insert_own ON public.notes
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.folders f
            WHERE f.id = folder_id AND f.user_id = (SELECT auth.uid())
        )
    );
DROP POLICY IF EXISTS notes_select_own ON public.notes;
CREATE POLICY notes_select_own ON public.notes
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.folders f
            WHERE f.id = folder_id AND f.user_id = (SELECT auth.uid())
        )
    );
DROP POLICY IF EXISTS notes_update_own ON public.notes;
CREATE POLICY notes_update_own ON public.notes
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.folders f
            WHERE f.id = folder_id AND f.user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.folders f
            WHERE f.id = folder_id AND f.user_id = (SELECT auth.uid())
        )
    );
DROP POLICY IF EXISTS notes_delete_own ON public.notes;
CREATE POLICY notes_delete_own ON public.notes
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.folders f
            WHERE f.id = folder_id AND f.user_id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS daily_quotes_read_all ON public.daily_quotes;
CREATE POLICY daily_quotes_read_all ON public.daily_quotes
    FOR SELECT TO anonymous, authenticated USING (true);
DROP POLICY IF EXISTS daily_quotes_insert_authenticated ON public.daily_quotes;
CREATE POLICY daily_quotes_insert_authenticated ON public.daily_quotes
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS chat_sessions_manage_own ON public.chat_sessions;
CREATE POLICY chat_sessions_manage_own ON public.chat_sessions
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS chat_messages_manage_own ON public.chat_messages;
CREATE POLICY chat_messages_manage_own ON public.chat_messages
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions s
            WHERE s.id = session_id AND s.user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_sessions s
            WHERE s.id = session_id AND s.user_id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS ai_preferences_manage_own ON public.ai_preferences;
CREATE POLICY ai_preferences_manage_own ON public.ai_preferences
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS user_memories_manage_own ON public.user_memories;
CREATE POLICY user_memories_manage_own ON public.user_memories
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS chat_feedback_manage_own ON public.chat_feedback;
CREATE POLICY chat_feedback_manage_own ON public.chat_feedback
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS llm_events_select_own ON public.llm_events;
CREATE POLICY llm_events_select_own ON public.llm_events
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS llm_events_insert_own ON public.llm_events;
CREATE POLICY llm_events_insert_own ON public.llm_events
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

GRANT USAGE ON SCHEMA public TO anonymous, authenticated;
GRANT SELECT ON public.daily_quotes TO anonymous;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

INSERT INTO public.daily_quotes (text, author) VALUES
    ('Calmness is the cradle of power.', 'Josiah Gilbert Holland'),
    ('Small steps every day lead to big changes.', 'Danielle Koepke'),
    ('Your feelings are valid, even on the hard days.', 'Unknown'),
    ('Write it down — even the messy thoughts deserve a page.', 'Unknown'),
    ('Progress, not perfection.', 'Confucius'),
    ('Be gentle with yourself today.', 'Unknown'),
    ('Every entry brings you closer to understanding yourself.', 'Unknown'),
    ('The present moment is the only one that truly matters.', 'Thich Nhat Hanh'),
    ('Courage does not always roar. Sometimes courage is the quiet voice at the end of the day saying, "I will try again tomorrow."', 'Mary Anne Radmacher'),
    ('You do not have to be good. You only have to let the soft animal of your body love what it loves.', 'Mary Oliver'),
    ('What lies behind us and what lies before us are tiny matters compared to what lies within us.', 'Ralph Waldo Emerson'),
    ('There is a crack in everything. That’s how the light gets in.', 'Leonard Cohen'),
    ('Nurturing yourself is not selfish, it’s essential to your survival and your well-being.', 'Renee Peterson Trudeau'),
    ('Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', 'Thich Nhat Hanh'),
    ('Self-care is how you take your power back.', 'Lalah Delia')
ON CONFLICT (text, author) DO NOTHING;

COMMIT;
