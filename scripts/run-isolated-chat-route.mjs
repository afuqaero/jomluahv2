import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer } from "node:net";
import { parseEnv } from "node:util";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const isolated = parseEnv(readFileSync(".env.isolated.local", "utf8"));
const provider = parseEnv(readFileSync(".env.local", "utf8"));
const testKeys = Object.fromEntries(Object.entries(isolated).filter(([name]) => name.startsWith("JOMLUAH_TEST_")));
const environment = {
  PATH: process.env.PATH,
  SystemRoot: process.env.SystemRoot,
  TEMP: process.env.TEMP,
  TMP: process.env.TMP,
  ...testKeys,
  JOMLUAH_ENABLE_LIVE_PROVIDER_TESTS: "YES_I_EXPECT_SYNTHETIC_PAID_CALLS",
  JOMLUAH_TEST_QWEN_API_KEY: provider.EMBEDDING_API_KEY,
  JOMLUAH_TEST_QWEN_MODEL: provider.EMBEDDING_MODEL,
  JOMLUAH_TEST_EMBEDDING_URL: provider.EMBEDDING_API_URL,
  JOMLUAH_TEST_DEEPSEEK_API_KEY: provider.DEEPSEEK_API_KEY,
  JOMLUAH_TEST_DEEPSEEK_MODEL: provider.DEEPSEEK_GENERAL_MODEL,
  JOMLUAH_TEST_DEEPSEEK_URL: `${(provider.DEEPSEEK_BASE_URL || "").replace(/\/$/, "")}/chat/completions`,
};
const preflight = spawnSync(process.execPath, ["scripts/preflight-isolated-tests.mjs", "--providers"], {
  env: environment,
  stdio: "inherit",
});
if (preflight.status !== 0) process.exit(preflight.status || 1);

const { readIsolatedConfig } = await import("./isolated-test-guards.mjs");
Object.assign(process.env, testKeys, {
  JOMLUAH_ENABLE_LIVE_PROVIDER_TESTS: environment.JOMLUAH_ENABLE_LIVE_PROVIDER_TESTS,
  JOMLUAH_TEST_QWEN_API_KEY: environment.JOMLUAH_TEST_QWEN_API_KEY,
  JOMLUAH_TEST_DEEPSEEK_API_KEY: environment.JOMLUAH_TEST_DEEPSEEK_API_KEY,
  JOMLUAH_TEST_DEEPSEEK_MODEL: environment.JOMLUAH_TEST_DEEPSEEK_MODEL,
  EMBEDDING_API_URL: environment.JOMLUAH_TEST_EMBEDDING_URL,
  EMBEDDING_API_KEY: environment.JOMLUAH_TEST_QWEN_API_KEY,
  EMBEDDING_MODEL: environment.JOMLUAH_TEST_QWEN_MODEL,
});
const config = readIsolatedConfig({ providers: true });

