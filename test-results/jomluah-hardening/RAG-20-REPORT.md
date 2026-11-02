# JomLuah 20-Query Multilingual RAG Evaluation

- Run ID: `jl-rag20-a2eb7995-1a59-4e4f-8e83-2a2a15b803bc`
- Mode: real Qwen provider + isolated Neon Data API; synthetic journals only
- Real queries executed: 20/20
- Qwen provider calls: 21 (fixture batch + per-question embeddings; sanitized trace in JSON)
- Recall@1 / @3 / @5: 0.9736842105263158 / 1 / 1
- MRR@5: 1
- Retrieval latency p50 / p95 / mean: 2238 / 21924 / 6586 ms (embedding + Neon retrieval)
- No-answer false positives: 1/1
- Fixture cleanup: PASS (8 deleted; follow-up isolated User A query confirmed 0 remaining)

## Category Metrics

| Category | Queries | Recall@1 | Recall@3 | Recall@5 | MRR@5 |
| --- | ---: | ---: | ---: | ---: | ---: |
| English | 5 | 1 | 1 | 1 | 1 |
| Bahasa Melayu | 5 | 1 | 1 | 1 | 1 |
| Manglish | 5 | 1 | 1 | 1 | 1 |
| Paraphrased/indirect | 3 | 1 | 1 | 1 | 1 |
| Challenging | 2 | 0.5 | 1 | 1 | 1 |

## Query Evidence

Detailed question text, expected/retrieved synthetic IDs, relevance ranks, latency, provider status/latency, and cleanup result are in `rag-20-results.json`.

No answer-generation calls were made; this is a retrieval-only evaluation. No ranking changes were made.
