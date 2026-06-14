-- Migration: User Profiles and Roles for JomLuah
-- Run this script in the Supabase SQL Editor.
-- It creates a public profiles table and syncs users from auth.users via trigger.

-- 1. Create user role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'counselor');
    END IF;
END
$$;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    student_id TEXT,
    role user_role DEFAULT 'user'::user_role NOT NULL,
    onboarding_completed BOOLEAN DEFAULT false NOT NULL,
    age INT,
    gender TEXT CHECK (gender IN ('Male', 'Female')),
    mental_history TEXT[] DEFAULT '{}',
    goals TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allows authenticated users to view profiles (needed for dashboard/counselor logic)
CREATE POLICY "Allow public read access to profiles" ON public.profiles
    FOR SELECT USING (true);

-- Allows users to update their own profile fields
CREATE POLICY "Allow users to update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5. Trigger Function to automatically create a profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, student_id, role)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'student_id', ''),
        coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
