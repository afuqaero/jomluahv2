-- supabase_indexes.sql
-- Run this SQL in your Supabase SQL Editor to create performance indexes

-- 1. JOURNAL ENTRIES INDEXES
CREATE INDEX IF NOT EXISTS journal_entries_user_id_idx ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_timestamp_idx ON public.journal_entries(timestamp DESC);

-- 2. CHAT INDEXES
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON public.chat_messages(created_at ASC);

-- 3. IDEA BOARD INDEXES
CREATE INDEX IF NOT EXISTS folders_user_id_idx ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS notes_folder_id_idx ON public.notes(folder_id);
