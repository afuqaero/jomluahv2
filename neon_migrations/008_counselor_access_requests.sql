BEGIN;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS counselor_access_requested BOOLEAN NOT NULL DEFAULT false;

DROP FUNCTION IF EXISTS public.admin_list_directory(TEXT);
CREATE FUNCTION public.admin_list_directory(p_search TEXT DEFAULT NULL)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    student_number TEXT,
    role TEXT,
    created_at TIMESTAMPTZ,
    counselor_access_requested BOOLEAN
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
    SELECT p.id, p.email::text, p.full_name::text, p.student_id::text, p.role::text,
           p.created_at, p.counselor_access_requested
    FROM public.profiles AS p
    WHERE p.role IN ('user'::public.user_role, 'counselor'::public.user_role)
      AND (NULLIF(trim(p_search), '') IS NULL OR p.full_name ILIKE '%' || trim(p_search) || '%'
           OR p.student_id ILIKE '%' || trim(p_search) || '%' OR p.email ILIKE '%' || trim(p_search) || '%')
    ORDER BY p.role, p.full_name NULLS LAST, p.created_at DESC
    LIMIT 250;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_directory(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_directory(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_target_user_id UUID, p_new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
DECLARE
    v_old_role TEXT;
    v_staff_request BOOLEAN;
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
    END IF;
    IF p_new_role NOT IN ('user', 'counselor') THEN
        RAISE EXCEPTION 'Only student and counselor roles can be assigned here' USING ERRCODE = '22023';
    END IF;
    SELECT p.role::text, p.counselor_access_requested INTO v_old_role, v_staff_request
    FROM public.profiles AS p WHERE p.id = p_target_user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'User profile not found' USING ERRCODE = 'P0002'; END IF;
    IF v_old_role = 'admin' THEN
        RAISE EXCEPTION 'Administrator roles can only be managed through a trusted database operation' USING ERRCODE = '42501';
    END IF;
    IF p_new_role = 'counselor' AND NOT v_staff_request THEN
        RAISE EXCEPTION 'Only accounts registered through counselor staff registration can be made counselors' USING ERRCODE = '42501';
    END IF;
    IF v_old_role = p_new_role THEN RETURN; END IF;

    UPDATE public.profiles
    SET role = p_new_role::public.user_role,
        counselor_access_requested = CASE WHEN p_new_role = 'counselor' THEN false ELSE counselor_access_requested END
    WHERE id = p_target_user_id;
    IF p_new_role = 'counselor' THEN
        UPDATE public.counselor_assignments SET revoked_at = now() WHERE student_id = p_target_user_id AND revoked_at IS NULL;
    ELSE
        UPDATE public.counselor_assignments SET revoked_at = now() WHERE counselor_id = p_target_user_id AND revoked_at IS NULL;
    END IF;
    INSERT INTO public.admin_audit_log(actor_id, action, target_user_id, details)
    VALUES (auth.uid(), 'role_changed', p_target_user_id, jsonb_build_object('from', v_old_role, 'to', p_new_role));
END;
$$;

COMMIT;
