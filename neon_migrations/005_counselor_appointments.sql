BEGIN;

CREATE TABLE IF NOT EXISTS public.counselor_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counselor_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('individual', 'follow_up', 'initial')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT counselor_appointments_valid_time CHECK (ends_at > starts_at AND ends_at <= starts_at + interval '2 hours')
);

CREATE INDEX IF NOT EXISTS counselor_appointments_counselor_start_idx
    ON public.counselor_appointments(counselor_id, starts_at)
    WHERE status = 'scheduled';

ALTER TABLE public.counselor_appointments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.counselor_appointments FROM PUBLIC, authenticated;

CREATE OR REPLACE FUNCTION public.counselor_list_appointments(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (id UUID, student_id UUID, student_name TEXT, starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ, kind TEXT, status TEXT)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'counselor' THEN
        RAISE EXCEPTION 'Counselor access required' USING ERRCODE = '42501';
    END IF;
    IF p_from IS NULL OR p_to IS NULL OR p_to <= p_from OR p_to > p_from + interval '93 days' THEN
        RAISE EXCEPTION 'Choose a valid range of up to 93 days' USING ERRCODE = '22023';
    END IF;
    RETURN QUERY
    SELECT ap.id, ap.student_id, p.full_name::text, ap.starts_at, ap.ends_at, ap.kind, ap.status
    FROM public.counselor_appointments AS ap
    JOIN public.counselor_assignments AS a ON a.student_id = ap.student_id AND a.counselor_id = ap.counselor_id AND a.revoked_at IS NULL
    JOIN public.profiles AS p ON p.id = ap.student_id AND p.role = 'user'::public.user_role
    WHERE ap.counselor_id = auth.uid()
      AND ap.status = 'scheduled'
      AND ap.starts_at >= p_from AND ap.starts_at < p_to
    ORDER BY ap.starts_at, ap.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.counselor_create_appointment(
    p_student_id UUID, p_starts_at TIMESTAMPTZ, p_ends_at TIMESTAMPTZ, p_kind TEXT
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF public.current_app_role() IS DISTINCT FROM 'counselor' THEN
        RAISE EXCEPTION 'Counselor access required' USING ERRCODE = '42501';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM public.counselor_assignments AS a
        JOIN public.profiles AS p ON p.id = a.student_id AND p.role = 'user'::public.user_role
        WHERE a.student_id = p_student_id AND a.counselor_id = auth.uid() AND a.revoked_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Student is not assigned to you' USING ERRCODE = '42501';
    END IF;
    IF p_starts_at IS NULL OR p_ends_at IS NULL OR p_starts_at < now()
       OR p_ends_at <= p_starts_at OR p_ends_at > p_starts_at + interval '2 hours'
       OR p_kind NOT IN ('individual', 'follow_up', 'initial') THEN
        RAISE EXCEPTION 'Choose a future session of up to two hours and a valid type' USING ERRCODE = '22023';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 8472));
    IF EXISTS (
        SELECT 1 FROM public.counselor_appointments AS ap
        WHERE ap.counselor_id = auth.uid() AND ap.status = 'scheduled'
          AND tstzrange(ap.starts_at, ap.ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
    ) THEN
        RAISE EXCEPTION 'This time overlaps another session' USING ERRCODE = '23505';
    END IF;

    INSERT INTO public.counselor_appointments(counselor_id, student_id, starts_at, ends_at, kind)
    VALUES (auth.uid(), p_student_id, p_starts_at, p_ends_at, p_kind)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

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
    UPDATE public.counselor_appointments AS ap
    SET status = 'cancelled'
    WHERE ap.id = p_appointment_id AND ap.counselor_id = auth.uid() AND ap.status = 'scheduled';
    RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.counselor_list_appointments(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.counselor_create_appointment(UUID, TIMESTAMPTZ, TIMESTAMPTZ, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.counselor_cancel_appointment(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.counselor_list_appointments(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.counselor_create_appointment(UUID, TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.counselor_cancel_appointment(UUID) TO authenticated;

COMMIT;
