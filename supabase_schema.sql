-- JomLuah Supabase Database Schema
-- Import this SQL file into your Supabase SQL Editor.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. JOURNAL ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    title TEXT NOT NULL,
    mood TEXT NOT NULL,
    excerpt TEXT,
    tags TEXT[] DEFAULT '{}',
    favorite BOOLEAN DEFAULT false,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Policies for journal_entries
CREATE POLICY "Users can create their own entries" ON public.journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own entries" ON public.journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" ON public.journal_entries
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" ON public.journal_entries
    FOR DELETE USING (auth.uid() = user_id);


-- 2. FOLDERS TABLE (Idea Board Folders)
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cover_id TEXT NOT NULL,
    icon_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('journal', 'todo')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Policies for folders
CREATE POLICY "Users can create their own folders" ON public.folders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own folders" ON public.folders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" ON public.folders
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" ON public.folders
    FOR DELETE USING (auth.uid() = user_id);


-- 3. NOTES TABLE (Idea Board Folder Notes/Todos)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- helper function or direct subquery checks for notes policies:
CREATE POLICY "Users can insert notes to their own folders" ON public.notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.folders 
            WHERE folders.id = folder_id AND folders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can select notes in their own folders" ON public.notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.folders 
            WHERE folders.id = folder_id AND folders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update notes in their own folders" ON public.notes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.folders
            WHERE folders.id = folder_id AND folders.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.folders
            WHERE folders.id = folder_id AND folders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete notes in their own folders" ON public.notes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.folders 
            WHERE folders.id = folder_id AND folders.user_id = auth.uid()
        )
    );
