BEGIN;

CREATE OR REPLACE FUNCTION public.counselor_cancel_appointment(p_appointment_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'counselor' THEN
        RAISE EXCEPTION 'Counselor access required' USING ERRCODE = '42501';
    END IF;

    UPDATE public.counselor_appointments AS appointment
    SET status = 'cancelled'
    WHERE appointment.id = p_appointment_id
      AND appointment.counselor_id = auth.uid()
      AND appointment.status = 'scheduled'
      AND EXISTS (
          SELECT 1
          FROM public.counselor_assignments AS assignment
          JOIN public.profiles AS student ON student.id = assignment.student_id
          WHERE assignment.student_id = appointment.student_id
            AND assignment.counselor_id = appointment.counselor_id
            AND assignment.revoked_at IS NULL
            AND student.role = 'user'::public.user_role
      );
    RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.counselor_cancel_appointment(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.counselor_cancel_appointment(UUID) TO authenticated;

COMMIT;
