type EmbeddedRecord = {
  id: string;
  content: string;
  embedding?: unknown;
  importance?: number;
  updated_at?: string;
};

const STOP_WORDS = new Set([
  "about", "after", "again", "also", "been", "boleh", "dalam", "from", "have",
  "just", "kalau", "like", "more", "saya", "that", "this", "untuk", "what",
  "when", "where", "with", "yang", "your",
]);

function tokens(text: string) {
  return new Set(
    text.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter((token) => token.length > 2 && !STOP_WORDS.has(token)) || []
  );
}

function parseEmbedding(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const numbers = value.map(Number);
  return numbers.every(Number.isFinite) ? numbers : null;
}

function cosineSimilarity(left: number[], right: number[]) {
  if (left.length !== right.length || left.length === 0) return 0;
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] ** 2;
    rightNorm += right[index] ** 2;
  }
  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

function lexicalSimilarity(query: string, content: string) {
  const queryTokens = tokens(query);
  if (queryTokens.size === 0) return 0;
  const contentTokens = tokens(content);
  let overlap = 0;
  queryTokens.forEach((token) => {
    if (contentTokens.has(token)) overlap += 1;
  });
  return overlap / queryTokens.size;
}

export async function createEmbeddings(texts: string[], signal?: AbortSignal): Promise<Array<number[] | null>> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const geminiModel = (process.env.GEMINI_EMBED_MODEL || "gemini-embedding-001").replace(/^models\//, "");
  if (geminiApiKey && texts.length > 0) {
    const model = `models/${geminiModel}`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${model}:batchEmbedContents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          requests: texts.map((text) => ({
            model,
            content: { parts: [{ text }] },
          })),
        }),
        signal,
      }
    );

    if (!response.ok) return texts.map(() => null);
    const data = await response.json();
    const rows = Array.isArray(data?.embeddings) ? data.embeddings : [];
    return texts.map((_, index) => parseEmbedding(rows[index]?.values));
  }

  const endpoint = process.env.EMBEDDING_API_URL;
  const apiKey = process.env.EMBEDDING_API_KEY;
  const model = process.env.EMBEDDING_MODEL;
  if (!endpoint || !apiKey || !model || texts.length === 0) return texts.map(() => null);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, input: texts }),
    signal,
  });

  if (!response.ok) return texts.map(() => null);
  const data = await response.json();
  const rows = Array.isArray(data?.data) ? data.data : [];
  return texts.map((_, index) => parseEmbedding(rows[index]?.embedding));
}

export async function createEmbedding(text: string, signal?: AbortSignal): Promise<number[] | null> {
  if (!text.trim()) return null;
  return (await createEmbeddings([text], signal))[0] || null;
}

export function rankRecords<T extends EmbeddedRecord>(
  query: string,
  records: T[],
  queryEmbedding: number[] | null,
  limit: number
) {
  return records
    .map((record) => {
      const recordEmbedding = parseEmbedding(record.embedding);
      const semantic = queryEmbedding && recordEmbedding
        ? Math.max(0, cosineSimilarity(queryEmbedding, recordEmbedding))
        : 0;
      const lexical = lexicalSimilarity(query, record.content);
      const importance = Math.max(1, Math.min(5, record.importance || 3)) / 5;
      return { record, score: semantic * 0.7 + lexical * 0.25 + importance * 0.05 };
    })
    .filter(({ score }) => score > 0.04)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ record }) => record);
}
