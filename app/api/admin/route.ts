import { NextResponse } from "next/server";
import { createRouteNeonClient } from "../../lib/serverNeon";

const headers = { "Cache-Control": "private, no-store" };

async function getAdminClient() {
  const db = await createRouteNeonClient();
  const { data: { user } } = await db.auth.getUser();
  return { db, user };
}

function statusForError(message: string) {
  return /access required|administrator/i.test(message) ? 403 : 500;
}

export async function GET(request: Request) {
  const { db, user } = await getAdminClient();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const search = new URL(request.url).searchParams.get("search")?.trim().slice(0, 100) ?? "";
  const [directory, assignments] = await Promise.all([
    db.rpc("admin_list_directory", { p_search: search || null }),
    db.rpc("admin_list_assignments", {}),
  ]);
  const error = directory.error ?? assignments.error;
  if (error) {
    const message = error.message || "Administrator access could not be verified.";
    return NextResponse.json({ error: message }, { status: statusForError(message), headers });
  }

  return NextResponse.json({ directory: directory.data ?? [], assignments: assignments.data ?? [] }, { headers });
}

export async function PATCH(request: Request) {
  const { db, user } = await getAdminClient();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const body = await request.json().catch(() => ({}));
  const targetUserId = typeof body.userId === "string" ? body.userId : "";
  const role = body.role === "counselor" || body.role === "user" ? body.role : "";
  if (!targetUserId || !role) {
    return NextResponse.json({ error: "Choose a user and a student or counselor role." }, { status: 400, headers });
  }

  const { error } = await db.rpc("admin_set_user_role", {
    p_target_user_id: targetUserId,
    p_new_role: role,
  });
  if (error) {
    const message = error.message || "The role could not be updated.";
    return NextResponse.json({ error: message }, { status: statusForError(message), headers });
  }
  return NextResponse.json({ updated: true }, { headers });
}

export async function POST(request: Request) {
  const { db, user } = await getAdminClient();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const body = await request.json().catch(() => ({}));
  const studentId = typeof body.studentId === "string" ? body.studentId : "";
  const counselorId = typeof body.counselorId === "string" ? body.counselorId : "";
  if (!studentId || !counselorId) {
    return NextResponse.json({ error: "Choose a student and counselor." }, { status: 400, headers });
  }

  const { data, error } = await db.rpc("admin_assign_student", {
    p_student_id: studentId,
    p_counselor_id: counselorId,
  });
  if (error) {
    const message = error.message || "The counselor assignment could not be saved.";
    return NextResponse.json({ error: message }, { status: statusForError(message), headers });
  }
  return NextResponse.json({ assigned: true, assignmentId: data }, { status: 201, headers });
}

export async function DELETE(request: Request) {
  const { db, user } = await getAdminClient();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401, headers });

  const body = await request.json().catch(() => ({}));
  const studentId = typeof body.studentId === "string" ? body.studentId : "";
  if (!studentId) return NextResponse.json({ error: "Choose a student to unassign." }, { status: 400, headers });

  const { data, error } = await db.rpc("admin_unassign_student", { p_student_id: studentId });
  if (error) {
    const message = error.message || "The assignment could not be removed.";
    return NextResponse.json({ error: message }, { status: statusForError(message), headers });
  }
  return NextResponse.json({ unassigned: Boolean(data) }, { headers });
}
