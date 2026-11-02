# Safety and Privacy Evaluation

## Verdict: NOT TESTED end-to-end

- Evaluation fixtures contain fictional text only. No counselling content or production records were accessed.
- Inspected memory/journal queries bind to the authenticated `user_id`; this is a source observation, not runtime isolation proof.
- No isolated test database/auth tenant exists locally, so synthetic User A/B cross-tenant requests and database policies were not exercised.
- No test-only `DEEPSEEK_API_KEY` is configured. No live distress/crisis prompts, unsafe-advice challenges, unsupported-answer abstention, prompt injection, or malicious retrieved text were sent to a model.
- Existing classifier/unit tests passing does not validate generated response safety.
- Schema/privacy finding: `journal_entries.title`, `mood`, `excerpt`, `tags`, and `embedding` are ordinary text/JSONB in the checked initial migration. The chat-encryption migration does not cover those fields. Application image handling encrypts journal images separately. This is schema/code inspection; no records were read.
- Vectors are derived from personal journal/memory content and should be treated as sensitive data, not anonymous. This evaluation did not test whether an operator/database owner can reconstruct or infer sensitive attributes from them.

## Follow-up needed

Provision a fresh empty Neon test database and synthetic identities/records, plus a test-only DeepSeek credential with a strict spending limit. Run cross-user access-denial attempts and capture redacted request/tool/result traces. Include Malay, English, Manglish, typos, indirect memory references, unsupported questions, crisis language, and adversarial retrieved content. Keep all evidence synthetic and never clone the production database.
