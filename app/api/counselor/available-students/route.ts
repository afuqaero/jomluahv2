import { NextResponse } from "next/server";
import { createRouteNeonClient } from "../../../lib/serverNeon";

const headers = { "Cache-Control": "private, no-store" };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mutationAllowed(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function rpcError(message: string, fallback: string) {
  const forbidden = /counselor access required/i.test(message);
  const unavailable = /no longer available/i.test(message);
  return NextResponse.json(
    { error: forbidden ? "Counselor access required." : unavailable ? "That student is no longer available. Refresh the list and try again." : fallback },
    { status: forbidden ? 403 : unavailable ? 409 : 500, headers }
  );
}

export async function GET() {
  const db = await createRouteNeonClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const { data, error } = await db.rpc("counselor_list_available_students", {});
  if (error) return rpcError(error.message || "Counselor access could not be verified.", "Available students could not be loaded.");
  return NextResponse.json({ students: data ?? [] }, { headers });
}

export async function POST(request: Request) {
  if (!mutationAllowed(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers });
  const db = await createRouteNeonClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const body = await request.json().catch(() => ({}));
  const studentId = typeof body.studentId === "string" ? body.studentId : "";
  if (!uuidPattern.test(studentId)) return NextResponse.json({ error: "Choose a valid student." }, { status: 400, headers });

  const { data, error } = await db.rpc("counselor_assign_available_student", { p_student_id: studentId });
  if (error) return rpcError(error.message || "Counselor access could not be verified.", "The student could not be assigned.");
  return NextResponse.json({ assignmentId: data }, { status: 201, headers });
}
