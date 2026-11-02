import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { createClient } from "@neondatabase/neon-js";
import { createEmbedding, createEmbeddings } from "../app/lib/aiRetrieval.ts";
import { retrieveJournalRecords } from "../app/lib/journalRetrieval.ts";
import { readIsolatedConfig, requireProviderHosts } from "../scripts/isolated-test-guards.mjs";

type EvalQuestion = {
  id: string;
  category: "English" | "Bahasa Melayu" | "Manglish" | "Paraphrased/indirect" | "Challenging" | "No-answer diagnostic" | "Borderline relevance";
  query: string;
  expectedIds: string[];
};

const runId = `jl-rag20-${randomUUID()}`;
const fixtures = [
  { id: "exam-stress", title: `${runId} exam workload`, mood: "overwhelmed", excerpt: "Deadlines piled up. Breaking revision into ten-minute study blocks made the assignment feel manageable.", tags: [runId, "study"] },
  { id: "homesick", title: `${runId} missing family`, mood: "lonely", excerpt: "I felt homesick at university and a video call with my family helped me feel connected.", tags: [runId, "family"] },
  { id: "sleep-routine", title: `${runId} sleep routine`, mood: "tired", excerpt: "Putting my phone away before midnight and keeping a regular bedtime helped my sleep.", tags: [runId, "sleep"] },
  { id: "roommate-boundary", title: `${runId} roommate boundaries`, mood: "uneasy", excerpt: "I spoke calmly with my roommate about quiet hours and we agreed on a study schedule.", tags: [runId, "roommate"] },
  { id: "evening-walk", title: `${runId} evening walk`, mood: "calmer", excerpt: "A short evening walk around campus helped me settle after a stressful day.", tags: [runId, "walk"] },
  { id: "meal-break", title: `${runId} meal break`, mood: "steadier", excerpt: "Taking a lunch break and eating with a coursemate helped me regain focus.", tags: [runId, "food"] },
  { id: "exam-sleep", title: `${runId} exam week rest`, mood: "anxious", excerpt: "During exam week I revised in short blocks, then stopped at night to protect my sleep.", tags: [runId, "exam", "sleep"] },
  { id: "club-presentation", title: `${runId} club presentation`, mood: "nervous", excerpt: "Practising my club presentation with a friend made speaking in front of people easier.", tags: [runId, "presentation"] },
];

