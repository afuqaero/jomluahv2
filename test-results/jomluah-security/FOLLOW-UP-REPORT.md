# Crisis Safety and Test Infrastructure Follow-up

## Outcome

Safety handling and its unit tests were improved. Offline tests and preflight were run on 2026-11-02. Preflight blocked isolated integration because test-only configuration is missing. No production Neon endpoint, user data, provider, or secret was accessed.

| Area | Result | Evidence |
|---|---|---|
| Root cause: `I tak nak hidup lagi` | PASS — covered by passing unit case | Normalization and current-intent patterns in `app/lib/chatSafety.ts`; live behavior not clinically validated. |
| English/Malay/Manglish and informal spelling | PASS — unit suite | Direct, indirect, informal, and context-dependent cases are covered in `tests/ai-backend.test.ts`. |
| Negative, quoted, historical false positives | PASS — unit suite | Explicit denials, attributed quotations, historical concern, education mention, and unrelated location phrase assertions pass. |
| Retrieval bypass for urgent/concern | PASS — helper unit assertions | Route uses `shouldRetrieveForSafety` to skip personalized context loading for those levels. Full HTTP route remains untested. |
| LLM/provider failure fallback | PASS — fallback helper assertions | Concern gets a local supportive response; urgent path remains deterministic. No provider outage was simulated in the route. |
| Telemetry write failure | NOT TESTED | Source catches the insert error, but route-level behavior was not executed. |
| Isolated test guard coverage | PASS — 3 unit cases | Covers target path/host validation and provider opt-in/fixed hosts. |
| Prepared Neon/agent integration assertions | NOT TESTED live | Owner-transfer assertion added; live RLS, migration 006 and agent behavior remain gated. |

## Test execution record

**Final backend suite:** 20 passed, 0 failed, 0 skipped. The first run had 19 passed and 1 failed because the expected result for an educational mention was inverted; the assertion was corrected and the full rerun passed. **Live integration tests run:** 0.

| Planned command/check | Status | Reason |
|---|---|---|
| `npm run test:backend` | PASS — 20/20 on final run | Offline Node unit suite; provider adapter is stubbed and guard tests use synthetic `.invalid` values. |
| `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --check tests/integration/neon-isolation.test.ts` | PASS — syntax only | Parse-only; did not run hooks or make network requests. |
| `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --check tests/integration/agentic-live.test.ts` | PASS — syntax only | Parse-only; did not run hooks or call providers. |
| Integration test registration | PASS — static check | `package.json` registers `test:isolated-security` and `test:isolated-agent`. |
| `npm run preflight:isolated` | BLOCKED — exit 1 | Missing test confirmation, isolated Auth/Data API URLs and allowlisted hosts, and both `.invalid` test identities/passwords. No request was made. |
| Neon RLS/migration integration | BLOCKED — not invoked | Preflight prerequisites failed; isolated Neon project and test accounts are absent. |
| Provider preflight/live agent tests | BLOCKED — not invoked | No test-only provider keys/model or paid-call opt-in; no live calls made. |

Static discovery found 13 cases in `tests/ai-backend.test.ts`, 3 in `tests/isolated-test-guards.test.ts`, 3 in `tests/chat-layout.test.ts`, and 1 in `tests/google-calendar.test.ts` (20 unit cases). There are 3 Neon integration cases and 4 live-agent cases; neither integration suite was run. `git diff --check` passed earlier with a line-ending conversion warning for the safety module.

## Crisis language covered by added regression cases

- **Urgent English:** wanting to end one’s life; suicidal; wishing to be dead; not wanting to live; not waking up; “everyone would be better off without me”; no reason to keep living.
- **Urgent Malay/Manglish:** `Saya rasa nak bunuh diri`, `Aku dah tak sanggup hidup lagi`, `I tak nak hidup lagi`, `Aku taknak hidup`, `I rasa nak mati`, and `Kalau aku tak ada, semua orang lagi senang`.
- **Informal spelling:** `suisidal`, `d1e`, elongated repeated letters, and compact forms such as `taknak`.
- **Concern/uncertain:** wanting to disappear, `I can't do this anymore`, `I rasa macam nak hilang`, hopelessness, and past crisis statements.
- **False-positive controls:** ordinary “not wanting to live in Kuala Lumpur,” explicit denials, a friend’s quoted statement, educational mention of suicide prevention, historical thoughts with reassurance, and negated depression.

## Remaining false-negative risk

The phrase list is not a complete multilingual intent model. Potentially missed or misclassified formulations include novel slang, code-switching beyond the tested combinations, euphemisms such as “I’m done here,” indirect references such as “I want everything to stop,” typo variants other than the covered examples, sarcasm, and culturally specific idioms. Context can still be ambiguous. Add reviewed examples from synthetic evaluation sets and, for uncertain language, preserve the non-provider supportive fallback; automated tests do not establish clinical reliability.

## Remaining security limitations

- No deployed RLS policy or migration 006 behavior was verified; those checks remain NOT TESTED until a fresh isolated Neon project and two `.invalid` identities are available.
- No live Qwen/DeepSeek call, prompt-injection outcome, or provider trace exists. No mock was substituted for those live checks.
- Prepared live tests exercise core agent/retrieval modules, not the full authenticated Next `/api/chat` route.
- The phrase detector is a conservative software safeguard, not diagnosis, crisis assessment, or clinical certification. Auth infrastructure failure before user authentication is still an API failure; it does not expose records or invoke the model, but this environment did not test that route behavior.

## Changed files

- `app/lib/chatSafety.ts` — normalization, contextual patterns, denials/history handling, retrieval gate, local fallback response.
- `app/api/chat/route.ts` — skip personalized context and tools for concern/urgent messages; use local concern fallback when the model fails; tolerate telemetry insert errors.
- `tests/ai-backend.test.ts` — multilingual, false-positive, fallback, and retrieval-gate regressions.
- `tests/isolated-test-guards.test.ts` — no-network configuration guard unit tests.
- `tests/integration/neon-isolation.test.ts` — prevents unauthorized ownership transfer in addition to existing A/B checks.
