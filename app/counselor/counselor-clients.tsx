"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ArrowRight, LoaderCircle, RefreshCw, Search, ShieldCheck, UserRoundPlus } from "lucide-react";

type Student = { student_id: string; full_name: string | null; student_number: string | null; mood_sharing_enabled: boolean };
type AvailableStudent = Pick<Student, "student_id" | "full_name" | "student_number">;

export function CounselorClients({ students, selectedId, onSelect, search, onSearch, loading, error, onRefresh, from, to, onFrom, onTo, checkinCount, average, chart }: {
  students: Student[];
  selectedId: string;
  onSelect: (id: string) => void;
  search: string;
  onSearch: (value: string) => void;
  loading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  checkinCount: number;
  average: number | null;
  chart: ReactNode;
}) {
  const [filter, setFilter] = useState<"all" | "sharing" | "private">("all");
  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
  const [availableLoading, setAvailableLoading] = useState(true);
  const [chosenStudentId, setChosenStudentId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const selected = students.find((student) => student.student_id === selectedId);
  const filtered = students.filter((student) => (filter === "all" || (filter === "sharing") === student.mood_sharing_enabled) && `${student.full_name ?? ""} ${student.student_number ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const sharing = students.filter((student) => student.mood_sharing_enabled).length;

  const loadAvailableStudents = useCallback(async () => {
    setAvailableLoading(true);
    try {
      const response = await fetch("/api/counselor/available-students", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Available students could not be loaded.");
      setAvailableStudents((result.students ?? []) as AvailableStudent[]);
      setChosenStudentId((current) => result.students?.some((student: AvailableStudent) => student.student_id === current) ? current : "");
    } catch (cause) {
      setAssignmentError(cause instanceof Error ? cause.message : "Available students could not be loaded.");
    } finally {
      setAvailableLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadAvailableStudents(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAvailableStudents]);

  async function assignStudent() {
    if (!chosenStudentId || assigning) return;
    setAssigning(true);
    setAssignmentMessage("");
    setAssignmentError("");
    try {
      const response = await fetch("/api/counselor/available-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: chosenStudentId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The student could not be assigned.");
      setAssignmentMessage("Student added to your client list.");
      setChosenStudentId("");
      await Promise.all([onRefresh(), loadAvailableStudents()]);
    } catch (cause) {
      setAssignmentError(cause instanceof Error ? cause.message : "The student could not be assigned.");
      await loadAvailableStudents();
    } finally {
      setAssigning(false);
    }
  }

  return <div>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5475d8]">Counselor workspace</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Clients</h1><p className="mt-2 text-sm text-[#687898]">Only students assigned to you. Mood details require their consent.</p></div><button type="button" onClick={onRefresh} disabled={loading} className="flex min-h-10 items-center gap-2 rounded-lg border border-[#dfe8f7] bg-white px-4 text-sm text-[#506184] hover:bg-[#f5f8ff] disabled:opacity-50"><RefreshCw size={16} /> Refresh</button></div>
    <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-white p-5"><p className="text-sm text-[#687898]">Assigned clients</p><p className="mt-2 text-3xl font-bold">{students.length}</p></div><div className="rounded-2xl bg-white p-5"><p className="text-sm text-[#687898]">Sharing mood</p><p className="mt-2 text-3xl font-bold">{sharing}</p></div><div className="rounded-2xl bg-white p-5"><p className="text-sm text-[#687898]">Not sharing</p><p className="mt-2 text-3xl font-bold">{students.length - sharing}</p></div></div>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section className="mb-5 rounded-2xl bg-white p-5 sm:p-6" aria-labelledby="add-student-title"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf5ff] text-[#3570f6]"><UserRoundPlus size={20} /></span><div><h2 id="add-student-title" className="font-bold">Add an available student</h2><p className="mt-1 text-sm text-[#687898]">Only students without an assigned counselor appear here.</p></div></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="available-student">Choose an available student</label><select id="available-student" value={chosenStudentId} onChange={(event) => setChosenStudentId(event.target.value)} disabled={availableLoading || availableStudents.length === 0 || assigning} className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#dfe8f7] bg-white px-3 text-sm text-[#263454] outline-none focus:border-[#6277ff] focus:ring-2 focus:ring-[#6277ff]/15 disabled:bg-[#f7f9fd]"><option value="">{availableLoading ? "Loading available students…" : availableStudents.length ? "Choose a student" : "No unassigned students available"}</option>{availableStudents.map((student) => <option key={student.student_id} value={student.student_id}>{student.full_name || "Name not set"}{student.student_number ? ` · ${student.student_number}` : ""}</option>)}</select><button type="button" onClick={() => void assignStudent()} disabled={!chosenStudentId || assigning} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5b5cf0] px-5 text-sm font-semibold text-white hover:bg-[#4b4cdf] disabled:cursor-not-allowed disabled:opacity-50">{assigning ? <LoaderCircle size={16} className="animate-spin" /> : <UserRoundPlus size={16} />}{assigning ? "Adding…" : "Add to my clients"}</button></div>{assignmentMessage && <p role="status" className="mt-3 text-sm text-[#18816f]">{assignmentMessage}</p>}{assignmentError && <p role="alert" className="mt-3 text-sm text-red-700">{assignmentError}</p>}</section>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,1fr)]"><section className="min-w-0 rounded-2xl bg-white p-5 sm:p-6" aria-labelledby="client-directory-title"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="client-directory-title" className="text-xl font-extrabold">Client directory</h2><p className="mt-1 text-xs text-[#7887a4]">{filtered.length} shown</p></div><label className="flex min-h-10 items-center gap-2 rounded-lg border border-[#e4ebf7] px-3 text-[#6d7d9d]"><Search size={17} /><span className="sr-only">Search assigned clients</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search clients" className="w-36 bg-transparent text-sm outline-none placeholder:text-[#8996ad]" /></label></div><div className="mt-5 flex gap-2 border-b border-[#edf1f8] pb-4">{([["all", "All"], ["sharing", "Sharing"], ["private", "Not sharing"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${filter === value ? "bg-[#e8efff] text-[#315dd8]" : "text-[#657594] hover:bg-[#f5f8ff]"}`}>{label}</button>)}</div>
      {loading ? <p role="status" className="py-12 text-center text-sm text-[#687898]">Loading clients…</p> : filtered.length === 0 ? <p className="py-12 text-center text-sm text-[#687898]">{students.length ? "No clients match this search." : "No students have been assigned yet."}</p> : <div className="divide-y divide-[#edf1f8]">{filtered.map((student) => <button key={student.student_id} type="button" onClick={() => onSelect(student.student_id)} className={`flex min-h-20 w-full items-center gap-3 rounded-lg px-2 text-left transition hover:bg-[#f8faff] ${selectedId === student.student_id ? "bg-[#f5f8ff]" : ""}`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e7efff] text-sm font-bold text-[#4264ab]">{(student.full_name || "Student").split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{student.full_name || "Name not set"}</strong><span className="block text-xs text-[#7887a4]">{student.student_number || "Assigned student"}</span></span><span className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline ${student.mood_sharing_enabled ? "bg-[#e7f8f3] text-[#18816f]" : "bg-[#f1f3f7] text-[#68758f]"}`}>{student.mood_sharing_enabled ? "Sharing mood" : "Private"}</span><ArrowRight size={16} className="shrink-0 text-[#7f90af]" /></button>)}</div>}</section>
      <section className="min-w-0 rounded-2xl bg-white p-5 sm:p-6" aria-labelledby="client-detail-title"><h2 id="client-detail-title" className="text-xl font-extrabold">Client overview</h2>{!selected ? <p className="mt-6 text-sm text-[#687898]">Select a client to view their shared mood check-ins.</p> : <><div className="mt-6 flex items-center gap-3 border-b border-[#edf1f8] pb-5"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#e7efff] font-bold text-[#4264ab]">{(selected.full_name || "Student").split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><p className="font-bold">{selected.full_name || "Name not set"}</p><p className="text-xs text-[#7887a4]">{selected.student_number || "Assigned student"}</p></div></div>{!selected.mood_sharing_enabled ? <p className="mt-6 rounded-xl bg-[#f5f8ff] p-4 text-sm leading-6 text-[#687898]">This student has not enabled mood sharing. No check-ins are available to you.</p> : <><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#f6f9ff] p-4"><p className="text-xs text-[#687898]">Shared check-ins</p><p className="mt-1 text-2xl font-bold">{checkinCount}</p></div><div className="rounded-xl bg-[#f6f9ff] p-4"><p className="text-xs text-[#687898]">Average mood</p><p className="mt-1 text-2xl font-bold">{average === null ? "—" : `${average.toFixed(1)} / 5`}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-[#637292]">From<input type="date" value={from} max={to} onChange={(event) => onFrom(event.target.value)} className="mt-1 block min-h-10 w-full rounded-lg border border-[#e1e8f4] px-2 text-sm" /></label><label className="text-xs font-semibold text-[#637292]">To<input type="date" value={to} min={from} onChange={(event) => onTo(event.target.value)} className="mt-1 block min-h-10 w-full rounded-lg border border-[#e1e8f4] px-2 text-sm" /></label></div><div className="mt-5"><h3 className="mb-3 text-sm font-bold">Mood over time</h3>{chart}</div></>}</>}<p className="mt-5 flex items-center gap-2 border-t border-[#edf1f8] pt-4 text-xs leading-5 text-[#7887a4]"><ShieldCheck size={16} className="shrink-0" /> Private chats, journals, and deeper check-ins are never shown here.</p></section></div>
  </div>;
}