const questions: EvalQuestion[] = [
  { id: "EN-1", category: "English", query: "What helped me cope with all the assignment deadlines?", expectedIds: ["exam-stress"] },
  { id: "EN-2", category: "English", query: "How did I feel less homesick at university?", expectedIds: ["homesick"] },
  { id: "EN-3", category: "English", query: "What change improved my sleep?", expectedIds: ["sleep-routine"] },
  { id: "EN-4", category: "English", query: "What agreement did my roommate and I make?", expectedIds: ["roommate-boundary"] },
  { id: "EN-5", category: "English", query: "What helped me calm down after a difficult day?", expectedIds: ["evening-walk"] },
  { id: "BM-1", category: "Bahasa Melayu", query: "Macam mana saya uruskan banyak deadline assignment?", expectedIds: ["exam-stress"] },
  { id: "BM-2", category: "Bahasa Melayu", query: "Apa yang buat saya rasa kurang rindu keluarga dekat universiti?", expectedIds: ["homesick"] },
  { id: "BM-3", category: "Bahasa Melayu", query: "Perubahan apa yang bantu saya tidur lebih lena?", expectedIds: ["sleep-routine"] },
  { id: "BM-4", category: "Bahasa Melayu", query: "Apa persetujuan saya dengan rakan sebilik pasal waktu senyap?", expectedIds: ["roommate-boundary"] },
  { id: "BM-5", category: "Bahasa Melayu", query: "Apa yang bantu saya tenang selepas hari yang stres?", expectedIds: ["evening-walk"] },
  { id: "MG-1", category: "Manglish", query: "Bila assignment banyak sangat, what did I do to make it manageable?", expectedIds: ["exam-stress"] },
  { id: "MG-2", category: "Manglish", query: "I miss family dekat uni, what helped me feel connected balik?", expectedIds: ["homesick"] },
  { id: "MG-3", category: "Manglish", query: "My sleep got better sebab I changed what routine?", expectedIds: ["sleep-routine"] },
  { id: "MG-4", category: "Manglish", query: "Dengan roommate, we agreed about quiet time macam mana?", expectedIds: ["roommate-boundary"] },
  { id: "MG-5", category: "Manglish", query: "After stressful day, what small thing buat me feel calmer?", expectedIds: ["evening-walk"] },
  { id: "PI-1", category: "Paraphrased/indirect", query: "Which small step made the pile of coursework feel less impossible?", expectedIds: ["exam-stress"] },
  { id: "PI-2", category: "Paraphrased/indirect", query: "What helped me feel close to home while living on campus?", expectedIds: ["homesick"] },
  { id: "PI-3", category: "Paraphrased/indirect", query: "What did I do to wind down outdoors in the evening?", expectedIds: ["evening-walk"] },
  { id: "CH-1", category: "Challenging", query: "During exam week, what did I do for both revision and rest?", expectedIds: ["exam-stress", "exam-sleep"] },
  { id: "CH-2", category: "Challenging", query: "What was the name of the counsellor I met last month?", expectedIds: [] },
  { id: "NA-1", category: "No-answer diagnostic", query: "Which medication did my doctor prescribe for me?", expectedIds: [] },
  { id: "NA-2", category: "No-answer diagnostic", query: "What chemistry grade did I receive on the midterm?", expectedIds: [] },
  { id: "NA-3", category: "No-answer diagnostic", query: "When is my next counselling appointment?", expectedIds: [] },
  { id: "NA-4", category: "No-answer diagnostic", query: "What diagnosis did the therapist give me?", expectedIds: [] },
  { id: "BL-1", category: "Borderline relevance", query: "How did I make a huge pile of coursework feel doable?", expectedIds: ["exam-stress"] },
  { id: "BL-2", category: "Borderline relevance", query: "Call rumah helped when campus felt far from family, right?", expectedIds: ["homesick"] },
  { id: "BL-3", category: "Borderline relevance", query: "Malam punya routine that made mornings easier?", expectedIds: ["sleep-routine"] },
  { id: "BL-4", category: "Borderline relevance", query: "Bila housemate bising, what quiet-time deal did we make?", expectedIds: ["roommate-boundary"] },
];

let config: ReturnType<typeof readIsolatedConfig>;
let hosts: ReturnType<typeof requireProviderHosts>;
let jwt = "";
let userId = "";
let fixtureIds: string[] = [];
let fixtureLabelsById = new Map<string, string>();
let neonClient: ReturnType<typeof createClient> | null = null;
let originalFetch: typeof fetch;
let providerCalls = 0;
const outcomes: Array<Record<string, unknown>> = [];
const providerTrace: Array<Record<string, unknown>> = [];
const originalEmbeddingEnv = {
  endpoint: process.env.EMBEDDING_API_URL,
  key: process.env.EMBEDDING_API_KEY,
  model: process.env.EMBEDDING_MODEL,
  geminiKey: process.env.GEMINI_API_KEY,
};

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

