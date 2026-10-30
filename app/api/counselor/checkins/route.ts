import { NextResponse } from "next/server";
import { createRouteNeonClient } from "../../../lib/serverNeon";

const headers = { "Cache-Control": "private, no-store" };
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const db = await createRouteNeonClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const params = new URL(request.url).searchParams;
  const studentId = params.get("studentId") || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  if (!studentId || !datePattern.test(from) || !datePattern.test(to)) {
    return NextResponse.json({ error: "Choose a student and valid date range." }, { status: 400, headers });
  }

  const { data, error } = await db.rpc("counselor_get_mood_checkins", {
    p_student_id: studentId,
    p_from: from,
    p_to: to,
  });
  if (error) {
    const message = error.message || "Mood check-ins could not be loaded.";
    const forbidden = /access required|not assigned|not enabled/i.test(message);
    return NextResponse.json({ error: message }, { status: forbidden ? 403 : 500, headers });
  }
  return NextResponse.json({ checkins: data ?? [] }, { headers });
}
