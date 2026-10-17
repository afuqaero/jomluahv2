import { NextResponse } from "next/server";
import { createRouteNeonClient } from "../../../lib/serverNeon";

const noStoreHeaders = { "Cache-Control": "private, no-store" };

async function authenticatedClient() {
  const supabase = await createRouteNeonClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await authenticatedClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStoreHeaders });

  const { data, error } = await supabase.from("ai_preferences")
    .select("memory_enabled, journal_rag_enabled, updated_at")
    .eq("user_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: noStoreHeaders });

  return NextResponse.json({
    preferences: data || { memory_enabled: true, journal_rag_enabled: true, updated_at: null },
  }, { headers: noStoreHeaders });
}

export async function PATCH(req: Request) {
  const { supabase, user } = await authenticatedClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStoreHeaders });

  const body = await req.json().catch(() => ({}));
  const memoryEnabled = typeof body.memory_enabled === "boolean" ? body.memory_enabled : undefined;
  const journalRagEnabled = typeof body.journal_rag_enabled === "boolean" ? body.journal_rag_enabled : undefined;
  if (memoryEnabled === undefined && journalRagEnabled === undefined) {
    return NextResponse.json({ error: "No valid preference supplied" }, { status: 400, headers: noStoreHeaders });
  }

  const { data: current } = await supabase.from("ai_preferences")
    .select("memory_enabled, journal_rag_enabled")
    .eq("user_id", user.id).maybeSingle();
  const { data, error } = await supabase.from("ai_preferences").upsert({
    user_id: user.id,
    memory_enabled: memoryEnabled ?? current?.memory_enabled ?? true,
    journal_rag_enabled: journalRagEnabled ?? current?.journal_rag_enabled ?? true,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" }).select("memory_enabled, journal_rag_enabled, updated_at").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: noStoreHeaders });
  return NextResponse.json({ preferences: data }, { headers: noStoreHeaders });
}
