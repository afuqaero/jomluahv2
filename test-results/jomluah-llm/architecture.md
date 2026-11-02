# Verified RAG and Agent Architecture

## Data flow inspected

1. `app/lib/aiRetrieval.ts` sends text to Gemini when `GEMINI_API_KEY` exists; otherwise it uses the configured OpenAI-compatible embedding endpoint/model. Qwen3 Embedding 8B returned 4096-dimensional vectors in the earlier synthetic live-provider test.
2. `neon_migrations/001_initial_schema.sql` stores memory and journal embeddings in JSONB arrays. There is no pgvector type, vector operator, vector index, or PostgreSQL-side similarity query in the inspected retrieval path.
3. `app/api/chat/route.ts` scopes memory and journal reads to the authenticated `user.id`, orders newest-first, and caps each source at 100 records. Memory additionally filters `is_active`. Preference flags gate the sources.
4. `rankRecords` computes cosine similarity in the app plus token overlap and importance: `0.70*cosine + 0.25*lexical + 0.05*importance`. A result passes if cosine > 0.25 or lexical overlap > 0. There is no distinct reranker.
5. Normal chat retrieves at most 6 memories and 4 journal records. Journal retrieval first selects up to 12 using lexical-only ranking (`queryEmbedding=null`), then generates embeddings for missing vectors among those candidates, then re-ranks that reduced candidate set semantically. This preselection can omit semantically relevant journals with little exact token overlap.
6. `formatRetrievedContext` adds selected source text into a bounded context. Balanced profile allocates up to 2,500 estimated tokens to retrieved context; quick/deep allocate 1,800/5,000. Truncation uses a characters-per-token estimate. The prompt marks retrieved data untrusted and asks for exact journal citations.
7. The `JomLuah Recall Agent` is selected by `planRetrieval`/`shouldUseRecallAgent` and runtime flags. DeepSeek chooses from read-only memory/journal tools; preference/plan allowlists, owner filters, query length <=160 chars, two-search maximum, three results/search, deduplication, and 100-row search caps constrain it. Urgent safety classification skips retrieval/agent selection. DeepSeek also generates summaries and final answers.

## Correctness and privacy observations

- The design is user-history recall, not retrieval over a shared external knowledge base. Synthetic policy documents used in the earlier evaluation are not a production corpus.
- `rankRecords` silently yields semantic score zero for dimension mismatch; persisted rows do not record embedding model/version/dimension. A provider/model change can therefore mix incomparable vectors while lexical fallback hides the incompatibility.
- Journal first-pass candidate selection uses lexical score only; this is the clearest inspected recall-loss risk. The top-100 recency window is another intentional recall bound.
- No chunking exists for memory/journal records; excerpts are whole records and may be truncated at context assembly. No model-based reranker exists.
- The checked migration declares journal `title`, `mood`, `excerpt`, `tags`, and embeddings as ordinary text/JSONB. `003_client_side_chat_encryption.sql` creates chat-encryption-key metadata but does not encrypt these journal fields or embedding arrays. Journal images are handled separately in client code. This evaluation did not access records; schema inspection indicates the AI-visible journal text/vector data is not covered by the chat-encryption migration.
- User-id filters are present in inspected server queries. Runtime cross-user isolation is still not proven without test identities against an isolated DB.

## Safe environment / blockers

- Local Qwen-compatible embedding endpoint and credential are configured and had previously been used only with synthetic strings; values are intentionally omitted.
- `.env.local` contains generic database configuration names, but no separately named test database/tenant configuration was identified. These existing credentials were not read or used because they may target production.
- No `psql`, PostgreSQL server utilities/service, Neon CLI, Docker, or `pg`/pgvector client dependency was available. No Neon database MCP connection tool is configured.
- `DEEPSEEK_API_KEY` is absent. Consequently no live tool selection, final response, faithfulness, abstention, or generated crisis-safety evaluation can be performed.
- A new empty Neon project or an explicitly isolated empty Neon branch with test-only credentials, plus a test-only DeepSeek credential, is needed. Do not branch/clone production data for this test.

## 4096-dimension indexing constraint

The current JSONB + application ranking path accepts Qwen's 4096 values and does not depend on pgvector. The current upstream pgvector README lists HNSW/IVFFlat index limits of 2,000 dimensions for `vector` and 4,000 for `halfvec`; Qwen's 4,096 dimensions exceed both indexed forms. No dimensionality reduction or schema change was attempted. Benchmark options only after isolated PostgreSQL is available: exact SQL evaluation from JSONB, a suitable dimension-reduction/embedding alternative, or a measured subvector/quantization design with recall validation. Source: [pgvector README](https://github.com/pgvector/pgvector/blob/master/README.md).

## Validation boundary

The Qwen provider + in-memory ranker and unit tests were executed with synthetic material. The additional ranker benchmark uses deterministic synthetic 4096D arrays, and measures only Node.js ranker CPU/heap behavior. It is not a DB benchmark, Qwen latency benchmark, end-to-end retrieval benchmark, or faithful concurrent-server simulation. No DB writes/queries, production data, or frontend changes were made.
