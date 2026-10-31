import { NextResponse } from "next/server";
import { createRouteNeonClient } from "../../../lib/serverNeon";

const headers = { "Cache-Control": "private, no-store" };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function mutationAllowed(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function rpcError(message: string) {
  const forbidden = /access required|not assigned/i.test(message);
  const invalid = /valid|overlap|future|two hours/i.test(message);
  return NextResponse.json({ error: forbidden ? "Counselor access required." : invalid ? message : "Appointments could not be processed." }, { status: forbidden ? 403 : invalid ? 400 : 500, headers });
}

export async function GET(request: Request) {
  const db = await createRouteNeonClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });
  const params = new URL(request.url).searchParams;
  const from = parseDate(params.get("from"));
  const to = parseDate(params.get("to"));
  if (!from || !to) return NextResponse.json({ error: "Choose a valid date range." }, { status: 400, headers });
  const { data, error } = await db.rpc("counselor_list_appointments", { p_from: from, p_to: to });
  if (error) return rpcError(error.message || "Appointments could not be loaded.");
  return NextResponse.json({ appointments: data ?? [] }, { headers });
}

export async function POST(request: Request) {
  if (!mutationAllowed(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers });
  const db = await createRouteNeonClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });
  const body = await request.json().catch(() => ({}));
  const studentId = typeof body.studentId === "string" ? body.studentId : "";
  const startsAt = parseDate(body.startsAt);
  const endsAt = parseDate(body.endsAt);
  const kind = typeof body.kind === "string" ? body.kind : "";
  if (!uuidPattern.test(studentId) || !startsAt || !endsAt || !["individual", "follow_up", "initial"].includes(kind)) {
    return NextResponse.json({ error: "Choose an assigned student, time, and session type." }, { status: 400, headers });
  }
  const { data, error } = await db.rpc("counselor_create_appointment", {
    p_student_id: studentId, p_starts_at: startsAt, p_ends_at: endsAt, p_kind: kind,
  });
  if (error) return rpcError(error.message || "Appointment could not be created.");
  return NextResponse.json({ id: data }, { status: 201, headers });
}

export async function DELETE(request: Request) {
  if (!mutationAllowed(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers });
  const db = await createRouteNeonClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!uuidPattern.test(id)) return NextResponse.json({ error: "Choose a valid appointment." }, { status: 400, headers });
  const { data, error } = await db.rpc("counselor_cancel_appointment", { p_appointment_id: id });
  if (error) return rpcError(error.message || "Appointment could not be cancelled.");
  return NextResponse.json({ cancelled: Boolean(data) }, { headers });
}
