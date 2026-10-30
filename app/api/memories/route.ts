import { NextResponse } from "next/server";
import { createEmbedding } from "../../lib/aiRetrieval";
import {
  containsSecretData,
  normaliseImportance,
  normaliseMemoryCategory,
  normaliseMemoryContent,
} from "../../lib/aiPolicy";
import { createRouteNeonClient } from "../../lib/serverNeon";

const noStoreHeaders = { "Cache-Control": "private, no-store" };

async function authenticatedClient() {
  const neon = await createRouteNeonClient();
  const { data: { user } } = await neon.auth.getUser();
  return { neon, user };
}

export async function GET() {
  const { neon, user } = await authenticatedClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStoreHeaders });

  const { data, error } = await neon
    .from("user_memories")
    .select("id, content, category, importance, is_active, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: noStoreHeaders });
  return NextResponse.json({ memories: data || [] }, { headers: noStoreHeaders });
}

export async function POST(req: Request) {
  const { neon, user } = await authenticatedClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStoreHeaders });

  const body = await req.json().catch(() => ({}));
  const content = normaliseMemoryContent(body.content);
  if (!content) return NextResponse.json({ error: "Memory content is required" }, { status: 400, headers: noStoreHeaders });
  if (containsSecretData(content)) {
    return NextResponse.json({ error: "Passwords, PINs, bank details, and API keys cannot be saved" }, { status: 422, headers: noStoreHeaders });
  }

  const category = normaliseMemoryCategory(body.category);
  const importance = normaliseImportance(body.importance);
  const embedding = await createEmbedding(content, req.signal).catch(() => null);
  const { data: existing } = await neon
    .from("user_memories")
    .select("id")
    .eq("user_id", user.id)
    .eq("content", content)
    .maybeSingle();

  const query = existing
    ? neon.from("user_memories").update({
        category,
        importance,
        embedding,
        is_active: true,
        updated_at: new Date().toISOString(),
      }).eq("id", existing.id).eq("user_id", user.id).select("id, content, category, importance, is_active, created_at, updated_at").single()
    : neon.from("user_memories").insert({
        user_id: user.id,
        content,
        category,
        importance,
        embedding,
      }).select("id, content, category, importance, is_active, created_at, updated_at").single();

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: noStoreHeaders });
  return NextResponse.json({ memory: data }, { status: existing ? 200 : 201, headers: noStoreHeaders });
}

export async function PATCH(req: Request) {
  const { neon, user } = await authenticatedClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStoreHeaders });

  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Memory id is required" }, { status: 400, headers: noStoreHeaders });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.content !== undefined) {
    const content = normaliseMemoryContent(body.content);
    if (!content) return NextResponse.json({ error: "Memory content cannot be empty" }, { status: 400, headers: noStoreHeaders });
    if (containsSecretData(content)) return NextResponse.json({ error: "Secret credential data cannot be saved" }, { status: 422, headers: noStoreHeaders });
    updates.content = content;
    updates.embedding = await createEmbedding(content, req.signal).catch(() => null);
  }
  if (body.category !== undefined) updates.category = normaliseMemoryCategory(body.category);
  if (body.importance !== undefined) updates.importance = normaliseImportance(body.importance);
  if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

  const { data, error } = await neon.from("user_memories").update(updates)
    .eq("id", id).eq("user_id", user.id)
    .select("id, content, category, importance, is_active, created_at, updated_at").maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: noStoreHeaders });
  if (!data) return NextResponse.json({ error: "Memory not found" }, { status: 404, headers: noStoreHeaders });
  return NextResponse.json({ memory: data }, { headers: noStoreHeaders });
}

export async function DELETE(req: Request) {
  const { neon, user } = await authenticatedClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStoreHeaders });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Memory id is required" }, { status: 400, headers: noStoreHeaders });

  const { error, count } = await neon.from("user_memories")
    .delete({ count: "exact" }).eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: noStoreHeaders });
  if (!count) return NextResponse.json({ error: "Memory not found" }, { status: 404, headers: noStoreHeaders });
  return NextResponse.json({ deleted: true, id }, { headers: noStoreHeaders });
}
