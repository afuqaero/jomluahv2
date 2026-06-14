-- ============================================================
-- FIX: Missing INSERT RLS policy on profiles table
-- The onboarding upsert fails because there is no INSERT policy.
-- Run this in the Supabase SQL Editor → Dashboard → SQL Editor.
-- ============================================================

-- 1. Allow users to insert their OWN profile row
--    (needed when the trigger didn't run or user pre-dates the trigger)
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
CREATE POLICY "Allow users to insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. (Safety) Ensure the existing UPDATE policy exists
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3. Backfill: create profile rows for any auth users that are missing one
--    (handles accounts created before the trigger was in place)
INSERT INTO public.profiles (id, email, full_name, student_id, role)
SELECT
    u.id,
    u.email,
    coalesce(u.raw_user_meta_data->>'full_name', ''),
    coalesce(u.raw_user_meta_data->>'student_id', ''),
    coalesce((u.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role)
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);
