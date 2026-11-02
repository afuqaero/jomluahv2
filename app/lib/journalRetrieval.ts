import { rankRecordsWithScores } from "./aiRetrieval.ts";

export const MIN_JOURNAL_RETRIEVAL_SCORE = 0.375;

export type JournalRecord = {
  id: string;
  title: string;
  mood: string;
  excerpt: string | null;
  tags: string[] | null;
  timestamp: string;
  embedding?: unknown;
};

type JournalQueryResult = { data: JournalRecord[] | null; error: unknown | null };
interface JournalQuery extends PromiseLike<JournalQueryResult> {
  eq(field: string, value: string): JournalQuery;
  order(field: string, options: { ascending: boolean }): JournalQuery;
  limit(count: number): JournalQuery;
}
export interface JournalDatabase {
  from(table: string): { select(columns: string): JournalQuery };
}

export type JournalRetrievalResult =
  | { ok: true; records: JournalRecord[] }
  | { ok: false; reason: "unauthorized" | "timeout" | "unavailable" };
export type JournalRetrievalMetrics = {
  databaseMs: number;
  rankingMs: number;
  ranked: Array<{ id: string; score: number; semantic: number; lexical: number }>;
};

export async function retrieveJournalRecords(
  database: JournalDatabase,
  userId: string | null | undefined,
  query: string,
  queryEmbedding: number[] | null,
  limit: number,
  observe?: (metrics: JournalRetrievalMetrics) => void,
): Promise<JournalRetrievalResult> {
  if (!userId) return { ok: false, reason: "unauthorized" };

  try {
    const databaseStarted = performance.now();
    const { data, error } = await database.from("journal_entries")
      .select("id, title, mood, excerpt, tags, timestamp, embedding")
      .eq("user_id", userId).order("timestamp", { ascending: false }).limit(100);
    const databaseMs = performance.now() - databaseStarted;
    if (error) return { ok: false, reason: "unavailable" };

    const searchable = (data || []).map((journal) => ({
      ...journal,
      content: `${journal.title} ${journal.mood} ${journal.excerpt || ""} ${(journal.tags || []).join(" ")}`,
    }));
    const rankingStarted = performance.now();
    const ranked = rankRecordsWithScores(query, searchable, queryEmbedding, limit, MIN_JOURNAL_RETRIEVAL_SCORE);
    const rankingMs = performance.now() - rankingStarted;
    observe?.({
      databaseMs,
      rankingMs,
      ranked: ranked.map(({ record, score, semantic, lexical }) => ({ id: record.id, score, semantic, lexical })),
    });
    return { ok: true, records: ranked.map(({ record }) => record) };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")
        ? "timeout"
        : "unavailable",
    };
  }
}
