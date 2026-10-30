import { NextResponse } from "next/server";
import { createRouteNeonClient } from "../../lib/serverNeon";

const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  const db = await createRouteNeonClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const { data, error } = await db.rpc("counselor_list_assigned_students", {});
  if (error) {
    const forbidden = /counselor access required/i.test(error.message || "");
    return NextResponse.json(
      { error: error.message || "Counselor access could not be verified." },
      { status: forbidden ? 403 : 500, headers }
    );
  }
  return NextResponse.json({ students: data ?? [] }, { headers });
}