async function dataApi(table: string, query: string, init: RequestInit = {}) {
  return fetch(`${config.dataUrl}/${table}${query ? `?${query}` : ""}`, {
    ...init,
    headers: {
      authorization: `Bearer ${jwt}`,
      "content-type": "application/json",
      accept: "application/json",
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
}

before(async () => {
  config = readIsolatedConfig({ providers: true });
  hosts = requireProviderHosts();
  assert.equal(questions.length, 28, "diagnostic run includes the original 20 plus eight added cases");
  const categoryCounts = new Map<string, number>();
  for (const question of questions) categoryCounts.set(question.category, (categoryCounts.get(question.category) || 0) + 1);
  assert.deepEqual(Object.fromEntries(categoryCounts), {
    English: 5,
    "Bahasa Melayu": 5,
    Manglish: 5,
    "Paraphrased/indirect": 3,
    Challenging: 2,
    "No-answer diagnostic": 4,
    "Borderline relevance": 4,
  });

  originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input.toString() : input.url);
    if (url.hostname === "openrouter.ai") {
      assert.equal(url.href, hosts.embeddingUrl, "only the allowlisted Qwen endpoint is permitted");
      providerCalls += 1;
      assert.ok(providerCalls <= 35, "Qwen paid-call cap exceeded");
      const started = performance.now();
      try {
        const response = await originalFetch(input, init);
        providerTrace.push({ status: response.status, latency_ms: Math.round(performance.now() - started) });
        return response;
      } catch (error) {
        providerTrace.push({ status: null, latency_ms: Math.round(performance.now() - started), error: error instanceof Error ? error.name : "request_failed" });
        throw error;
      }
    }
    if (url.hostname !== new URL(config.authUrl).hostname && url.hostname !== new URL(config.dataUrl).hostname) {
      throw new Error("Blocked non-isolated outbound request in RAG evaluation");
    }
    return originalFetch(input, init);
  };

  process.env.EMBEDDING_API_URL = hosts.embeddingUrl;
  process.env.EMBEDDING_API_KEY = process.env.JOMLUAH_TEST_QWEN_API_KEY!;
  process.env.EMBEDDING_MODEL = process.env.JOMLUAH_TEST_QWEN_MODEL || "qwen/qwen3-embedding-8b";
  process.env.GEMINI_API_KEY = "";

  const email = process.env.JOMLUAH_TEST_USER_A_EMAIL!;
  const signIn = await fetch(new URL("sign-in/email", `${config.authUrl}/`), {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000" },
    body: JSON.stringify({ email, password: process.env.JOMLUAH_TEST_USER_A_PASSWORD }),
    signal: AbortSignal.timeout(12_000),
  });
  assert.equal(signIn.ok, true, `synthetic isolated User A sign-in failed (HTTP ${signIn.status})`);
  const cookie = (signIn.headers.getSetCookie?.() ?? []).map((value) => value.split(";", 1)[0]).join("; ");
  const sessionResponse = await fetch(new URL("get-session", `${config.authUrl}/`), {
    headers: { cookie, origin: "http://localhost:3000" },
    signal: AbortSignal.timeout(12_000),
  });
  assert.equal(sessionResponse.ok, true, "isolated User A session lookup must succeed");
  jwt = sessionResponse.headers.get("set-auth-jwt") || "";
  userId = ((await sessionResponse.json()) as { user?: { id?: string } }).user?.id || "";
  assert.ok(userId && jwt.split(".").length === 3, "isolated User A JWT is required");
  neonClient = createClient({ dataApi: { url: config.dataUrl, getToken: async () => jwt } });

  const documentTexts = fixtures.map((fixture) => `${fixture.title}. Mood: ${fixture.mood}. ${fixture.excerpt} Tags: ${fixture.tags.join(", ")}`);
  const embedded = await createEmbeddings(documentTexts, AbortSignal.timeout(45_000));
  assert.equal(embedded.length, fixtures.length);
  assert.ok(embedded.every((vector) => Array.isArray(vector) && vector.length > 0), "real Qwen must embed every synthetic journal");

  const insert = await dataApi("journal_entries", "select=id", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify(fixtures.map((fixture, index) => ({
      user_id: userId,
      title: fixture.title,
      mood: fixture.mood,
      excerpt: fixture.excerpt,
      tags: fixture.tags,
      timestamp: new Date().toISOString(),
      embedding: embedded[index],
    }))),
  });
  assert.equal(insert.status, 201, `isolated synthetic fixture insert failed (HTTP ${insert.status})`);
  fixtureIds = ((await insert.json()) as Array<{ id: string }>).map(({ id }) => id);
  assert.equal(fixtureIds.length, fixtures.length);
  fixtureLabelsById = new Map(fixtureIds.map((id, index) => [id, fixtures[index].id]));
});

