ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';

BEGIN;

CREATE TABLE IF NOT EXISTS public.counselor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    counselor_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES neon_auth."user"(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    CONSTRAINT counselor_assignment_distinct_users CHECK (student_id <> counselor_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS counselor_assignments_one_active_per_student_idx
    ON public.counselor_assignments(student_id)
    WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS counselor_assignments_counselor_active_idx
    ON public.counselor_assignments(counselor_id, assigned_at DESC)
    WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS public.mood_sharing_consents (
    student_id UUID PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    share_enabled BOOLEAN NOT NULL DEFAULT false,
    consent_version TEXT NOT NULL,
    consented_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mood_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('morning', 'evening')),
    mood_score SMALLINT NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT mood_checkins_one_per_period UNIQUE (student_id, checkin_date, period)
);

CREATE INDEX IF NOT EXISTS mood_checkins_student_date_idx
    ON public.mood_checkins(student_id, checkin_date DESC);

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_id UUID NOT NULL REFERENCES neon_auth."user"(id),
    action TEXT NOT NULL CHECK (action IN ('role_changed', 'counselor_assigned', 'counselor_unassigned')),
    target_user_id UUID REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
    student_id UUID REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
    counselor_id UUID REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx
    ON public.admin_audit_log(created_at DESC);

ALTER TABLE public.counselor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_sharing_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.counselor_assignments FROM PUBLIC, authenticated;
REVOKE ALL ON public.admin_audit_log FROM PUBLIC, authenticated;
REVOKE ALL ON public.mood_sharing_consents FROM PUBLIC, authenticated;
REVOKE ALL ON public.mood_checkins FROM PUBLIC, authenticated;
GRANT SELECT ON public.mood_sharing_consents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_checkins TO authenticated;

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
    SELECT p.role::text
    FROM public.profiles AS p
    WHERE p.id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;

CREATE OR REPLACE FUNCTION public.prevent_unprivileged_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role
       AND auth.uid() IS NOT NULL
       AND public.current_app_role() IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Only an administrator can change account roles'
            USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_role_change ON public.profiles;
CREATE TRIGGER profiles_protect_role_change
    BEFORE UPDATE OF role ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_unprivileged_role_change();

CREATE OR REPLACE FUNCTION public.can_current_counselor_view_mood(
    p_student_id UUID,
    p_submitted_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
    SELECT public.current_app_role() = 'counselor'
       AND EXISTS (
            SELECT 1
            FROM public.counselor_assignments AS a
            JOIN public.mood_sharing_consents AS c ON c.student_id = a.student_id
            WHERE a.student_id = p_student_id
              AND a.counselor_id = auth.uid()
              AND a.revoked_at IS NULL
              AND c.share_enabled
              AND p_submitted_at >= c.consented_at
       )
$$;

REVOKE ALL ON FUNCTION public.can_current_counselor_view_mood(UUID, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_current_counselor_view_mood(UUID, TIMESTAMPTZ) TO authenticated;

DROP POLICY IF EXISTS mood_sharing_consents_select_own ON public.mood_sharing_consents;
CREATE POLICY mood_sharing_consents_select_own ON public.mood_sharing_consents
    FOR SELECT TO authenticated USING (student_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS mood_checkins_select_self_or_assigned_counselor ON public.mood_checkins;
CREATE POLICY mood_checkins_select_self_or_assigned_counselor ON public.mood_checkins
    FOR SELECT TO authenticated
    USING (
        student_id = (SELECT auth.uid())
        OR public.can_current_counselor_view_mood(student_id, submitted_at)
    );

DROP POLICY IF EXISTS mood_checkins_insert_own ON public.mood_checkins;
CREATE POLICY mood_checkins_insert_own ON public.mood_checkins
    FOR INSERT TO authenticated
    WITH CHECK (
        student_id = (SELECT auth.uid())
        AND public.current_app_role() = 'user'
    );

DROP POLICY IF EXISTS mood_checkins_update_own ON public.mood_checkins;
CREATE POLICY mood_checkins_update_own ON public.mood_checkins
    FOR UPDATE TO authenticated
    USING (student_id = (SELECT auth.uid()) AND public.current_app_role() = 'user')
    WITH CHECK (student_id = (SELECT auth.uid()) AND public.current_app_role() = 'user');

DROP POLICY IF EXISTS mood_checkins_delete_own ON public.mood_checkins;
CREATE POLICY mood_checkins_delete_own ON public.mood_checkins
    FOR DELETE TO authenticated
    USING (student_id = (SELECT auth.uid()) AND public.current_app_role() = 'user');

CREATE OR REPLACE FUNCTION public.student_set_mood_sharing(
    p_share_enabled BOOLEAN,
    p_consent_version TEXT
)
RETURNS TABLE (share_enabled BOOLEAN, consent_version TEXT, consented_at TIMESTAMPTZ, revoked_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'user' THEN
        RAISE EXCEPTION 'Only students can manage mood sharing'
            USING ERRCODE = '42501';
    END IF;
    IF p_share_enabled AND p_consent_version IS DISTINCT FROM 'mood-share-v1' THEN
        RAISE EXCEPTION 'Please review the current mood-sharing consent'
            USING ERRCODE = '22023';
    END IF;

    IF p_share_enabled THEN
        INSERT INTO public.mood_sharing_consents AS current_consent (
            student_id, share_enabled, consent_version, consented_at, revoked_at, updated_at
        ) VALUES (auth.uid(), true, p_consent_version, now(), NULL, now())
        ON CONFLICT (student_id) DO UPDATE SET
            share_enabled = true,
            consent_version = EXCLUDED.consent_version,
            consented_at = now(),
            revoked_at = NULL,
            updated_at = now();
    ELSE
        UPDATE public.mood_sharing_consents AS current_consent
        SET share_enabled = false, revoked_at = now(), updated_at = now()
        WHERE current_consent.student_id = auth.uid();
    END IF;

    RETURN QUERY
    SELECT c.share_enabled, c.consent_version, c.consented_at, c.revoked_at
    FROM public.mood_sharing_consents AS c
    WHERE c.student_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_directory(p_search TEXT DEFAULT NULL)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    student_number TEXT,
    role TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
    END IF;
    RETURN QUERY
    SELECT p.id, p.email::text, p.full_name::text, p.student_id::text, p.role::text, p.created_at
    FROM public.profiles AS p
    WHERE p.role IN ('user'::public.user_role, 'counselor'::public.user_role)
      AND (
          NULLIF(trim(p_search), '') IS NULL
          OR p.full_name ILIKE '%' || trim(p_search) || '%'
          OR p.student_id ILIKE '%' || trim(p_search) || '%'
          OR p.email ILIKE '%' || trim(p_search) || '%'
      )
    ORDER BY p.role, p.full_name NULLS LAST, p.created_at DESC
    LIMIT 250;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_assignments()
RETURNS TABLE (
    assignment_id UUID,
    student_id UUID,
    student_name TEXT,
    student_number TEXT,
    counselor_id UUID,
    counselor_name TEXT,
    assigned_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
    END IF;
    RETURN QUERY
    SELECT a.id, a.student_id, s.full_name::text, s.student_id::text,
           a.counselor_id, c.full_name::text, a.assigned_at
    FROM public.counselor_assignments AS a
    JOIN public.profiles AS s ON s.id = a.student_id
    JOIN public.profiles AS c ON c.id = a.counselor_id
    WHERE a.revoked_at IS NULL
    ORDER BY c.full_name, s.full_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_target_user_id UUID, p_new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
DECLARE
    v_old_role TEXT;
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
    END IF;
    IF p_new_role NOT IN ('user', 'counselor') THEN
        RAISE EXCEPTION 'Only student and counselor roles can be assigned here'
            USING ERRCODE = '22023';
    END IF;

    SELECT p.role::text INTO v_old_role
    FROM public.profiles AS p
    WHERE p.id = p_target_user_id
    FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found' USING ERRCODE = 'P0002';
    END IF;
    IF v_old_role = 'admin' THEN
        RAISE EXCEPTION 'Administrator roles can only be managed through a trusted database operation'
            USING ERRCODE = '42501';
    END IF;
    IF v_old_role = p_new_role THEN
        RETURN;
    END IF;

    UPDATE public.profiles SET role = p_new_role::public.user_role WHERE id = p_target_user_id;

    IF p_new_role = 'counselor' THEN
        UPDATE public.counselor_assignments SET revoked_at = now()
        WHERE student_id = p_target_user_id AND revoked_at IS NULL;
    ELSE
        UPDATE public.counselor_assignments SET revoked_at = now()
        WHERE counselor_id = p_target_user_id AND revoked_at IS NULL;
    END IF;

    INSERT INTO public.admin_audit_log(actor_id, action, target_user_id, details)
    VALUES (auth.uid(), 'role_changed', p_target_user_id,
            jsonb_build_object('from', v_old_role, 'to', p_new_role));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_assign_student(p_student_id UUID, p_counselor_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
DECLARE
    v_student_role TEXT;
    v_counselor_role TEXT;
    v_previous_counselor UUID;
    v_assignment_id UUID;
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
    END IF;

    SELECT p.role::text INTO v_student_role FROM public.profiles AS p WHERE p.id = p_student_id FOR UPDATE;
    SELECT p.role::text INTO v_counselor_role FROM public.profiles AS p WHERE p.id = p_counselor_id FOR UPDATE;
    IF v_student_role IS DISTINCT FROM 'user' THEN
        RAISE EXCEPTION 'Select an account with the student role' USING ERRCODE = '22023';
    END IF;
    IF v_counselor_role IS DISTINCT FROM 'counselor' THEN
        RAISE EXCEPTION 'Select an account with the counselor role' USING ERRCODE = '22023';
    END IF;

    SELECT a.counselor_id, a.id INTO v_previous_counselor, v_assignment_id
    FROM public.counselor_assignments AS a
    WHERE a.student_id = p_student_id AND a.revoked_at IS NULL
    FOR UPDATE;
    IF v_assignment_id IS NOT NULL AND v_previous_counselor = p_counselor_id THEN
        RETURN v_assignment_id;
    END IF;
    IF v_assignment_id IS NOT NULL THEN
        UPDATE public.counselor_assignments SET revoked_at = now() WHERE id = v_assignment_id;
    END IF;

    INSERT INTO public.counselor_assignments(student_id, counselor_id, assigned_by)
    VALUES (p_student_id, p_counselor_id, auth.uid())
    RETURNING id INTO v_assignment_id;

    INSERT INTO public.admin_audit_log(actor_id, action, target_user_id, student_id, counselor_id, details)
    VALUES (auth.uid(), 'counselor_assigned', p_student_id, p_student_id, p_counselor_id,
            jsonb_build_object('previous_counselor_id', v_previous_counselor));
    RETURN v_assignment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_unassign_student(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
DECLARE
    v_counselor_id UUID;
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
    END IF;
    UPDATE public.counselor_assignments
    SET revoked_at = now()
    WHERE student_id = p_student_id AND revoked_at IS NULL
    RETURNING counselor_id INTO v_counselor_id;
    IF v_counselor_id IS NULL THEN
        RETURN false;
    END IF;
    INSERT INTO public.admin_audit_log(actor_id, action, target_user_id, student_id, counselor_id)
    VALUES (auth.uid(), 'counselor_unassigned', p_student_id, p_student_id, v_counselor_id);
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.counselor_list_assigned_students()
RETURNS TABLE (
    student_id UUID,
    full_name TEXT,
    student_number TEXT,
    mood_sharing_enabled BOOLEAN,
    sharing_since TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'counselor' THEN
        RAISE EXCEPTION 'Counselor access required' USING ERRCODE = '42501';
    END IF;
    RETURN QUERY
    SELECT p.id, p.full_name::text, p.student_id::text,
           COALESCE(c.share_enabled, false),
           CASE WHEN c.share_enabled THEN c.consented_at ELSE NULL END
    FROM public.counselor_assignments AS a
    JOIN public.profiles AS p ON p.id = a.student_id
    LEFT JOIN public.mood_sharing_consents AS c ON c.student_id = a.student_id
    WHERE a.counselor_id = auth.uid()
      AND a.revoked_at IS NULL
      AND p.role = 'user'::public.user_role
    ORDER BY p.full_name NULLS LAST, p.student_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.counselor_get_mood_checkins(
    p_student_id UUID,
    p_from DATE,
    p_to DATE
)
RETURNS TABLE (checkin_date DATE, period TEXT, mood_score SMALLINT, submitted_at TIMESTAMPTZ)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
DECLARE
    v_consented_at TIMESTAMPTZ;
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'counselor' THEN
        RAISE EXCEPTION 'Counselor access required' USING ERRCODE = '42501';
    END IF;
    IF p_from IS NULL OR p_to IS NULL OR p_to < p_from OR p_to - p_from > 90 THEN
        RAISE EXCEPTION 'Choose a valid range of up to 90 days' USING ERRCODE = '22023';
    END IF;

    SELECT c.consented_at INTO v_consented_at
    FROM public.counselor_assignments AS a
    JOIN public.mood_sharing_consents AS c ON c.student_id = a.student_id
    WHERE a.student_id = p_student_id
      AND a.counselor_id = auth.uid()
      AND a.revoked_at IS NULL
      AND c.share_enabled;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student is not assigned to you or has not enabled mood sharing'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT m.checkin_date, m.period, m.mood_score, m.submitted_at
    FROM public.mood_checkins AS m
    WHERE m.student_id = p_student_id
      AND m.checkin_date BETWEEN p_from AND p_to
      AND m.submitted_at >= v_consented_at
    ORDER BY m.checkin_date, m.period;
END;
$$;

REVOKE ALL ON FUNCTION public.student_set_mood_sharing(BOOLEAN, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_directory(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_assignments() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_user_role(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_assign_student(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_unassign_student(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.counselor_list_assigned_students() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.counselor_get_mood_checkins(UUID, DATE, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.student_set_mood_sharing(BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_directory(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_assignments() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_assign_student(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_unassign_student(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.counselor_list_assigned_students() TO authenticated;
GRANT EXECUTE ON FUNCTION public.counselor_get_mood_checkins(UUID, DATE, DATE) TO authenticated;

COMMIT;
