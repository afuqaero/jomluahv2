# JomLuah RAG Precision and Latency Diagnostics

- Run ID: `jl-rag20-44cbb98e-f351-49d8-9174-68f1d62baaf4`
- Mode: real Qwen provider + isolated Neon Data API; synthetic journals only
- Real queries executed: 28 (original 20 plus 8 added diagnostics)
- Qwen provider calls: 29 (fixture batch + per-question embeddings; sanitized trace in JSON)
- Original-20 Recall@1 / @3 / @5: 0.9736842105263158 / 1 / 1
- Full-set Recall@1 / @3 / @5; MRR@5: 0.9782608695652174 / 1 / 1; 1
- Combined latency p50 / p95 / max / mean: 1465 / 2999 / 3061 / 1712 ms
- Qwen stage p50 / p95 / max: 1181 / 2649 / 2864 ms
- Neon stage p50 / p95 / max: 171 / 700 / 798 ms
- Ranking stage p50 / p95 / max: 1 / 3 / 3 ms
- No-answer false positives: 5/5
- Fixture cleanup: PASS (8 deleted; 0 remain)

## Category Metrics

| Category | Queries | Recall@1 | Recall@3 | Recall@5 | MRR@5 |
| --- | ---: | ---: | ---: | ---: | ---: |
| English | 5 | 1 | 1 | 1 | 1 |
| Bahasa Melayu | 5 | 1 | 1 | 1 | 1 |
| Manglish | 5 | 1 | 1 | 1 | 1 |
| Paraphrased/indirect | 3 | 1 | 1 | 1 | 1 |
| Challenging | 2 | 0.5 | 1 | 1 | 1 |
| No-answer diagnostic | 4 | n/a | n/a | n/a | n/a |
| Borderline relevance | 4 | 1 | 1 | 1 | 1 |

## Query Evidence

Detailed per-query scores, relevance ranks, embedding/Neon/ranking timings, provider trace, and cleanup result are in `rag-diagnostics-results.json`.

No answer-generation calls were made. Ranking weights and acceptance rules were not modified; the threshold sweep is diagnostic only.
