import { NextResponse } from "next/server";
import { createRouteNeonClient } from "../../../lib/serverNeon";

const headers = { "Cache-Control": "private, no-store" };
const consentVersion = "mood-share-v1";

async function authenticatedClient() {
  const db = await createRouteNeonClient();
  const { data: { user } } = await db.auth.getUser();
  return { db, user };
}

export async function GET() {
  const { db, user } = await authenticatedClient();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const { data, error } = await db.from("mood_sharing_consents")
    .select("share_enabled, consent_version, consented_at, revoked_at")
    .eq("student_id", user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Mood-sharing settings could not be loaded." }, { status: 500, headers });
  return NextResponse.json({ consent: data ?? { share_enabled: false } }, { headers });
}

export async function PUT(request: Request) {
  const { db, user } = await authenticatedClient();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const body = await request.json().catch(() => ({}));
  if (body.shareEnabled !== true || body.consentVersion !== consentVersion) {
    return NextResponse.json({ error: "Review and confirm the current mood-sharing consent." }, { status: 400, headers });
  }

  const { data, error } = await db.rpc("student_set_mood_sharing", {
    p_share_enabled: true,
    p_consent_version: consentVersion,
  });
  if (error) {
    const message = error.message || "Only students can enable mood sharing.";
    const forbidden = /only students/i.test(message);
    return NextResponse.json({ error: message }, { status: forbidden ? 403 : 500, headers });
  }
  return NextResponse.json({ consent: Array.isArray(data) ? data[0] : data }, { headers });
}

export async function DELETE() {
  const { db, user } = await authenticatedClient();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const { data, error } = await db.rpc("student_set_mood_sharing", {
    p_share_enabled: false,
    p_consent_version: consentVersion,
  });
  if (error) {
    const message = error.message || "Only students can change mood sharing.";
    const forbidden = /only students/i.test(message);
    return NextResponse.json({ error: message }, { status: forbidden ? 403 : 500, headers });
  }
  return NextResponse.json({ consent: Array.isArray(data) ? data[0] ?? null : data ?? null }, { headers });
}
