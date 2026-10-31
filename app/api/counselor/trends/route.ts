import { NextResponse } from "next/server";
import { createRouteNeonClient } from "../../../lib/serverNeon";

const headers = { "Cache-Control": "private, no-store" };
type SharedStudent = { student_id: string; mood_sharing_enabled: boolean };
type Checkin = { checkin_date: string; mood_score: number };

export async function GET(request: Request) {
  const db = await createRouteNeonClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const requested = Number(new URL(request.url).searchParams.get("months") || 6);
  if (![3, 6, 12].includes(requested)) return NextResponse.json({ error: "Invalid date range." }, { status: 400, headers });

  const { data: roster, error: rosterError } = await db.rpc("counselor_list_assigned_students", {});
  if (rosterError) return NextResponse.json({ error: "Counselor access could not be verified." }, { status: 403, headers });

  const now = new Date();
  const months = Array.from({ length: requested }, (_, index) => {
    const date = new Date(Date.UTC(now.getFullYear(), now.getMonth() - requested + index + 1, 1));
    return { month: date.toISOString().slice(0, 7), label: date.toLocaleString("en-MY", { month: "short", timeZone: "UTC" }), averageMood: null as number | null, checkinCount: 0 };
  });
  const from = `${months[0].month}-01`;
  const to = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0)).toISOString().slice(0, 10);
  const shared = ((roster ?? []) as SharedStudent[]).filter((student) => student.mood_sharing_enabled);
  const ranges: { from: string; to: string }[] = [];
  let cursor = new Date(`${from}T00:00:00Z`);
  const last = new Date(`${to}T00:00:00Z`);
  while (cursor <= last) {
    const end = new Date(Math.min(cursor.getTime() + 90 * 86_400_000, last.getTime()));
    ranges.push({ from: cursor.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) });
    cursor = new Date(end.getTime() + 86_400_000);
  }

  const results: Checkin[][] = [];
  for (let index = 0; index < shared.length; index += 5) {
    const batch = await Promise.all(shared.slice(index, index + 5).map(async (student) => {
      const chunks = await Promise.all(ranges.map((range) => db.rpc("counselor_get_mood_checkins", {
        p_student_id: student.student_id, p_from: range.from, p_to: range.to,
      })));
      if (chunks.some((chunk) => chunk.error)) throw new Error("Shared mood trends could not be loaded.");
      return chunks.flatMap((chunk) => (chunk.data ?? []) as Checkin[]);
    })).catch(() => null);
    if (!batch) return NextResponse.json({ error: "Shared mood trends could not be loaded." }, { status: 500, headers });
    results.push(...batch);
  }

  const sums = new Map(months.map((month) => [month.month, { total: 0, count: 0 }]));
  let improvingClients = 0;
  let clientsWithData = 0;
  for (const rows of results) {
    if (rows.length) clientsWithData++;
    const byMonth = new Map<string, { total: number; count: number }>();
    for (const row of rows) {
      const key = row.checkin_date.slice(0, 7);
      const overall = sums.get(key);
      if (!overall) continue;
      overall.total += row.mood_score;
      overall.count++;
      const own = byMonth.get(key) ?? { total: 0, count: 0 };
      own.total += row.mood_score;
      own.count++;
      byMonth.set(key, own);
    }
    const active = [...byMonth.values()];
    if (active.length >= 2 && active.at(-1)!.total / active.at(-1)!.count > active[0].total / active[0].count) improvingClients++;
  }

  for (const month of months) {
    const summary = sums.get(month.month)!;
    month.checkinCount = summary.count;
    month.averageMood = summary.count ? Math.round(((summary.total / summary.count - 1) / 4) * 100) : null;
  }
  return NextResponse.json({ months, improvingClients, clientsWithData }, { headers });
}
