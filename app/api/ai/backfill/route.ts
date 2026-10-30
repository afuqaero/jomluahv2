import { NextResponse } from "next/server";
import { createEmbeddings } from "../../../lib/aiRetrieval";
import { createRouteNeonClient } from "../../../lib/serverNeon";

const noStoreHeaders = { "Cache-Control": "private, no-store" };

export async function POST(req: Request) {
  const neon = await createRouteNeonClient();
  const { data: { user } } = await neon.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStoreHeaders });
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasGenericProvider = Boolean(
    process.env.EMBEDDING_API_URL && process.env.EMBEDDING_API_KEY && process.env.EMBEDDING_MODEL
  );
  if (!hasGemini && !hasGenericProvider) {
    return NextResponse.json(
      { error: "Gemini or a generic embedding provider is not configured" },
      { status: 503, headers: noStoreHeaders }
    );
  }

  const body = await req.json().catch(() => ({}));
  const batchSize = Math.max(1, Math.min(25, Number(body.batch_size) || 10));
  const [{ data: memories, error: memoryError }, { data: journals, error: journalError }] = await Promise.all([
    neon.from("user_memories").select("id, content").eq("user_id", user.id).is("embedding", null).limit(batchSize),
    neon.from("journal_entries").select("id, title, mood, excerpt, tags").eq("user_id", user.id).is("embedding", null).limit(batchSize),
  ]);
  if (memoryError || journalError) {
    return NextResponse.json({ error: memoryError?.message || journalError?.message }, { status: 500, headers: noStoreHeaders });
  }

  const memoryRows = memories || [];
  const journalRows = journals || [];
  const texts = [
    ...memoryRows.map((memory) => memory.content),
    ...journalRows.map((journal) => `${journal.title} ${journal.mood} ${journal.excerpt || ""} ${(journal.tags || []).join(" ")}`),
  ];
  const embeddings = await createEmbeddings(texts, req.signal);
  let updatedMemories = 0;
  let updatedJournals = 0;

  for (let index = 0; index < memoryRows.length; index += 1) {
    const embedding = embeddings[index];
    if (!embedding) continue;
    const { error } = await neon.from("user_memories").update({ embedding })
      .eq("id", memoryRows[index].id).eq("user_id", user.id);
    if (!error) updatedMemories += 1;
  }
  for (let index = 0; index < journalRows.length; index += 1) {
    const embedding = embeddings[memoryRows.length + index];
    if (!embedding) continue;
    const { error } = await neon.from("journal_entries").update({ embedding })
      .eq("id", journalRows[index].id).eq("user_id", user.id);
    if (!error) updatedJournals += 1;
  }

  return NextResponse.json({
    updated: { memories: updatedMemories, journals: updatedJournals },
    has_more: memoryRows.length === batchSize || journalRows.length === batchSize,
    batch_size: batchSize,
  }, { headers: noStoreHeaders });
}
