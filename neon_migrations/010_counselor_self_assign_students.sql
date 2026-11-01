BEGIN;

CREATE OR REPLACE FUNCTION public.counselor_list_available_students()
RETURNS TABLE (student_id UUID, full_name TEXT, student_number TEXT)
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
    SELECT p.id, p.full_name::text, p.student_id::text
    FROM public.profiles AS p
    WHERE p.role = 'user'::public.user_role
      AND NOT EXISTS (
          SELECT 1
          FROM public.counselor_assignments AS a
          WHERE a.student_id = p.id
            AND a.revoked_at IS NULL
      )
    ORDER BY p.full_name NULLS LAST, p.student_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.counselor_assign_available_student(p_student_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
DECLARE
    v_assignment_id UUID;
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'counselor' THEN
        RAISE EXCEPTION 'Counselor access required' USING ERRCODE = '42501';
    END IF;

    PERFORM 1
    FROM public.profiles AS p
    WHERE p.id = p_student_id
      AND p.role = 'user'::public.user_role
    FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student is no longer available' USING ERRCODE = 'P0002';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.counselor_assignments AS a
        WHERE a.student_id = p_student_id
          AND a.revoked_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Student is no longer available' USING ERRCODE = 'P0002';
    END IF;

    INSERT INTO public.counselor_assignments(student_id, counselor_id, assigned_by)
    VALUES (p_student_id, auth.uid(), auth.uid())
    RETURNING id INTO v_assignment_id;

    INSERT INTO public.admin_audit_log(actor_id, action, target_user_id, student_id, counselor_id, details)
    VALUES (auth.uid(), 'counselor_assigned', p_student_id, p_student_id, auth.uid(),
            jsonb_build_object('source', 'counselor_self_assignment'));

    RETURN v_assignment_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Student is no longer available' USING ERRCODE = 'P0002';
END;
$$;

REVOKE ALL ON FUNCTION public.counselor_list_available_students() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.counselor_assign_available_student(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.counselor_list_available_students() TO authenticated;
GRANT EXECUTE ON FUNCTION public.counselor_assign_available_student(UUID) TO authenticated;

COMMIT;
