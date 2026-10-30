CREATE TABLE IF NOT EXISTS public.user_chat_encryption_keys (
    user_id UUID PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    salt TEXT NOT NULL,
    wrap_iv TEXT NOT NULL,
    wrapped_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_chat_encryption_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_chat_encryption_keys_manage_own ON public.user_chat_encryption_keys;
CREATE POLICY user_chat_encryption_keys_manage_own ON public.user_chat_encryption_keys
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_chat_encryption_keys TO authenticated;
