export type RecallSource = "memory" | "journal";
export type RecallSearch = { source: RecallSource; query: string };
export type RecallHit = { source: RecallSource; id: string; citation: string; snippet: string };
export type RecallStep = { remaining: number; searches: RecallSearch[]; hits: RecallHit[] };

export async function runRecallAgent(
  allowedSources: RecallSource[],
  chooseNext: (step: RecallStep) => Promise<RecallSearch | null>,
  search: (request: RecallSearch) => Promise<RecallHit[]>
): Promise<{ hits: RecallHit[]; searches: RecallSearch[] }> {
  const hits: RecallHit[] = [];
  const searches: RecallSearch[] = [];
  const allowed = new Set(allowedSources);

  for (let step = 0; step < 2; step += 1) {
    const choice = await chooseNext({ remaining: 2 - step, searches: [...searches], hits: [...hits] });
    if (!choice || !allowed.has(choice.source) || typeof choice.query !== "string") break;
    const query = choice.query.trim().slice(0, 160);
    if (query.length < 2) break;
    if (searches.some((previous) => previous.source === choice.source && previous.query.toLowerCase() === query.toLowerCase())) break;

    const request = { source: choice.source, query };
    searches.push(request);
    const found = await search(request);
    for (const hit of found.slice(0, 3)) {
      if (hit.source === request.source && !hits.some((existing) => existing.source === hit.source && existing.id === hit.id)) {
        hits.push(hit);
      }
    }
  }

  return { hits, searches };
}