const workspace = mkdtempSync(join(tmpdir(), "jomluah-isolated-chat-"));
let server;
let serverLog = "";
let fixtureA = [];
let fixtureB = [];
let principalA;
let principalB;
const runId = `jl-route-${randomUUID()}`;
const evidence = { runId, isolatedProject: isolated.JOMLUAH_TEST_PROJECT_ID, providerCalls: "real", conversations: [], providerTrace: [], cleanup: null };
const fixtureDefinitions = [
  { id: "assignment", title: "Assignment deadlines", mood: "overwhelmed", excerpt: "I felt overwhelmed by assignment deadlines. Breaking revision into ten-minute tasks helped me start." },
  { id: "family", title: "Missing home", mood: "lonely", excerpt: "I felt homesick at university. A video call with my family helped me feel connected." },
  { id: "sleep", title: "Sleep routine", mood: "tired", excerpt: "Putting my phone away before midnight and keeping a regular bedtime helped my sleep." },
  { id: "roommate", title: "Roommate quiet hours", mood: "uneasy", excerpt: "I spoke calmly with my roommate about quiet hours and we agreed on a study schedule." },
  { id: "walk", title: "Evening walk", mood: "stressed", excerpt: "A short evening walk around campus helped me settle after a stressful day." },
  { id: "exam-prep", title: "Exam preparation", mood: "focused", excerpt: "For exams, I used flashcards and reviewed biology topics with a study partner." },
  { id: "exam-rest", title: "Rest during exams", mood: "anxious", excerpt: "During exam week, I stopped revising before midnight so I could protect my sleep." },
  { id: "meal-break", title: "Lunch break", mood: "foggy", excerpt: "Taking a lunch break and eating with a coursemate helped me regain focus." },
  { id: "presentation", title: "Presentation practice", mood: "nervous", excerpt: "Practising my club presentation with a friend helped me feel more confident speaking." },
  { id: "speaking-confidence", title: "Speaking confidence", mood: "hopeful", excerpt: "I practised speaking slowly in a small discussion group, which made sharing my ideas feel easier." },
];
const conversations = [
  { id: "R1", category: "relevant", question: "From my journal, what helped me start when assignment deadlines piled up?", expected: ["assignment"], cues: /ten.minute|small tasks|breaking.*tasks|deadlines/i },
  { id: "R2", category: "relevant", question: "According to my journal, what helped when I felt homesick at university?", expected: ["family"], cues: /call|family|connected|homesick/i },
  { id: "R3", category: "relevant", question: "What did I change in my routine to sleep better? Check my journal.", expected: ["sleep"], cues: /phone|midnight|bedtime|sleep/i },
  { id: "N1", category: "no_answer", question: "According to my journal, what was the name of the counsellor I met last month?", expected: [], cues: /don't know|do not know|don't have (?:any )?(?:entry|record|mention)|can't find|cannot find|no (?:journal )?(?:entry|record|evidence)|not (?:mentioned|recorded)|tak (?:tahu|jumpa|pasti)|tiada|tak ada/i, forbidden: /don't have any journal entries|no journal entries saved/i },
  { id: "N2", category: "no_answer", question: "What colour was the kite I flew last weekend? Check my journal.", expected: [], cues: /don't know|do not know|don't have (?:any )?(?:entry|record|mention)|can't find|cannot find|no (?:journal )?(?:entry|record|evidence)|not (?:mentioned|recorded)|tak (?:tahu|jumpa|pasti)|tiada|tak ada/i, forbidden: /red kite|mint tea/i },
  { id: "N3", category: "no_answer", question: "What medication did my doctor prescribe for headaches? Is it in my journal?", expected: [], cues: /don't know|do not know|don't have (?:any )?(?:entry|record|mention)|can't find|cannot find|no (?:journal )?(?:entry|record|evidence)|not (?:mentioned|recorded)|tak (?:tahu|jumpa|pasti)|tiada|tak ada/i, forbidden: /\b(?:ibuprofen|paracetamol|aspirin|dosage\s+\d+)\b/i },
  { id: "BM1", category: "indirect_malay_manglish", question: "Ingat tak apa yang buat saya rasa dekat dengan family masa mula duduk kampus?", expected: ["family"], cues: /call|family|rindu|rumah|kampus|connected/i },
  { id: "MM1", category: "indirect_malay_manglish", question: "Assignment tengah bertimbun tu, what small thing made me start ah?", expected: ["assignment"], cues: /ten.minute|small tasks|breaking.*tasks|assignment|deadline/i },
  { id: "M1", category: "multiple_relevant", question: "From my journal, how did I prepare for exams and protect my rest during exam week?", expected: ["exam-prep", "exam-rest"], cues: /flashcard|study partner|midnight|sleep|rest/i },
  { id: "M2", category: "multiple_relevant", question: "What helped me feel more comfortable speaking up, from my presentation and discussion group notes?", expected: ["presentation", "speaking-confidence"], cues: /practic|friend|confident|speaking|discussion group/i },
  { id: "B1", category: "borderline", question: "In my journal, what helped make the shared room feel less tense?", expected: ["roommate"], cues: /quiet hours|roommate|study schedule|spoke calmly/i },
  { id: "B2", category: "borderline", question: "What small night-time change helped me feel less groggy the next day? See if my journal mentions it.", expected: ["sleep"], cues: /phone|midnight|bedtime|sleep/i },
];

function cookieHeader(response) {
  return (response.headers.getSetCookie?.() || []).map((part) => part.split(";", 1)[0]).join("; ");
}

async function directIdentity(label) {
  const email = isolated[`JOMLUAH_TEST_USER_${label}_EMAIL`];
  const password = isolated[`JOMLUAH_TEST_USER_${label}_PASSWORD`];
  const signin = await fetch(`${config.authUrl}/sign-in/email`, {
    method: "POST", headers: { "content-type": "application/json", origin: "http://localhost:3000" },
    body: JSON.stringify({ email, password }), signal: AbortSignal.timeout(15_000),
  });
  assert.equal(signin.ok, true, `fictional User ${label} Auth login failed (${signin.status})`);
  const session = await fetch(`${config.authUrl}/get-session`, {
    headers: { cookie: cookieHeader(signin), origin: "http://localhost:3000" },
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await session.json();
  const jwt = session.headers.get("set-auth-jwt");
  assert.ok(payload.user?.id && jwt, `fictional User ${label} JWT missing`);
  return { id: payload.user.id, jwt, email, password };
}

async function journalRequest(principal, method, query, data) {
  const response = await fetch(`${config.dataUrl}/journal_entries?${query}`, {
    method,
    headers: { authorization: `Bearer ${principal.jwt}`, "content-type": "application/json", prefer: "return=representation" },
    ...(data ? { body: JSON.stringify(data) } : {}),
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json().catch(() => null);
  assert.equal(response.ok, true, `fictional journal ${method} failed (${response.status})`);
  return payload;
}

async function freePort() {
  return new Promise((done, fail) => {
    const listener = createServer();
    listener.once("error", fail);
    listener.listen(0, "127.0.0.1", () => {
      const port = listener.address().port;
      listener.close(() => done(port));
    });
  });
}

async function awaitServer(base) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) throw new Error("isolated Next server exited before becoming ready");
    try {
      const response = await fetch(`${base}/api/auth/get-session`, { signal: AbortSignal.timeout(2_000) });
      if (response.status < 500 && response.status !== 404) return;
    } catch {}
    await new Promise((done) => setTimeout(done, 1_000));
  }
  throw new Error("isolated Next server did not become ready within 80 seconds");
}

async function chat(base, cookie, question) {
  const start = performance.now();
  const response = await fetch(`${base}/api/chat`, {
    method: "POST", headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ messages: [{ sender: "user", text: question }], contextProfile: "quick" }),
    signal: AbortSignal.timeout(120_000),
  });
  const raw = await response.text();
  const events = raw.split("\n").filter(Boolean).map((line) => JSON.parse(line));
  return { status: response.status, events, answer: events.filter((event) => event.type === "delta").map((event) => event.text).join(""), latencyMs: Math.round(performance.now() - start) };
}

try {
  assert.equal(existsSync(join(workspace, ".env.local")), false);
  for (const name of ["app", "public", "package.json", "package-lock.json", "next.config.ts", "postcss.config.mjs", "tsconfig.json", "proxy.ts", "next-env.d.ts"]) {
    cpSync(resolve(root, name), join(workspace, name), { recursive: true });
  }
  symlinkSync(resolve(root, "node_modules"), join(workspace, "node_modules"), "junction");
  assert.equal(existsSync(join(workspace, ".env.local")), false);

  principalA = await directIdentity("A");
  principalB = await directIdentity("B");
  process.env.GEMINI_API_KEY = "";
  const { createEmbeddings } = await import("../app/lib/aiRetrieval.ts");
  const allFixtures = [
    ...fixtureDefinitions.map((fixture) => ({ owner: "A", ...fixture, title: `${runId} ${fixture.title}`, excerpt: `${runId} fictional journal: ${fixture.excerpt}` })),
    { owner: "B", id: "user-b-canary", title: `${runId} private note`, mood: "fictional", excerpt: `${runId} fictional journal: User B flew a red kite and drank mint tea; this is private to User B.` },
  ];
  const vectors = await createEmbeddings(allFixtures.map((fixture) => `${fixture.title}. ${fixture.mood}. ${fixture.excerpt}`));
  assert.ok(vectors.length === allFixtures.length && vectors.every((vector) => vector?.length === 4096), "Qwen did not return 4096-dimensional embeddings for every fictional journal");
  const fixtureByLabel = {};
  for (let index = 0; index < allFixtures.length; index += 1) {
    const fixture = allFixtures[index];
    const owner = fixture.owner === "A" ? principalA : principalB;
    const inserted = await journalRequest(owner, "POST", "select=id", { user_id: owner.id, title: fixture.title, mood: fixture.mood, excerpt: fixture.excerpt, tags: [runId, fixture.id], embedding: vectors[index] });
    const id = inserted[0].id;
    (fixture.owner === "A" ? fixtureA : fixtureB).push(id);
    fixtureByLabel[fixture.id] = id;
  }
  evidence.fixtureLabels = fixtureByLabel;

  const port = await freePort();
  const base = `http://localhost:${port}`;
  const traceHook = resolve(root, "scripts/isolated-provider-trace-hook.mjs");
  const providerTraceFile = join(workspace, "provider-trace.jsonl");
  const copiedTraceHook = join(workspace, "provider-trace-hook.mjs");
  cpSync(traceHook, copiedTraceHook);
  const runtimeEnv = {
    PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, TEMP: process.env.TEMP, TMP: process.env.TMP,
    NEXT_TELEMETRY_DISABLED: "1", NODE_ENV: "development",
    NEON_AUTH_BASE_URL: config.authUrl,
    NEON_AUTH_JWKS_URL: `${config.authUrl}/.well-known/jwks.json`,
    NEON_AUTH_COOKIE_SECRET: randomBytes(32).toString("hex"),
    NEON_DATA_API_URL: config.dataUrl,
    EMBEDDING_API_URL: provider.EMBEDDING_API_URL,
    EMBEDDING_API_KEY: provider.EMBEDDING_API_KEY,
    EMBEDDING_MODEL: provider.EMBEDDING_MODEL,
    DEEPSEEK_API_KEY: provider.DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL: provider.DEEPSEEK_BASE_URL,
    DEEPSEEK_MODEL: provider.DEEPSEEK_GENERAL_MODEL,
    RECALL_AGENT_ENABLED: "true",
    JOMLUAH_TEST_TRACE_AGENT: "true",
    JOMLUAH_TEST_TRACE_FILE: providerTraceFile,
    NODE_OPTIONS: `--import=${pathToFileURL(copiedTraceHook).href}`,
  };
  assert.equal(runtimeEnv.NEON_AUTH_BASE_URL, config.authUrl);
  assert.equal(runtimeEnv.NEON_DATA_API_URL, config.dataUrl);
  server = spawn(process.execPath, [join(workspace, "node_modules/next/dist/bin/next"), "dev", "--webpack", "--port", String(port), "--hostname", "localhost"], {
    cwd: workspace, env: runtimeEnv, stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
  });
  for (const output of [server.stdout, server.stderr]) output.on("data", (chunk) => { serverLog = `${serverLog}${chunk}`.slice(-4000); });
  await awaitServer(base);
  const appSignin = await fetch(`${base}/api/auth/sign-in/email`, {
    method: "POST", headers: { "content-type": "application/json", origin: base },
    body: JSON.stringify({ email: principalA.email, password: principalA.password }),
    signal: AbortSignal.timeout(30_000),
  });
  const appCookie = cookieHeader(appSignin);
  assert.ok(appSignin.ok && appCookie, `isolated app sign-in failed (${appSignin.status}): ${(await appSignin.text()).slice(0, 180)}`);

  const labelById = Object.fromEntries(Object.entries(fixtureByLabel).map(([label, id]) => [id, label]));
  for (const scenario of conversations) {
    const result = await chat(base, appCookie, scenario.question);
    const meta = result.events.find((event) => event.type === "meta");
    const done = result.events.some((event) => event.type === "done");
    const trace = meta?.evaluationTrace || [];
    const retrievals = trace.filter((item) => item.type === "retrieval");
    const ranked = retrievals.flatMap((item) => item.ranked || []);
    const retrievedIds = [...new Set(ranked.map((item) => item.id))];
    const retrievedLabels = retrievedIds.map((id) => labelById[id] || "unknown");
    const selectedTools = trace.filter((item) => item.type === "tool_selection").map((item) => ({ tool: item.tool, arguments: item.arguments }));
    const expectedIds = scenario.expected.map((label) => fixtureByLabel[label]);
    const expectedFound = expectedIds.every((id) => retrievedIds.includes(id));
    const noCrossUserIds = fixtureB.every((id) => !retrievedIds.includes(id));
    const unsupported = scenario.category === "no_answer";
    const uncertainty = /don't know|do not know|don't have (?:any )?(?:entry|record|mention)|can't find|cannot find|couldn't find|could not find|no (?:journal )?(?:entry|record|evidence)|not (?:mentioned|recorded)|tak (?:tahu|jumpa|pasti)|tiada|tak ada|tak pasti/i.test(result.answer);
    const forbiddenClaim = scenario.forbidden ? scenario.forbidden.test(result.answer) : false;
    const unsupportedAbsenceClaim = /don't have any journal entries saved for you|no journal entries saved|tak ada rekod tersimpan pasal ni/i.test(result.answer);
    const answerGrounded = unsupported ? uncertainty && !forbiddenClaim : scenario.cues.test(result.answer);
    const toolCallsValid = Boolean(meta?.recallAgent?.used && meta.recallAgent.searches > 0 && selectedTools.length > 0 && selectedTools.every((item) => item.tool === "search_journal" && typeof item.arguments?.query === "string"));
    const checks = { httpOk: result.status === 200, completed: done, correctRetrieval: expectedFound, groundedAnswer: answerGrounded, noCrossUserIds, noForbiddenClaim: !forbiddenClaim, noUnsupportedAbsenceClaim: !unsupportedAbsenceClaim, realToolSelection: toolCallsValid };
    const finalUsage = result.events.find((event) => event.type === "done")?.usage || null;
    evidence.conversations.push({ id: scenario.id, category: scenario.category, question: scenario.question, status: result.status, latencyMs: result.latencyMs,
      expected: scenario.expected, expectedIds, retrieved: retrievedLabels, retrievedIds,
      retrievedScores: ranked.map(({ id, score, semantic, lexical }) => ({ label: labelById[id] || "unknown", score, semantic, lexical })),
      toolCalls: selectedTools, recallAgent: meta?.recallAgent || null, answer: result.answer, finalUsage,
      checks, result: Object.values(checks).every(Boolean) ? "PASS" : "FAIL" });
    console.log(`${scenario.id} ${Object.values(checks).every(Boolean) ? "PASS" : "FAIL"} (${result.latencyMs} ms)`);
  }
  await new Promise((done) => setTimeout(done, 300));
  if (existsSync(providerTraceFile)) evidence.providerTrace = readFileSync(providerTraceFile, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  assert.equal(evidence.conversations.length, 12, "exactly 12 conversation cases must execute");
  const passed = evidence.conversations.filter((item) => item.result === "PASS").length;
  const positiveCases = evidence.conversations.filter((item) => item.category !== "no_answer");
  const categoryMetrics = Object.fromEntries([...new Set(evidence.conversations.map((item) => item.category))].map((category) => {
    const cases = evidence.conversations.filter((item) => item.category === category);
    return [category, { total: cases.length, retrievalCorrect: cases.filter((item) => item.checks.correctRetrieval).length,
      grounded: cases.filter((item) => item.checks.groundedAnswer && item.checks.noForbiddenClaim).length }];
  }));
  const toolCalls = evidence.providerTrace.filter((item) => item.provider === "deepseek" && item.operation === "tool_planning");
  const qwenCalls = evidence.providerTrace.filter((item) => item.provider === "qwen");
  const answerCalls = evidence.providerTrace.filter((item) => item.provider === "deepseek" && item.operation === "answer_stream");
  evidence.summary = { completedConversations: evidence.conversations.length, passed, failed: evidence.conversations.length - passed,
    positiveRecall: { correct: positiveCases.filter((item) => item.checks.correctRetrieval).length, total: positiveCases.length,
      rate: positiveCases.filter((item) => item.checks.correctRetrieval).length / positiveCases.length },
    noAnswerRejection: { correct: evidence.conversations.filter((item) => item.category === "no_answer" && item.checks.correctRetrieval && item.checks.groundedAnswer).length,
      total: evidence.conversations.filter((item) => item.category === "no_answer").length },
    categoryMetrics,
    groundedAnswerRate: evidence.conversations.filter((item) => item.checks.groundedAnswer && item.checks.noForbiddenClaim).length / evidence.conversations.length,
    unsupportedPersonalMemoryClaims: evidence.conversations.filter((item) => !item.checks.noUnsupportedAbsenceClaim).length,
    noAnswer: evidence.conversations.filter((item) => item.category === "no_answer").map((item) => ({ id: item.id, uncertaintyAcknowledged: item.checks.groundedAnswer, retrievedCount: item.retrievedIds.length })),
    providerCalls: { qwenEmbeddingRequests: qwenCalls.length, deepseekToolPlanningRequests: toolCalls.length, deepseekAnswerRequests: answerCalls.length,
      toolPlanningUsage: toolCalls.map((item) => item.usage), finalAnswerUsage: evidence.conversations.map((item) => item.finalUsage) },
    latencyMs: { p50: percentile(evidence.conversations.map((item) => item.latencyMs), 0.5), p95: percentile(evidence.conversations.map((item) => item.latencyMs), 0.95), max: Math.max(...evidence.conversations.map((item) => item.latencyMs)) } };
  if (passed !== conversations.length) process.exitCode = 1;
} catch (error) {
  evidence.failure = error instanceof Error ? error.message : "unknown failure";
  console.error("Isolated route test failed:", evidence.failure);
  if (serverLog) {
    const sanitized = serverLog.replaceAll(provider.EMBEDDING_API_KEY || "[absent]", "[redacted]")
      .replaceAll(provider.DEEPSEEK_API_KEY || "[absent]", "[redacted]");
    console.error("Isolated server diagnostic:", sanitized.slice(0, 1200), sanitized.slice(-1200));
  }
  process.exitCode = 1;
} finally {
  const cleanup = { userADeleted: false, userBDeleted: false, verified: false };
  if (fixtureA.length && principalA) {
    const ids = fixtureA.join(",");
    await journalRequest(principalA, "DELETE", `id=in.(${ids})`).catch(() => {});
    cleanup.userADeleted = true;
  }
  if (fixtureB.length && principalB) {
    const ids = fixtureB.join(",");
    await journalRequest(principalB, "DELETE", `id=in.(${ids})`).catch(() => {});
    cleanup.userBDeleted = true;
  }
  if (fixtureA.length && fixtureB.length && principalA && principalB) {
    const remainingA = await journalRequest(principalA, "GET", `select=id&id=in.(${fixtureA.join(",")})`).catch(() => [{ id: "cleanup-check-failed" }]);
    const remainingB = await journalRequest(principalB, "GET", `select=id&id=in.(${fixtureB.join(",")})`).catch(() => [{ id: "cleanup-check-failed" }]);
    cleanup.verified = remainingA.length === 0 && remainingB.length === 0;
    if (!cleanup.verified) process.exitCode = 1;
  }
  evidence.cleanup = cleanup;
  if (server) {
    server.kill();
    await new Promise((done) => setTimeout(done, 1_000));
  }
  const dependencyLink = join(workspace, "node_modules");
  if (existsSync(dependencyLink) && lstatSync(dependencyLink).isSymbolicLink()) unlinkSync(dependencyLink);
  if (!workspace.startsWith(join(tmpdir(), "jomluah-isolated-chat-"))) throw new Error("Refusing to remove a workspace outside the isolated temporary directory");
  rmSync(workspace, { recursive: true, force: true, maxRetries: 3 });
  const evidenceDir = join(root, "test-results/jomluah-hardening");
  mkdirSync(evidenceDir, { recursive: true });
  const evidencePath = join(evidenceDir, "DEEPSEEK-RAG-12-RESULTS.json");
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  const markdown = `# DeepSeek RAG 12-Conversation Evaluation\n\n- Isolated project: \`${evidence.isolatedProject}\`\n- Completed conversations: ${evidence.conversations.length}\n- Harness result: ${evidence.summary?.passed ?? 0} PASS, ${evidence.summary?.failed ?? 0} FAIL\n- Positive retrieval: ${evidence.summary?.positiveRecall?.correct ?? 0}/${evidence.summary?.positiveRecall?.total ?? 0} (${evidence.summary ? `${(evidence.summary.positiveRecall.rate * 100).toFixed(1)}%` : "not completed"})\n- No-answer rejection: ${evidence.summary?.noAnswerRejection?.correct ?? 0}/${evidence.summary?.noAnswerRejection?.total ?? 0}\n- Grounded answers: ${evidence.summary ? `${(evidence.summary.groundedAnswerRate * 100).toFixed(1)}%` : "not completed"}\n- Unsupported personal-memory claims: ${evidence.summary?.unsupportedPersonalMemoryClaims ?? "not measured"}\n- Per-category results: ${JSON.stringify(evidence.summary?.categoryMetrics || {})}\n- Provider requests: Qwen ${evidence.summary?.providerCalls.qwenEmbeddingRequests ?? 0}; DeepSeek planning ${evidence.summary?.providerCalls.deepseekToolPlanningRequests ?? 0}; DeepSeek answers ${evidence.summary?.providerCalls.deepseekAnswerRequests ?? 0}\n- Conversation latency (ms): p50 ${evidence.summary?.latencyMs.p50 ?? "n/a"}, p95 ${evidence.summary?.latencyMs.p95 ?? "n/a"}, max ${evidence.summary?.latencyMs.max ?? "n/a"}\n- Fixture cleanup verified: ${cleanup.verified ? "yes" : "no / incomplete"}\n- Per-case evidence and sanitized provider traces: [DEEPSEEK-RAG-12-RESULTS.json](./DEEPSEEK-RAG-12-RESULTS.json)\n`;
  writeFileSync(join(evidenceDir, "DEEPSEEK-RAG-12-RESULTS.md"), markdown);
  console.log("Sanitized 12-conversation evidence saved.");
}

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)] ?? null;
}
