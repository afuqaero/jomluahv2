# Security findings and open validation risks

## Verified local failures and fixes

1. **Crisis classification false negatives (fixed locally; route not yet validated).** Direct source execution classified `I feel like ending everything tonight` and `Everyone would be better without me` as `none` before the fix. The patterns and unit regressions now classify both as `urgent`; 9/9 focused direct probes and 20/20 backend unit cases pass. This is not a clinical safety verdict.
2. **Type-check failure (fixed locally).** Three `urgent` comparisons inside the already `none`-narrowed retrieval block caused TS2367. Removing the redundant comparisons restored `tsc --noEmit` exit 0 without opening retrieval for concern/urgent messages.

## Unverified boundaries

- **RLS and migration 006:** Live catalog inspection confirms RLS enabled on five inspected tables, four owner-scoped journal policies, and the profile self-insert policy limited to `role = 'user'`. A subsequent live A/B run passed four journal Data API tests with fictional users and rows; this verifies the scoped journal boundary. Migration 006 behavior, other tables, and the full app route were not exercised.
- **Agent and RAG isolation:** The source passes authenticated IDs to retrieval, but actual DeepSeek tool calls and Neon responses were not observed. Synthetic injection and A/B tests remain blocked.
- **Journal privacy:** The schema stores journal title, mood, excerpt, tags and embedding in ordinary text/JSONB at the application level. Database/operator visibility, backups, and deployed policies were not verified here. Do not claim end-to-end encryption for these fields.
- **Provider privacy:** The application sends query/journal-derived text to embedding and response providers when configured. Retention, training-use, logging, and regional-processing terms were not verified in this run; obtain current provider documentation and institutional approval before sending real student data.
- **Route-level crisis and telemetry:** Unit tests cover helpers, not the full authenticated Next route or induced provider/telemetry failure. Those outcomes remain unverified.

One OpenRouter embedding request with fictional text was executed using `.env.local` provider configuration. The live database was queried for catalog metadata and used for exact-ID fictional A/B journal fixtures. Two generated Auth accounts and all synthetic rows were removed; zero test identities remained. No real student information was read and no deployment/schema change was made.
