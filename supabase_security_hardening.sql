-- JomLuah Security Hardening Migration
-- Run this in the Supabase SQL Editor against an EXISTING project that was
-- already initialized from supabase_schema.sql. It adds WITH CHECK clauses
-- to the UPDATE policies so a user cannot rewrite a row's ownership
-- (user_id / folder_id) to point at another user's data.
--
-- Safe to re-run.

ALTER POLICY "Users can update their own entries" ON public.journal_entries
    WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Users can update their own folders" ON public.folders
    WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Users can update notes in their own folders" ON public.notes
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.folders
            WHERE folders.id = folder_id AND folders.user_id = auth.uid()
        )
    );
