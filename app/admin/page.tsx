"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowClockwise, ArrowRight, CaretDown, Check, MagnifyingGlass, ShieldCheck, SignOut, UserSwitch, UsersThree } from "@phosphor-icons/react";
import { neon } from "../lib/neonClient";

type DirectoryPerson = {
  user_id: string;
  email: string;
  full_name: string | null;
  student_number: string | null;
  role: "user" | "counselor";
  created_at: string;
  counselor_access_requested: boolean;
};

type Assignment = {
  assignment_id: string;
  student_id: string;
  student_name: string | null;
  student_number: string | null;
  counselor_id: string;
  counselor_name: string | null;
  assigned_at: string;
};
type DirectoryFilter = "all" | "assigned_students" | "unassigned_students" | "assigned_counselors" | "unassigned_counselors";

const buttonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1] disabled:cursor-not-allowed disabled:opacity-50";

function StyledPicker({ id, value, onChange, placeholder, options, disabled = false }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);
  return (
    <div ref={rootRef} className="relative">
      <button id={id} type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen(true); } }} className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[#d5daeb] bg-white px-3 text-left text-sm text-[#29284f] outline-none transition hover:border-[#aeb5d8] focus:border-[#7771ef] focus:ring-4 focus:ring-[#6366F1]/10 disabled:bg-[#f4f5fa]">
        <span className={selected ? "truncate" : "truncate text-[#777f9a]"}>{selected?.label || placeholder}</span>
        <CaretDown size={15} aria-hidden="true" className={`ml-3 shrink-0 text-[#717895] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && !disabled && <div role="listbox" aria-labelledby={id} className="absolute z-30 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-[#e1e4f1] bg-white p-1.5 shadow-[0_14px_36px_rgba(35,38,82,0.16)]">
        {options.length ? options.map((option) => <button key={option.value} type="button" role="option" aria-selected={value === option.value} onClick={() => { onChange(option.value); setOpen(false); }} className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm transition ${value === option.value ? "bg-[#f0efff] font-semibold text-[#4f46d8]" : "text-[#353653] hover:bg-[#f6f6fc]"}`}>
          <span className="truncate">{option.label}</span>{value === option.value && <Check size={16} aria-hidden="true" className="ml-2 shrink-0 text-[#5146dc]" />}
        </button>) : <p className="rounded-lg px-3 py-2 text-sm text-[#777f9a]">{placeholder}</p>}
      </div>}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [directory, setDirectory] = useState<DirectoryPerson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [search, setSearch] = useState("");
  const [directoryFilter, setDirectoryFilter] = useState<DirectoryFilter>("all");
  const [counselorFilter, setCounselorFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirmation, setConfirmation] = useState<{ title: string; detail: string; run: () => void } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin", { cache: "no-store" });
      const payload = await response.json();
      if (response.status === 403 && payload.code === "ADMIN_ROLE_REQUIRED") {
        router.replace("/admin/login?reason=role");
        return;
      }
      if (!response.ok) throw new Error(payload.error || "Admin data could not be loaded.");
      setDirectory(payload.directory ?? []);
      setAssignments(payload.assignments ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Admin data could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => { void Promise.resolve().then(loadOverview); }, [loadOverview]);

  const counselors = useMemo(() => directory.filter((person) => person.role === "counselor"), [directory]);
  const students = useMemo(() => directory.filter((person) => person.role === "user"), [directory]);
  const visiblePeople = useMemo(() => {
    const query = search.trim().toLowerCase();
    const activeStudents = new Set(assignments.map((assignment) => assignment.student_id));
    const activeCounselors = new Set(assignments.map((assignment) => assignment.counselor_id));
    return directory.filter((person) => {
      const matchesQuery = !query || [person.full_name, person.student_number, person.email]
        .some((value) => value?.toLowerCase().includes(query));
      const matchesCounselor = !counselorFilter || (person.role === "user" && assignments.some((assignment) => assignment.student_id === person.user_id && assignment.counselor_id === counselorFilter));
      const matchesFilter = directoryFilter === "all"
        || (directoryFilter === "assigned_students" && person.role === "user" && activeStudents.has(person.user_id))
        || (directoryFilter === "unassigned_students" && person.role === "user" && !activeStudents.has(person.user_id))
        || (directoryFilter === "assigned_counselors" && person.role === "counselor" && activeCounselors.has(person.user_id))
        || (directoryFilter === "unassigned_counselors" && person.role === "counselor" && !activeCounselors.has(person.user_id));
      return matchesQuery && matchesCounselor && matchesFilter;
    });
  }, [directory, search, directoryFilter, counselorFilter, assignments]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(visiblePeople.length / pageSize));
  const pagePeople = visiblePeople.slice((page - 1) * pageSize, page * pageSize);

  const assignCounselor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStudent || !selectedCounselor) return;
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent, counselorId: selectedCounselor }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Assignment could not be saved.");
      setNotice("Counselor assignment saved.");
      await loadOverview();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Assignment could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const changeRole = async (person: DirectoryPerson, confirmed = false) => {
    if (person.role === "user" && !person.counselor_access_requested) return;
    const nextRole = person.role === "user" ? "counselor" : "user";
    const message = nextRole === "user"
      ? "Remove counselor access? Their active student assignments will also end."
      : `Give ${person.full_name || person.email} the counselor role?`;
    if (!confirmed) {
      setConfirmation({ title: nextRole === "counselor" ? "Approve counselor access?" : "Remove counselor access?", detail: message, run: () => { setConfirmation(null); void changeRole(person, true); } });
      return;
    }
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: person.user_id, role: nextRole }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Role could not be updated.");
      setNotice(nextRole === "counselor" ? "Counselor role assigned." : "Counselor role removed.");
      await loadOverview();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Role could not be updated.");
    } finally {
      setIsSaving(false);
    }
  };

  const unassignStudent = async (studentId: string, confirmed = false) => {
    if (!confirmed) {
      setConfirmation({ title: "Unassign this student?", detail: "Their active counselor assignment will end.", run: () => { setConfirmation(null); void unassignStudent(studentId, true); } });
      return;
    }
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Assignment could not be removed.");
      setNotice(payload.unassigned ? "Student unassigned." : "No active assignment found.");
      await loadOverview();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Assignment could not be removed.");
    } finally {
      setIsSaving(false);
    }
  };

  const signOut = async () => {
    await neon.auth.signOut();
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f7f8ff_0%,#edf2ff_52%,#f7f8ff_100%)] font-sans text-[#1c1a48]">
      <header className="border-b border-[#dce2f3] bg-white/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-[#201d56]">JomLuah <span className="ml-2 text-xs font-semibold text-[#6b7190]">ADMIN</span></Link>
          <button type="button" onClick={signOut} className={`${buttonClass} bg-white text-[#4c5270] hover:bg-[#f3f4fb]`}>
            <SignOut aria-hidden="true" size={17} /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">Access management</p>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Counselor assignments</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#59617e]">Assign each student to one counselor and manage counselor account roles. This page does not display student mood check-ins, journals, or chats.</p>
          </div>
          <button type="button" onClick={() => void loadOverview()} disabled={isLoading} className={`${buttonClass} border border-[#dce1f1] bg-white text-[#393b64] hover:bg-[#f7f7ff]`}>
            <ArrowClockwise aria-hidden="true" size={17} /> Refresh
          </button>
        </div>

        {(error || notice) && (
          <div role={error ? "alert" : "status"} className={`mb-6 rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
            {error || notice}
          </div>
        )}

        {isLoading ? (
          <div role="status" className="rounded-2xl border border-[#dfe4f2] bg-white p-8 text-sm text-[#59617e]">Loading staff roles and assignments…</div>
        ) : error && directory.length === 0 ? (
          <section className="rounded-2xl border border-[#dfe4f2] bg-white p-8">
            <h2 className="text-lg font-bold">Admin access unavailable</h2>
            <p className="mt-2 text-sm text-[#59617e]">This account may not have the admin role, or the database migration may not be applied. Ask the system administrator to verify access.</p>
            <button type="button" onClick={() => void loadOverview()} className={`${buttonClass} mt-5 bg-[#6366F1] text-white hover:bg-[#4F46E5]`}>Try again</button>
          </section>
        ) : (
          <>
            <section className="grid gap-5 xl:grid-cols-[minmax(280px,0.76fr)_minmax(0,1.5fr)]">
              <div className="rounded-2xl border border-[#dfe4f2] bg-white p-5 shadow-[0_8px_30px_rgba(42,55,105,0.04)] md:p-6">
                <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4F46E5]"><UserSwitch aria-hidden="true" size={21} /></span>
                  <div><h2 className="font-bold">Assign a counselor</h2><p className="text-xs text-[#69708c]">One active counselor per student</p></div>
                </div>
                <form onSubmit={assignCounselor} className="space-y-4">
                  <div>
                    <label htmlFor="assign-student" className="mb-1.5 block text-sm font-semibold">Student</label>
                    <StyledPicker id="assign-student" value={selectedStudent} onChange={setSelectedStudent} placeholder="Choose a student" options={students.map((person) => ({ value: person.user_id, label: `${person.full_name || person.email}${person.student_number ? ` · ${person.student_number}` : ""}` }))} />
                  </div>
                  <div>
                    <label htmlFor="assign-counselor" className="mb-1.5 block text-sm font-semibold">Counselor</label>
                    <StyledPicker id="assign-counselor" value={selectedCounselor} onChange={setSelectedCounselor} placeholder={counselors.length ? "Choose a counselor" : "No counselor roles yet"} disabled={!counselors.length} options={counselors.map((person) => ({ value: person.user_id, label: person.full_name || person.email }))} />
                  </div>
                  <button type="submit" disabled={isSaving || !students.length || !counselors.length} className={`${buttonClass} w-full bg-[#6366F1] text-white hover:bg-[#4F46E5]`}>
                    <ArrowRight aria-hidden="true" size={17} /> {isSaving ? "Saving…" : "Save assignment"}
                  </button>
                </form>
                {!counselors.length && <p className="mt-4 rounded-xl bg-[#f6f6ff] p-3 text-xs leading-5 text-[#5f6680]">Assign a counselor role in the directory first. Admin accounts are bootstrapped separately and cannot be created from this page.</p>}
              </div>

              <div className="rounded-2xl border border-[#dfe4f2] bg-white p-5 shadow-[0_8px_30px_rgba(42,55,105,0.04)] md:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4F46E5]"><UsersThree aria-hidden="true" size={21} /></span>
                    <div><h2 className="font-bold">Active assignments</h2><p className="text-xs text-[#69708c]">Assignment changes are recorded</p></div>
                  </div>
                  <span className="rounded-full bg-[#f3f4fb] px-3 py-1 text-xs font-bold text-[#424767]">{assignments.length} active</span>
                </div>
                {assignments.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                      <thead><tr className="border-b border-[#e8eaf3] text-xs uppercase tracking-wide text-[#727895]"><th className="py-3 pr-4 font-semibold">Student</th><th className="py-3 pr-4 font-semibold">Assigned counselor</th><th className="py-3 text-right font-semibold">Action</th></tr></thead>
                      <tbody>{assignments.map((assignment) => (
                        <tr key={assignment.assignment_id} className="border-b border-[#f0f1f7] last:border-0">
                          <td className="py-3 pr-4"><span className="block font-semibold">{assignment.student_name || "Unnamed student"}</span><span className="text-xs text-[#747b95]">{assignment.student_number || assignment.student_id}</span></td>
                          <td className="py-3 pr-4 font-medium text-[#464d6b]">{assignment.counselor_name || "Counselor"}</td>
                          <td className="py-3 text-right"><button type="button" disabled={isSaving} onClick={() => void unassignStudent(assignment.student_id)} className="rounded-lg px-3 py-2 text-xs font-bold text-[#a5364b] hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a5364b] disabled:opacity-50">Unassign</button></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#d8deef] bg-[#fafbff] px-5 py-8 text-center">
                    <p className="font-semibold">No counselor assignments yet</p><p className="mt-1 text-sm text-[#68708b]">Choose a student and counselor to create the first assignment.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-[#dfe4f2] bg-white p-5 shadow-[0_8px_30px_rgba(42,55,105,0.04)] md:p-6">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div><h2 className="font-bold">People and roles</h2><p className="mt-1 text-xs text-[#69708c]">Role changes are protected in the database. Demoting a counselor ends their active assignments.</p></div>
                <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[620px]">
                  <label className="relative block sm:col-span-2">
                    <span className="sr-only">Search people</span><MagnifyingGlass aria-hidden="true" size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8198]" />
                    <input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Search name, student ID, or email" className="min-h-10 w-full rounded-xl border border-[#d5daeb] bg-white pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]" />
                  </label>
                  <label className="block text-xs font-semibold text-[#68708b]">Filter people
                    <span className="mt-1 block"><StyledPicker id="directory-filter" value={directoryFilter} onChange={(value) => setDirectoryFilter(value as DirectoryFilter)} placeholder="All people" options={[
                      { value: "all", label: `All people · ${directory.length}` },
                      { value: "assigned_students", label: `Students with counselor · ${assignments.length}` },
                      { value: "unassigned_students", label: `Students without counselor · ${Math.max(0, students.length - assignments.length)}` },
                      { value: "assigned_counselors", label: `Counselors with students · ${new Set(assignments.map((assignment) => assignment.counselor_id)).size}` },
                      { value: "unassigned_counselors", label: `Counselors without students · ${Math.max(0, counselors.length - new Set(assignments.map((assignment) => assignment.counselor_id)).size)}` },
                    ]} /></span>
                  </label>
                  <label className="block text-xs font-semibold text-[#68708b]">Assigned counselor
                    <span className="mt-1 block"><StyledPicker id="counselor-filter" value={counselorFilter} onChange={setCounselorFilter} placeholder="Any counselor" options={counselors.map((person) => ({ value: person.user_id, label: person.full_name || person.email }))} /></span>
                  </label>
                  {(search || directoryFilter !== "all" || counselorFilter) && <button type="button" onClick={() => { setSearch(""); setDirectoryFilter("all"); setCounselorFilter(""); }} className="text-left text-xs font-semibold text-[#5146dc] hover:underline">Clear filters</button>}
                </div>
              </div>
              <p className="mb-3 text-xs text-[#737a93]">Showing {visiblePeople.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, visiblePeople.length)} of {visiblePeople.length} matching people</p>
              {visiblePeople.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                    <thead><tr className="border-b border-[#e8eaf3] text-xs uppercase tracking-wide text-[#727895]"><th className="py-3 pr-4 font-semibold">Name</th><th className="py-3 pr-4 font-semibold">Account</th><th className="py-3 pr-4 font-semibold">Role</th><th className="py-3 pr-4 font-semibold">Counselor / status</th><th className="py-3 text-right font-semibold">Manage</th></tr></thead>
                    <tbody>{pagePeople.map((person) => (
                      <tr key={person.user_id} className="border-b border-[#f0f1f7] last:border-0">
                        <td className="py-3 pr-4"><span className="block font-semibold">{person.full_name || "Name not set"}</span><span className="text-xs text-[#747b95]">{person.student_number || "No student ID"}</span></td>
                        <td className="py-3 pr-4 text-[#555d7b]">{person.email}</td>
                        <td className="py-3 pr-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${person.role === "counselor" ? "bg-[#e9e7ff] text-[#5146c8]" : "bg-[#e4f6f2] text-[#137968]"}`}>{person.role === "counselor" ? "Counselor" : "Student"}</span></td>
                        <td className="py-3 pr-4 text-xs text-[#59617e]">{person.role === "user" ? assignments.find((assignment) => assignment.student_id === person.user_id)?.counselor_name || (person.counselor_access_requested ? "Awaiting staff review" : "Not assigned") : `${assignments.filter((assignment) => assignment.counselor_id === person.user_id).length} students assigned`}{person.counselor_access_requested && <span className="ml-2 rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-800">Staff request</span>}</td>
                        <td className="py-3 text-right">{person.role === "user" ? person.counselor_access_requested ? <button type="button" disabled={isSaving} onClick={() => void changeRole(person)} className="rounded-lg border border-[#d9deed] px-3 py-2 text-xs font-bold text-[#3e4564] hover:bg-[#f7f8fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6366F1] disabled:opacity-50">Approve staff access</button> : <span className="text-xs text-[#858ba0]">Student account</span> : <button type="button" disabled={isSaving} onClick={() => void changeRole(person)} className="rounded-lg border border-[#d9deed] px-3 py-2 text-xs font-bold text-[#3e4564] hover:bg-[#f7f8fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6366F1] disabled:opacity-50">Remove counselor role</button>}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-xl bg-[#fafbff] px-4 py-6 text-center text-sm text-[#68708b]">No people match that search.</p>
              )}
              {pageCount > 1 && <div className="mt-4 flex items-center justify-end gap-3"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><span className="text-xs text-[#737a93]">Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div>}
              <p className="mt-4 text-xs text-[#737a93]">Directory is limited to 250 accounts per load. Admins can manage assignments but cannot read student mood check-ins.</p>
            </section>

            <div className="mt-5 flex items-center gap-2 text-xs text-[#68708b]"><ShieldCheck aria-hidden="true" size={16} className="text-[#4f6cad]" /> Admin actions use database role checks and are recorded in the audit log.</div>
          </>
        )}
      </div>
      {confirmation && <div className="fixed inset-0 z-50 grid place-items-center bg-[#19183d]/35 p-5" onMouseDown={() => setConfirmation(null)}><section role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><h2 id="admin-confirm-title" className="text-lg font-bold">{confirmation.title}</h2><p className="mt-2 text-sm leading-6 text-[#68708b]">{confirmation.detail}</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setConfirmation(null)} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancel</button><button type="button" onClick={confirmation.run} className="rounded-xl bg-[#5b55e8] px-4 py-2 text-sm font-semibold text-white">Confirm</button></div></section></div>}
    </main>
  );
}
