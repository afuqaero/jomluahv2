"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Clock3, Video } from "lucide-react";
import { googleCalendarEventUrl } from "./google-calendar";

export type CounselorAppointment = {
  id: string;
  student_id: string;
  student_name: string | null;
  starts_at: string;
  ends_at: string;
  kind: "individual" | "follow_up" | "initial";
  status: "scheduled";
};

type Student = { student_id: string; full_name: string | null };
const kindLabels = { individual: "Individual session", follow_up: "Follow-up", initial: "Initial consultation" };
const kindStyles = {
  individual: "border-[#563bfa] bg-[#efecff] text-[#291b80] hover:bg-[#e7e2ff]",
  follow_up: "border-[#13b2b7] bg-[#e5f8f7] text-[#075d65] hover:bg-[#d8f2f0]",
  initial: "border-[#eba741] bg-[#fff4df] text-[#78501a] hover:bg-[#ffebc8]",
};

function weekStart(offset: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (date.getDay() + 6) % 7 + offset * 7);
  return date;
}

export function CounselorAppointments({ students }: { students: Student[] }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState<CounselorAppointment[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [kind, setKind] = useState<CounselorAppointment["kind"]>("individual");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  const start = weekStart(weekOffset);
  const days = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
  const selected = appointments.find((item) => item.id === selectedId);
  const dateLabel = `${days[0].toLocaleDateString("en-MY", { day: "numeric", month: "short" })} – ${days[4].toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}`;

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      const from = weekStart(weekOffset);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);
      try {
        const query = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
        const response = await fetch(`/api/counselor/appointments?${query}`, { cache: "no-store", signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Appointments could not be loaded.");
        if (!controller.signal.aborted) {
          const rows = (result.appointments ?? []) as CounselorAppointment[];
          setAppointments(rows);
          setSelectedId((current) => rows.some((item) => item.id === current) ? current : rows[0]?.id ?? "");
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setAppointments([]);
          setError(cause instanceof Error ? cause.message : "Appointments could not be loaded.");
        }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    };
    void load();
    return () => controller.abort();
  }, [weekOffset, revision]);

  const createAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startsAt || !studentId) return;
    setSaving(true);
    setError("");
    try {
      const startTime = new Date(startsAt);
      const response = await fetch("/api/counselor/appointments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, startsAt: startTime.toISOString(), endsAt: new Date(startTime.getTime() + 50 * 60_000).toISOString(), kind }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Appointment could not be created.");
      setShowForm(false);
      setStartsAt("");
      const appointmentWeek = new Date(startTime);
      appointmentWeek.setHours(0, 0, 0, 0);
      appointmentWeek.setDate(appointmentWeek.getDate() - (appointmentWeek.getDay() + 6) % 7);
      const offset = Math.round((appointmentWeek.getTime() - weekStart(0).getTime()) / (7 * 24 * 60 * 60_000));
      setWeekOffset(offset);
      setRevision((current) => current + 1);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Appointment could not be created."); }
    finally { setSaving(false); }
  };

  const cancelAppointment = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/counselor/appointments", {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id }),
      });
      const result = await response.json();
      if (!response.ok || !result.cancelled) throw new Error(result.error || "Appointment could not be cancelled.");
      setRevision((current) => current + 1);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Appointment could not be cancelled."); }
    finally { setSaving(false); }
  };

  return <div className="text-[#171c3c]">
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Appointments</h1><p className="mt-2 text-sm text-[#5e6a87]">Sessions with students assigned to you</p></div>
      <button type="button" onClick={() => setShowForm((current) => !current)} disabled={!students.length} className="min-h-11 rounded-lg bg-[#563bfa] px-4 text-sm font-semibold text-white hover:bg-[#4430d2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#563bfa] disabled:opacity-50">{showForm ? "Close" : "New appointment"}</button>
    </header>
    {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {showForm && <form onSubmit={createAppointment} className="mb-6 grid gap-4 rounded-2xl border border-[#ded9fb] bg-[#faf9ff] p-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <label className="text-sm font-medium">Student<select required value={studentId} onChange={(event) => setStudentId(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-[#d7d9e8] bg-white px-3"><option value="">Choose a student</option>{students.map((student) => <option key={student.student_id} value={student.student_id}>{student.full_name || "Name not set"}</option>)}</select></label>
      <label className="text-sm font-medium">Start time<input required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-[#d7d9e8] bg-white px-3" /></label>
      <label className="text-sm font-medium">Session type<select value={kind} onChange={(event) => setKind(event.target.value as CounselorAppointment["kind"])} className="mt-2 block min-h-11 w-full rounded-lg border border-[#d7d9e8] bg-white px-3"><option value="individual">Individual</option><option value="follow_up">Follow-up</option><option value="initial">Initial consultation</option></select></label>
      <button type="submit" disabled={saving} className="min-h-11 rounded-lg bg-[#3021aa] px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save session"}</button>
    </form>}

    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-[#e1e6f2] border-l-[3px] border-l-[#563bfa] bg-white p-5"><p className="text-sm text-[#626c87]">Scheduled this week</p><p className="mt-2 text-3xl font-semibold tabular-nums text-[#3021aa]">{loading ? "—" : appointments.length}</p></div>
      <div className="rounded-2xl border border-[#e1e6f2] bg-white p-5"><p className="text-sm text-[#626c87]">Next session</p><p className="mt-2 text-lg font-semibold">{appointments.find((item) => new Date(item.starts_at) > new Date())?.student_name || "None scheduled"}</p></div>
      <div className="rounded-2xl border border-[#e1e6f2] bg-white p-5"><p className="text-sm text-[#626c87]">Week</p><p className="mt-3 text-sm font-medium text-[#596581]">{dateLabel}</p></div>
    </div>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(280px,0.8fr)]">
      <section aria-labelledby="weekly-schedule-title" className="min-w-0 rounded-2xl border border-[#e1e6f2] bg-white p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 id="weekly-schedule-title" className="text-xl font-semibold">Weekly schedule</h2><p className="mt-1 text-sm text-[#65708c]">{dateLabel}</p></div><div className="flex items-center gap-1.5"><button type="button" aria-label="Previous week" onClick={() => setWeekOffset((value) => value - 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-[#dfe5f0]"><ChevronLeft size={18} /></button><button type="button" onClick={() => setWeekOffset(0)} className="h-10 rounded-lg border border-[#dfe5f0] px-4 text-sm">Today</button><button type="button" aria-label="Next week" onClick={() => setWeekOffset((value) => value + 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-[#dfe5f0]"><ChevronRight size={18} /></button></div></div>
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#69738e]"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#563bfa]" />Individual</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#13b2b7]" />Follow-up</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#eba741]" />Initial</span></div>
        <div className="overflow-x-auto rounded-xl border border-[#e8ecf5]"><div className="min-w-[560px]"><div className="grid grid-cols-[72px_repeat(5,minmax(0,1fr))] border-b border-[#e8ecf5] bg-[#f8f9fd]"><div />{days.map((day) => <div key={day.toISOString()} className={`py-3 text-center ${day.toDateString() === new Date().toDateString() ? "bg-[#f0edff] text-[#3522ab]" : ""}`}><span className="block text-xs text-[#6b7592]">{day.toLocaleDateString("en-MY", { weekday: "short" })}</span><span className="text-sm font-semibold tabular-nums">{day.getDate()}</span></div>)}</div>
          {Array.from({ length: 10 }, (_, index) => index + 8).map((hour) => <div key={hour} className="grid min-h-[68px] grid-cols-[72px_repeat(5,minmax(0,1fr))] border-b border-[#edf0f7] last:border-b-0"><span className="pt-4 pl-2 text-xs tabular-nums text-[#78839c]">{hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}</span>{days.map((day) => { const events = appointments.filter((item) => { const date = new Date(item.starts_at); return date.toDateString() === day.toDateString() && date.getHours() === hour; }); return <div key={day.toISOString()} className={`border-l border-[#edf0f7] p-1 ${day.toDateString() === new Date().toDateString() ? "bg-[#faf9ff]" : ""}`}>{events.map((appointment) => <button key={appointment.id} type="button" onClick={() => setSelectedId(appointment.id)} aria-pressed={selectedId === appointment.id} className={`mb-1 min-h-[56px] w-full rounded-md border-l-[3px] px-2 py-1.5 text-left text-xs focus-visible:outline-2 focus-visible:outline-[#563bfa] ${kindStyles[appointment.kind]} ${selectedId === appointment.id ? "ring-1 ring-[#b6aff3]" : ""}`}><strong className="block truncate font-semibold">{appointment.student_name || "Student"}</strong><span className="block truncate">{kindLabels[appointment.kind]}</span></button>)}</div>; })}</div>)}
        </div></div>{!loading && !appointments.length && <p className="mt-4 text-sm text-[#64708c]">No appointments this week</p>}</section>
      <aside className="self-start rounded-2xl border border-[#e1e6f2] bg-white p-5 sm:p-6"><h2 className="text-xl font-semibold">Session details</h2>{selected ? <div className="mt-6"><div className="rounded-xl border-l-[3px] border-l-[#563bfa] bg-[#f3f0ff] px-4 py-4"><p className="text-base font-semibold text-[#28206a]">{selected.student_name || "Student"}</p><p className="mt-1 text-sm text-[#514b82]">{kindLabels[selected.kind]}</p></div><div className="mt-6 space-y-4 text-sm text-[#485579]"><p className="flex items-start gap-3"><CalendarDays size={17} className="mt-0.5 shrink-0" /> {new Date(selected.starts_at).toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" })}</p><p className="flex items-start gap-3"><Clock3 size={17} className="mt-0.5 shrink-0" /> {new Date(selected.starts_at).toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" })} – {new Date(selected.ends_at).toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" })}</p><p className="flex items-start gap-3"><Video size={17} className="mt-0.5 shrink-0" /> Session scheduling only; no meeting link</p></div><a href={googleCalendarEventUrl(selected)} target="_blank" rel="noopener noreferrer" className="mt-6 flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#edf0ff] px-4 text-sm font-semibold text-[#3021aa] hover:bg-[#e3e7ff]"><CalendarPlus size={17} /> Add to Google Calendar</a><p className="mt-2 text-xs leading-5 text-[#65708c]">Opens a private event for you to save. Changes here will not update it automatically.</p><button type="button" onClick={() => void cancelAppointment()} disabled={saving} className="mt-5 min-h-10 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50">Cancel appointment</button></div> : <p className="mt-6 text-sm leading-6 text-[#65708c]">{loading ? "Loading appointments…" : "Select a session in the calendar to see its details."}</p>}</aside>
    </div>
  </div>;
}
