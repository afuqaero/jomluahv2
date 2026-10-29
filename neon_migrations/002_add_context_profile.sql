-- Per-user conversation-context preference for existing Neon branches.
-- Apply to a development branch first, then production, using a direct
-- (non-pooler) connection.

BEGIN;

ALTER TABLE public.ai_preferences
    ADD COLUMN IF NOT EXISTS context_profile TEXT NOT NULL DEFAULT 'balanced';

ALTER TABLE public.ai_preferences
    DROP CONSTRAINT IF EXISTS ai_preferences_context_profile_valid;

ALTER TABLE public.ai_preferences
    DROP CONSTRAINT IF EXISTS ai_preferences_context_profile_check;

ALTER TABLE public.ai_preferences
    ADD CONSTRAINT ai_preferences_context_profile_valid
    CHECK (context_profile IN ('quick', 'balanced', 'deep'));

COMMIT;