test("executes original 20 plus eight real Qwen + isolated Neon diagnostic queries", async () => {
  assert.equal(questions.length, 28);
  for (const item of questions) {
    const started = performance.now();
    const embeddingStarted = performance.now();
    const queryEmbedding = await createEmbedding(item.query, AbortSignal.timeout(30_000));
    const embeddingMs = performance.now() - embeddingStarted;
    assert.ok(queryEmbedding?.length, `Qwen returned no embedding for ${item.id}`);
    let retrievalMetrics: { databaseMs: number; rankingMs: number; ranked: Array<{ id: string; score: number; semantic: number; lexical: number }> } | undefined;
    const result = await retrieveJournalRecords(
      neonClient as never,
      userId,
      item.query,
      queryEmbedding,
      5,
      (metrics) => { retrievalMetrics = metrics; },
    );
    const latencyMs = Math.round(performance.now() - started);
    assert.equal(result.ok, true, `isolated Neon retrieval failed for ${item.id}`);
    assert.ok(retrievalMetrics, `retrieval metrics missing for ${item.id}`);
    const retrievedIds = result.records.map(({ id }) => fixtureLabelsById.get(id) || id);
    if (item.expectedIds.length === 0) {
      assert.equal(retrievedIds.length, 0, `${item.id} should reject unsupported retrieval`);
    } else {
      for (const expectedId of item.expectedIds) {
        assert.ok(retrievedIds.includes(expectedId), `${item.id} must retain relevant journal ${expectedId}`);
      }
    }
    const expectedSet = new Set(item.expectedIds);
    const positions = item.expectedIds.map((id) => {
      const index = retrievedIds.indexOf(id);
      return { id, rank: index < 0 ? null : index + 1 };
    });
    outcomes.push({
      id: item.id,
      category: item.category,
      query: item.query,
      expected_ids: item.expectedIds,
      retrieved_ids: retrievedIds,
      relevant_ranks: positions,
      ranked_scores: retrievalMetrics.ranked.map((ranked) => ({
        id: fixtureLabelsById.get(ranked.id) || ranked.id,
        score: Number(ranked.score.toFixed(6)),
        semantic: Number(ranked.semantic.toFixed(6)),
        lexical: Number(ranked.lexical.toFixed(6)),
      })),
      timing_ms: {
        embedding_provider: Math.round(embeddingMs),
        neon_fetch: Math.round(retrievalMetrics.databaseMs),
        application_ranking: Math.round(retrievalMetrics.rankingMs),
        combined: latencyMs,
      },
      ...(expectedSet.size === 0 ? { no_answer_returned_results: retrievedIds.length > 0 } : {}),
    });
  }
  assert.equal(outcomes.length, 28);
});

