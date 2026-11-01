BEGIN;

UPDATE public.profiles
SET counselor_access_requested = false
WHERE role = 'counselor'::public.user_role
  AND counselor_access_requested = true;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_counselor_request_pending_only
    CHECK (role <> 'counselor'::public.user_role OR NOT counselor_access_requested);

COMMIT;
