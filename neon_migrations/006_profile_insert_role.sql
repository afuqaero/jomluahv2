BEGIN;

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = id AND role = 'user'::public.user_role);

COMMIT;
