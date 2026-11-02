# Recall-Intent Routing Fix

## Outcome

Fixed the three previously observed routing misses with narrow, deterministic autobiographical-journal cues. The 0.375 journal relevance cutoff, crisis routing order, authentication, and ownership filters were unchanged.

## Root causes and before/after

| Case | Before | Root cause | After |
|---|---|---|---|
| BM1 — “Ingat tak apa yang buat saya rasa dekat dengan family masa mula duduk kampus?” | DeepSeek selected `search_memories`; no journal search | `ingat` matched memory intent, but the planner did not recognize the Malay past-event question as journal recall | Journal-only recall; 2 journal searches; expected `family` entry retrieved and cited |
| MM1 — “Assignment tengah bertimbun tu, what small thing made me start ah?” | No recall agent or retrieval | No recognized journal/diary/remember/history cue | Journal-only recall; 1 journal search; expected `assignment` entry retrieved and cited |
| M2 — “What helped me feel more comfortable speaking up, from my presentation and discussion group notes?” | No recall agent or retrieval | First-person “what helped/made me” phrasing was not treated as past personal context | Journal-only recall; 2 journal searches; both expected entries retrieved and cited |

The previous live run also exposed overbroad no-evidence wording (“no journal entries saved”). The route now instructs the model to say only that the requested detail was not found, not that the user has no entries. The rerun answered N1 accurately without claiming the journal was empty.

## Changes

- `app/lib/aiRetrievalPlan.ts`: recognize first-person retrospective “what/which/how helped/made/worked for me” questions and the narrow Malay pattern “ingat tak apa … buat/bantu … saya”; route these to journals only. Existing ordinary present-tense support requests stay out of recall.
- `app/api/chat/route.ts`: constrain no-match wording to the specific requested fact and explicitly prohibit claiming the journal is empty.
- `tests/ai-backend.test.ts`: add three individual exact-phrase regression tests, four negative ordinary/support questions, and retain existing history, ambiguous, and urgent-safety checks.
- `scripts/run-isolated-chat-route.mjs`: correct uncertainty classification for natural “couldn't find” responses and report positive-recall and no-answer outcomes separately.

## Verification

- Reproduction before fix: the exact BM1 planner regression failed; the prior authenticated Neon/DeepSeek trace also showed MM1 and M2 made no journal-tool call.
- Focused routing tests: 5/5 PASS, exit code 0.
- Local backend tests (excluding the separate 28-query live evaluation requiring its own runner): 36/36 PASS, exit code 0.
- TypeScript: `npx tsc --noEmit`, exit code 0.
- Authenticated isolated run: `node scripts/run-isolated-chat-route.mjs`, exit code 0; 12/12 conversations PASS.
- Positive retrieval: 9/9 expected-recall cases (100%); no-answer rejection: 3/3; grounded/appropriately uncertain answers: 12/12; unsupported personal-memory claims: 0.
- No cross-user journal IDs or User B canary phrases appeared in User A's retrieved results or answers.
- All four negative planner controls (ordinary emotional support/advice) selected no retrieval: 0/4 unnecessary recall calls.
- Live request totals for the final 12 conversations: 17 Qwen embedding calls, 24 DeepSeek planning calls, 12 DeepSeek answer streams. The recall agent executed 18 `search_journal` tool calls across the 12 conversations; the bounded two-step agent explains follow-up searches. The three newly recognized cases added retrieval only for questions that explicitly ask what helped/made the user act in the past.
- Synthetic User A and User B journal fixtures were deleted and absence verified.

Detailed per-question IDs, scores, tool arguments, provider statuses/latencies, token usage, answers, and cleanup verification are in [DEEPSEEK-RAG-12-RESULTS.json](./DEEPSEEK-RAG-12-RESULTS.json). The aggregate live report is [DEEPSEEK-RAG-12-RESULTS.md](./DEEPSEEK-RAG-12-RESULTS.md).

## Limits

The 0/4 unnecessary-retrieval result is from deterministic planner controls, not paid live conversations for those four negative prompts. The 12-case quality checks use synthetic fixtures and automated grounding cues; they are not clinical validation or a guarantee for every phrasing. The existing recall agent may use its second search step, so those extra calls remain bounded but still add latency and provider cost.
