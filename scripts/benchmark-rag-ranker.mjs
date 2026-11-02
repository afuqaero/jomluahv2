import { performance } from "node:perf_hooks";
import { rankRecords } from "../app/lib/aiRetrieval.ts";

const dimensions = 4096;
const corpusSizes = [100, 500, 1000];
const queryCount = 40;
const concurrencyLevels = [1, 4, 8];

function vector(seed) {
  let value = seed >>> 0;
  const result = new Array(dimensions);
  for (let index = 0; index < dimensions; index += 1) {
    value = (value * 1664525 + 1013904223) >>> 0;
    result[index] = (value / 0xffffffff) * 2 - 1;
  }
  return result;
}

function percentile(values, fraction) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}

async function measure(records, queryVectors, concurrency) {
  const samples = [];
  const batchAverages = [];
  for (let offset = 0; offset < queryVectors.length; offset += concurrency) {
    const batch = queryVectors.slice(offset, offset + concurrency);
    const started = performance.now();
    const latencies = await Promise.all(batch.map(async (queryEmbedding) => {
      const queryStarted = performance.now();
      await Promise.resolve();
      rankRecords("synthetic wellbeing support query", records, queryEmbedding, 5);
      return performance.now() - queryStarted;
    }));
    samples.push(...latencies);
    batchAverages.push((performance.now() - started) / batch.length);
  }
  return {
    n: samples.length,
    average_ms: Number((samples.reduce((sum, sample) => sum + sample, 0) / samples.length).toFixed(3)),
    p50_ms: Number(percentile(samples, 0.5).toFixed(3)),
    p95_ms: Number(percentile(samples, 0.95).toFixed(3)),
    batch_average_ms: Number((batchAverages.reduce((sum, sample) => sum + sample, 0) / batchAverages.length).toFixed(3)),
  };
}

  global.gc?.();
  const baseline = process.memoryUsage();
const output = {
  benchmark: "in-process ranker only; synthetic deterministic 4096D vectors; not DB or provider integration",
  dimensions,
  query_count: queryCount,
  memory_baseline_heap_mb: Number((baseline.heapUsed / 1024 / 1024).toFixed(2)),
  corpus_results: [],
};

for (const corpusSize of corpusSizes) {
  global.gc?.();
  const before = process.memoryUsage();
  const records = Array.from({ length: corpusSize }, (_, index) => ({
    id: `SYN-${index}`,
    content: `Fictional synthetic record ${index} about student wellbeing and coping support`,
    importance: 3,
    embedding: vector(index + 1),
  }));
  const after = process.memoryUsage();
  const queryVectors = Array.from({ length: queryCount }, (_, index) => vector(100_000 + index));
  for (let index = 0; index < 4; index += 1) rankRecords("warmup synthetic query", records, queryVectors[index], 5);
  const requests = {};
  for (const concurrency of concurrencyLevels) {
    requests[`burst_${concurrency}`] = await measure(records, queryVectors, concurrency);
  }
  output.corpus_results.push({
    corpus_size: corpusSize,
    heap_delta_mb: Number(((after.heapUsed - before.heapUsed) / 1024 / 1024).toFixed(2)),
    rss_delta_mb: Number(((after.rss - before.rss) / 1024 / 1024).toFixed(2)),
    requests,
  });
}

console.log(JSON.stringify(output, null, 2));
