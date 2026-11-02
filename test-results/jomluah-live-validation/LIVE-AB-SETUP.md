# Live Neon A/B journal isolation test

This is an **opt-in test against the live Neon Data API**. It only accesses exact random-ID fictional journal fixtures created by two dedicated test accounts. It does not enumerate or read existing journals, chats, or counselling records. Unlike a transaction-only SQL test, Data API writes commit immediately; the test deletes its fixtures afterward and fails if cleanup cannot be verified.

## Executed one-shot run

`npm run test:live-ab:once` was executed twice successfully on 2026-11-02: 4/4 live tests passed on each run. The runner generated both test credentials in memory, created the Auth accounts, marked only those generated accounts verified for sign-in, ran the same Data API suite, then deleted both accounts by their generated emails. Cleanup reported one deleted and zero remaining for each account; a final read-only query found zero matching test accounts. Earlier failed attempts also cleaned up their generated accounts. This command uses the existing `.env.local` Auth/Data API endpoints and direct database connection for synthetic account setup/cleanup; it never prints passwords or tokens. Future runs require `JOMLUAH_LIVE_AB_CONFIRM=I_ACCEPT_SYNTHETIC_WRITES_TO_LIVE_DB` in the invoking shell. Do not run it casually against a production project because it intentionally performs temporary writes.

## Prerequisites

1. Pre-create two disposable Neon Auth accounts specifically for this test. Their emails must begin `jl-ab-test-` and their passwords must be distinct and at least 16 characters. Do not use any real student, counselor, or admin account. Do not place their passwords in `.env.local` or commit them.
2. Leave the existing `NEON_AUTH_BASE_URL` and `NEON_DATA_API_URL` in `.env.local`. The guard reads **only those two endpoints** and requires exact matching values supplied at invocation. It never loads the database password.
3. In a private shell, set the variables below. Keep their values out of screenshots, logs, and the repository:

```text
JOMLUAH_LIVE_AB_CONFIRM=I_ACCEPT_SYNTHETIC_WRITES_TO_LIVE_DB
JOMLUAH_LIVE_AB_AUTH_URL=<exact NEON_AUTH_BASE_URL from .env.local>
JOMLUAH_LIVE_AB_DATA_API_URL=<exact NEON_DATA_API_URL from .env.local>
JOMLUAH_LIVE_AB_USER_A_EMAIL=jl-ab-test-a@<test domain>
JOMLUAH_LIVE_AB_USER_A_PASSWORD=<test-only password>
JOMLUAH_LIVE_AB_USER_B_EMAIL=jl-ab-test-b@<test domain>
JOMLUAH_LIVE_AB_USER_B_PASSWORD=<different test-only password>
```

4. Run `npm run preflight:live-ab`, then `npm run test:live-ab`. The preflight makes no network requests. The test signs in through real Neon Auth and uses real bearer JWTs against the Data API; it does not simulate `auth.uid()` or use an admin database role.

## Assertions

- A and B authenticate as distinct dedicated identities.
- Each creates and reads its own fictional journal.
- Neither can read the other's exact fixture ID or embedding, even when specifying the other owner's ID.
- Cross-owner insert, update, delete, and owner transfer are denied; own update and delete succeed.
- Missing authentication cannot read a synthetic fixture.
- Cleanup deletes **only the three generated fixture IDs** and verifies they are gone for both test identities. Cleanup failures fail the run and require manual inspection of the reported fixture IDs.

This does not test the full Next `/api/chat` route, DeepSeek agent tool calls, provider failure behavior, or counselling-record privacy. A passed A/B test proves this scoped Data API journal boundary only. No live A/B result should be reported until the command actually runs with the two test accounts.