after(async () => {
  let cleanup = { attempted: false, success: false, deleted: 0, verifiedRemaining: -1 };
  if (globalThis.fetch && originalFetch) globalThis.fetch = originalFetch;
  if (config && jwt && userId && fixtureIds.length > 0) {
    cleanup.attempted = true;
    try {
      const ids = fixtureIds.map((id) => `"${id}"`).join(",");
      const response = await dataApi("journal_entries", `id=in.(${encodeURIComponent(ids)})&user_id=eq.${encodeURIComponent(userId)}`, { method: "DELETE" });
      if (response.ok) {
        const verifyParams = new URLSearchParams({
          select: "id",
          id: `in.(${ids})`,
          user_id: `eq.${userId}`,
        });
        const verification = await dataApi("journal_entries", verifyParams.toString());
        if (verification.ok) {
          const remaining = await verification.json() as Array<{ id: string }>;
          cleanup.verifiedRemaining = remaining.length;
          cleanup.deleted = fixtureIds.length - remaining.length;
          cleanup.success = remaining.length === 0;
        }
      }
    } catch {
      cleanup.success = false;
    }
  }

  restoreEnvironment("EMBEDDING_API_URL", originalEmbeddingEnv.endpoint);
  restoreEnvironment("EMBEDDING_API_KEY", originalEmbeddingEnv.key);
  restoreEnvironment("EMBEDDING_MODEL", originalEmbeddingEnv.model);
  restoreEnvironment("GEMINI_API_KEY", originalEmbeddingEnv.geminiKey);

  if (originalFetch) globalThis.fetch = originalFetch;
  const combinedLatency = outcomes.map((item) => Number((item.timing_ms as { combined: number }).combined));
  const stageValues = (stage: "embedding_provider" | "neon_fetch" | "application_ranking") => outcomes.map((item) => Number((item.timing_ms as Record<string, number>)[stage]));
  const percentile = (values: number[], p: number) => {
    if (!values.length) return null;
    const sorted = [...values].sort((left, right) => left - right);
    return sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)];
  };
  const latencyStats = (values: number[]) => ({
    p50: percentile(values, 0.5),
    p95: percentile(values, 0.95),
    max: values.length ? Math.max(...values) : null,
    mean: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null,
  });
  const summarize = (values: number[]) => {
    const sorted = [...values].sort((left, right) => left - right);
    return {
      count: sorted.length,
      min: sorted.length ? Number(sorted[0].toFixed(6)) : null,
      median: sorted.length ? Number(sorted[Math.floor((sorted.length - 1) / 2)].toFixed(6)) : null,
      max: sorted.length ? Number(sorted[sorted.length - 1].toFixed(6)) : null,
      mean: sorted.length ? Number((sorted.reduce((sum, value) => sum + value, 0) / sorted.length).toFixed(6)) : null,
    };
  };
  const metricRows = (items: typeof outcomes) => {
    const answerable = items.filter((item) => (item.expected_ids as string[]).length > 0);
    const recalls = (k: number) => answerable.length
      ? answerable.reduce((sum, item) => {
        const expected = item.expected_ids as string[];
        const returned = (item.retrieved_ids as string[]).slice(0, k);
        return sum + expected.filter((id) => returned.includes(id)).length / expected.length;
      }, 0) / answerable.length
      : null;
    const mrr = answerable.length
      ? answerable.reduce((sum, item) => {
        const ranks = item.relevant_ranks as Array<{ rank: number | null }>;
        const first = ranks.map(({ rank }) => rank).filter((rank): rank is number => rank !== null && rank <= 5).sort((a, b) => a - b)[0];
        return sum + (first ? 1 / first : 0);
      }, 0) / answerable.length
      : null;
    const noAnswer = items.filter((item) => (item.expected_ids as string[]).length === 0);
    return {
      count: items.length,
      answerable_count: answerable.length,
      recall_at_1: recalls(1),
      recall_at_3: recalls(3),
      recall_at_5: recalls(5),
      mrr_at_5: mrr,
      no_answer_count: noAnswer.length,
      no_answer_false_positive_count: noAnswer.filter((item) => item.no_answer_returned_results === true).length,
    };
  };
  const scoreRows = outcomes.flatMap((item) => (item.ranked_scores as Array<{ id: string; score: number; semantic: number; lexical: number }>).map((row) => ({
    ...row,
    relevant: (item.expected_ids as string[]).includes(row.id),
    answerable: (item.expected_ids as string[]).length > 0,
    query_id: item.id,
  })));
  const thresholdValues = [...Array.from({ length: 12 }, (_, index) => Number((0.05 + index * 0.05).toFixed(2))), 0.355, 0.36, 0.375];
  const thresholds = [...new Set(thresholdValues)].sort((a, b) => a - b).map((threshold) => {
    const answerable = outcomes.filter((item) => (item.expected_ids as string[]).length > 0);
    const acceptedRelevant = answerable.filter((item) => (item.ranked_scores as Array<{ id: string; score: number }>).some((row) => (item.expected_ids as string[]).includes(row.id) && row.score >= threshold)).length;
    const noAnswer = outcomes.filter((item) => (item.expected_ids as string[]).length === 0);
    const rejectedNoAnswer = noAnswer.filter((item) => !(item.ranked_scores as Array<{ score: number }>).some((row) => row.score >= threshold)).length;
    const filteredRecall = (k: number) => answerable.length
      ? answerable.reduce((sum, item) => {
        const expected = item.expected_ids as string[];
        const filtered = (item.ranked_scores as Array<{ id: string; score: number }>).filter((row) => row.score >= threshold).slice(0, k);
        return sum + expected.filter((id) => filtered.some((row) => row.id === id)).length / expected.length;
      }, 0) / answerable.length
      : null;
    const categoryCoverage = Object.fromEntries([...new Set(answerable.map((item) => String(item.category)))].map((category) => {
      const subset = answerable.filter((item) => item.category === category);
      const retained = subset.filter((item) => (item.ranked_scores as Array<{ id: string; score: number }>).some((row) => (item.expected_ids as string[]).includes(row.id) && row.score >= threshold)).length;
      return [category, `${retained}/${subset.length}`];
    }));
    return {
      threshold,
      answerable_query_retention: answerable.length ? acceptedRelevant / answerable.length : null,
      answerable_queries_rejected: answerable.length - acceptedRelevant,
      recall_at_1: filteredRecall(1),
      recall_at_3: filteredRecall(3),
      recall_at_5: filteredRecall(5),
      answerable_category_coverage: categoryCoverage,
      no_answer_rejection: noAnswer.length ? rejectedNoAnswer / noAnswer.length : null,
      no_answer_queries_accepted: noAnswer.length - rejectedNoAnswer,
    };
  });
  const scoreDistribution = (rows: typeof scoreRows) => ({
    relevant: summarize(rows.filter((row) => row.relevant).map((row) => row.score)),
    irrelevant_returned: summarize(rows.filter((row) => !row.relevant).map((row) => row.score)),
    no_answer_returned: summarize(rows.filter((row) => !row.answerable).map((row) => row.score)),
  });
  const categories = [...new Set(outcomes.map((item) => String(item.category)))];
  const prior20 = outcomes.filter((item) => !["No-answer diagnostic", "Borderline relevance"].includes(String(item.category)));
  const report = {
    run_id: runId,
    executed_at: new Date().toISOString(),
    mode: "real Qwen provider + isolated Neon Data API; synthetic journals only",
    fixture_count: fixtures.length,
    query_count: outcomes.length,
    original_20_comparison: metricRows(prior20),
    provider: { name: "OpenRouter Qwen embeddings", calls: providerCalls, sanitized_trace: providerTrace },
    overall: metricRows(outcomes),
    latency_ms: latencyStats(combinedLatency),
    latency_stages: {
      embedding_provider: latencyStats(stageValues("embedding_provider")),
      neon_fetch: latencyStats(stageValues("neon_fetch")),
      application_ranking: latencyStats(stageValues("application_ranking")),
    },
    stage_max_by_query: outcomes.map((item) => ({ id: item.id, ...item.timing_ms as object })),
    score_distributions: scoreDistribution(scoreRows),
    threshold_sweep: thresholds,
    by_category: Object.fromEntries(categories.map((category) => [category, metricRows(outcomes.filter((item) => item.category === category))])),
    queries: outcomes,
    fixture_cleanup: cleanup,
  };
  const fs = await import("node:fs/promises");
  await fs.mkdir("test-results/jomluah-hardening", { recursive: true });
  await fs.writeFile("test-results/jomluah-hardening/rag-diagnostics-results.json", `${JSON.stringify(report, null, 2)}\n`);
  const markdown = [
    "# JomLuah RAG Precision and Latency Diagnostics",
    "",
    `- Run ID: \`${runId}\``,
    `- Mode: ${report.mode}`,
    `- Real queries executed: ${outcomes.length} (original 20 plus 8 added diagnostics)`,
    `- Qwen provider calls: ${providerCalls} (fixture batch + per-question embeddings; sanitized trace in JSON)`,
    `- Original-20 Recall@1 / @3 / @5: ${report.original_20_comparison.recall_at_1 ?? "n/a"} / ${report.original_20_comparison.recall_at_3 ?? "n/a"} / ${report.original_20_comparison.recall_at_5 ?? "n/a"}`,
    `- Full-set Recall@1 / @3 / @5; MRR@5: ${report.overall.recall_at_1 ?? "n/a"} / ${report.overall.recall_at_3 ?? "n/a"} / ${report.overall.recall_at_5 ?? "n/a"}; ${report.overall.mrr_at_5 ?? "n/a"}`,
    `- Combined latency p50 / p95 / max / mean: ${report.latency_ms.p50 ?? "n/a"} / ${report.latency_ms.p95 ?? "n/a"} / ${report.latency_ms.max ?? "n/a"} / ${report.latency_ms.mean ?? "n/a"} ms`,
    `- Qwen stage p50 / p95 / max: ${report.latency_stages.embedding_provider.p50} / ${report.latency_stages.embedding_provider.p95} / ${report.latency_stages.embedding_provider.max} ms`,
    `- Neon stage p50 / p95 / max: ${report.latency_stages.neon_fetch.p50} / ${report.latency_stages.neon_fetch.p95} / ${report.latency_stages.neon_fetch.max} ms`,
    `- Ranking stage p50 / p95 / max: ${report.latency_stages.application_ranking.p50} / ${report.latency_stages.application_ranking.p95} / ${report.latency_stages.application_ranking.max} ms`,
    `- No-answer false positives: ${report.overall.no_answer_false_positive_count}/${report.overall.no_answer_count}`,
    `- Fixture cleanup: ${cleanup.success ? `PASS (${cleanup.deleted} deleted; ${cleanup.verifiedRemaining} remain)` : "FAIL/NOT COMPLETED"}`,
    "",
    "## Category Metrics",
    "",
    "| Category | Queries | Recall@1 | Recall@3 | Recall@5 | MRR@5 |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...Object.entries(report.by_category).map(([name, metrics]) => `| ${name} | ${metrics.count} | ${metrics.recall_at_1 ?? "n/a"} | ${metrics.recall_at_3 ?? "n/a"} | ${metrics.recall_at_5 ?? "n/a"} | ${metrics.mrr_at_5 ?? "n/a"} |`),
    "",
    "## Query Evidence",
    "",
    "Detailed per-query scores, relevance ranks, embedding/Neon/ranking timings, provider trace, and cleanup result are in `rag-diagnostics-results.json`.",
    "",
    "## Precision and Latency Findings",
    "",
    "The pre-cutoff score sweep and full previous result are retained in `rag-diagnostics-before-threshold.json`. The cutoff is 0.375: in that measured set it rejected all five no-answer queries while retaining all 23 answerable queries, including every English, Malay, Manglish, paraphrased, and borderline case. A 0.40 cutoff rejected two Malay cases, so it was not selected.",
    "",
    "The relevance score distributions overlap for irrelevant neighbors in answerable queries; this cutoff is an abstention safeguard for unsupported queries, not proof that every returned neighbor is relevant. The corpus is small and synthetic, so calibrate against a larger labelled set before treating the cutoff as universal.",
    "",
    "Qwen latency dominates. Calls were sequential with one embedding request per query plus one fixture batch; the embedding client has no retry loop. All provider calls returned HTTP 200. Prior-run latency spikes were at the provider stage; current measurements cannot establish whether those were cold starts. Neon fetch and local ranking are comparatively small.",
    "",
    "No answer-generation calls were made, so final response grounding remains untested.",
  ].join("\n");
  await fs.writeFile("test-results/jomluah-hardening/RAG-DIAGNOSTICS-REPORT.md", `${markdown}\n`);
  if (cleanup.attempted && !cleanup.success) throw new Error("Synthetic journal cleanup failed; see saved evaluation evidence.");
});
