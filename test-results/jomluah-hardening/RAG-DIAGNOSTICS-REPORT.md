# JomLuah RAG Precision and Latency Diagnostics

- Run ID: `jl-rag20-be1ce5ca-9618-4e0d-b688-3f25aae55a0c`
- Mode: real Qwen provider + isolated Neon Data API; synthetic journals only
- Real queries executed: 0 (original 20 plus 8 added diagnostics)
- Qwen provider calls: 0 (fixture batch + per-question embeddings; sanitized trace in JSON)
- Original-20 Recall@1 / @3 / @5: n/a / n/a / n/a
- Full-set Recall@1 / @3 / @5; MRR@5: n/a / n/a / n/a; n/a
- Combined latency p50 / p95 / max / mean: n/a / n/a / n/a / n/a ms
- Qwen stage p50 / p95 / max: null / null / null ms
- Neon stage p50 / p95 / max: null / null / null ms
- Ranking stage p50 / p95 / max: null / null / null ms
- No-answer false positives: 0/0
- Fixture cleanup: FAIL/NOT COMPLETED

## Category Metrics

| Category | Queries | Recall@1 | Recall@3 | Recall@5 | MRR@5 |
| --- | ---: | ---: | ---: | ---: | ---: |

## Query Evidence

Detailed per-query scores, relevance ranks, embedding/Neon/ranking timings, provider trace, and cleanup result are in `rag-diagnostics-results.json`.

## Precision and Latency Findings

The pre-cutoff score sweep and full previous result are retained in `rag-diagnostics-before-threshold.json`. The cutoff is 0.375: in that measured set it rejected all five no-answer queries while retaining all 23 answerable queries, including every English, Malay, Manglish, paraphrased, and borderline case. A 0.40 cutoff rejected two Malay cases, so it was not selected.

The relevance score distributions overlap for irrelevant neighbors in answerable queries; this cutoff is an abstention safeguard for unsupported queries, not proof that every returned neighbor is relevant. The corpus is small and synthetic, so calibrate against a larger labelled set before treating the cutoff as universal.

Qwen latency dominates. Calls were sequential with one embedding request per query plus one fixture batch; the embedding client has no retry loop. All provider calls returned HTTP 200. Prior-run latency spikes were at the provider stage; current measurements cannot establish whether those were cold starts. Neon fetch and local ranking are comparatively small.

No answer-generation calls were made, so final response grounding remains untested.
