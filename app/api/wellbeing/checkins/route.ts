import { NextResponse } from "next/server";
import { createRouteNeonClient } from "../../../lib/serverNeon";

const headers = { "Cache-Control": "private, no-store" };
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const db = await createRouteNeonClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const params = new URL(request.url).searchParams;
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  if (!datePattern.test(from) || !datePattern.test(to) || to < from) {
    return NextResponse.json({ error: "Choose a valid date range." }, { status: 400, headers });
  }

  const { data, error } = await db.from("mood_checkins")
    .select("checkin_date, period, mood_score, submitted_at")
    .eq("student_id", user.id)
    .gte("checkin_date", from)
    .lte("checkin_date", to)
    .order("checkin_date", { ascending: true });
  if (error) return NextResponse.json({ error: "Your mood check-ins could not be loaded." }, { status: 500, headers });
  return NextResponse.json({ checkins: data ?? [] }, { headers });
}

export async function POST(request: Request) {
  const db = await createRouteNeonClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const body = await request.json().catch(() => ({}));
  const checkinDate = typeof body.checkinDate === "string" ? body.checkinDate : "";
  const period = body.period === "morning" || body.period === "evening" ? body.period : "";
  const moodScore = Number(body.moodScore);
  if (!datePattern.test(checkinDate) || !period || !Number.isInteger(moodScore) || moodScore < 1 || moodScore > 5) {
    return NextResponse.json({ error: "Choose morning or evening and a mood score from 1 to 5." }, { status: 400, headers });
  }

  const { data, error } = await db.from("mood_checkins").upsert({
    student_id: user.id,
    checkin_date: checkinDate,
    period,
    mood_score: moodScore,
  }, { onConflict: "student_id,checkin_date,period" })
    .select("checkin_date, period, mood_score, submitted_at")
    .single();
  if (error) {
    const forbidden = /row-level security|permission denied|42501/i.test(error.message || "");
    return NextResponse.json(
      { error: forbidden ? "Only student accounts can submit mood check-ins." : "Your mood check-in could not be saved." },
      { status: forbidden ? 403 : 500, headers }
    );
  }
  return NextResponse.json({ checkin: data }, { status: 201, headers });
}
