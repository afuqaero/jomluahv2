import { NextResponse } from "next/server";
import { createRouteNeonClient } from "../../../lib/serverNeon";

const noStoreHeaders = { "Cache-Control": "private, no-store" };
const contextProfiles = new Set(["quick", "balanced", "deep"]);

function normaliseContextProfile(value: unknown) {
  return typeof value === "string" && contextProfiles.has(value) ? value : undefined;
}

async function authenticatedClient() {
  const neon = await createRouteNeonClient();
  const { data: { user } } = await neon.auth.getUser();
  return { neon, user };
}

export async function GET() {
  const { neon, user } = await authenticatedClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStoreHeaders });

  const { data, error } = await neon.from("ai_preferences")
    .select("memory_enabled, journal_rag_enabled, context_profile, updated_at")
    .eq("user_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: noStoreHeaders });

  return NextResponse.json({
    preferences: data || { memory_enabled: true, journal_rag_enabled: true, context_profile: "balanced", updated_at: null },
  }, { headers: noStoreHeaders });
}

export async function PATCH(req: Request) {
  const { neon, user } = await authenticatedClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStoreHeaders });

  const body = await req.json().catch(() => ({}));
  const memoryEnabled = typeof body.memory_enabled === "boolean" ? body.memory_enabled : undefined;
  const journalRagEnabled = typeof body.journal_rag_enabled === "boolean" ? body.journal_rag_enabled : undefined;
  const contextProfile = normaliseContextProfile(body.context_profile);
  if (memoryEnabled === undefined && journalRagEnabled === undefined && contextProfile === undefined) {
    return NextResponse.json({ error: "No valid preference supplied" }, { status: 400, headers: noStoreHeaders });
  }

  const { data: current } = await neon.from("ai_preferences")
    .select("memory_enabled, journal_rag_enabled, context_profile")
    .eq("user_id", user.id).maybeSingle();
  const { data, error } = await neon.from("ai_preferences").upsert({
    user_id: user.id,
    memory_enabled: memoryEnabled ?? current?.memory_enabled ?? true,
    journal_rag_enabled: journalRagEnabled ?? current?.journal_rag_enabled ?? true,
    context_profile: contextProfile ?? current?.context_profile ?? "balanced",
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" }).select("memory_enabled, journal_rag_enabled, context_profile, updated_at").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: noStoreHeaders });
  return NextResponse.json({ preferences: data }, { headers: noStoreHeaders });
}
