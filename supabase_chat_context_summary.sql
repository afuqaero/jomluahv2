-- JomLuah rolling chat-context migration
-- Run this in Supabase SQL Editor for an existing project.

ALTER TABLE public.chat_sessions
    ADD COLUMN IF NOT EXISTS context_summary TEXT NOT NULL DEFAULT '';

ALTER TABLE public.chat_sessions
    ADD COLUMN IF NOT EXISTS summary_message_count INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chat_sessions_summary_message_count_nonnegative'
    ) THEN
        ALTER TABLE public.chat_sessions
            ADD CONSTRAINT chat_sessions_summary_message_count_nonnegative
            CHECK (summary_message_count >= 0);
    END IF;
END
$$;
