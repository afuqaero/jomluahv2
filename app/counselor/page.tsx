"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarRange, ChartSpline, UserRoundCheck } from "lucide-react";
import { SignOut, House, CalendarBlank, UsersThree, ArrowRight } from "@phosphor-icons/react";
import { neon } from "../lib/neonClient";
import { CounselorTrends } from "./counselor-trends";
import { CounselorClients } from "./counselor-clients";
import { CounselorAppointments, type CounselorAppointment } from "./counselor-appointments";

type Student = {
  student_id: string;
  full_name: string | null;
  student_number: string | null;
  mood_sharing_enabled: boolean;
  sharing_since: string | null;
};

type Checkin = { checkin_date: string; period: "morning" | "evening"; mood_score: number; submitted_at: string };

const dayStamp = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const today = new Date();
const initialTo = dayStamp(today);
const initialFrom = dayStamp(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29));

export default function CounselorPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [checkinsKey, setCheckinsKey] = useState("");
  const [todayAppointments, setTodayAppointments] = useState<CounselorAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentError, setAppointmentError] = useState("");
  const [view, setView] = useState<"dashboard" | "clients" | "appointments">("dashboard");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [loadingCheckins, setLoadingCheckins] = useState(false);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    setLoadingRoster(true);
    setError("");
    try {
      const response = await fetch("/api/counselor", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Counselor access could not be verified.");
      const rows = (result.students ?? []) as Student[];
      setStudents(rows);
      setSelectedId((current) => rows.some((student) => student.student_id === current) ? current : rows[0]?.student_id ?? "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Assigned students could not be loaded.");
      setStudents([]);
      setSelectedId("");
    } finally {
      setLoadingRoster(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(loadStudents); }, [loadStudents]);
  useEffect(() => {
    const loadToday = async () => {
      setLoadingAppointments(true);
      setAppointmentError("");
      const from = new Date();
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      try {
        const query = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
        const response = await fetch(`/api/counselor/appointments?${query}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Today’s appointments could not be loaded.");
        setTodayAppointments((result.appointments ?? []) as CounselorAppointment[]);
      } catch (cause) {
        setTodayAppointments([]);
        setAppointmentError(cause instanceof Error ? cause.message : "Today’s appointments could not be loaded.");
      } finally { setLoadingAppointments(false); }
    };
    void loadToday();
  }, [view]);
  const selectedStudent = students.find((student) => student.student_id === selectedId);

  useEffect(() => {
    let cancelled = false;
    const loadCheckins = async () => {
      if (!selectedStudent?.mood_sharing_enabled || !selectedId || from > to) {
        setCheckins([]);
        setCheckinsKey("");
        setLoadingCheckins(false);
        return;
      }
      setCheckins([]);
      setCheckinsKey("");
      setLoadingCheckins(true);
      setError("");
      try {
        const query = new URLSearchParams({ studentId: selectedId, from, to });
        const response = await fetch(`/api/counselor/checkins?${query}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Mood check-ins could not be loaded.");
        if (!cancelled) {
          setCheckins((result.checkins ?? []) as Checkin[]);
          setCheckinsKey(`${selectedId}:${from}:${to}`);
        }
      } catch (loadError) {
        if (!cancelled) {
          setCheckins([]);
          setError(loadError instanceof Error ? loadError.message : "Mood check-ins could not be loaded.");
        }
      } finally {
        if (!cancelled) setLoadingCheckins(false);
      }
    };
    void loadCheckins();
    return () => { cancelled = true; };
  }, [selectedId, selectedStudent?.mood_sharing_enabled, from, to]);

  const visibleCheckins = checkinsKey === `${selectedId}:${from}:${to}` && selectedStudent?.mood_sharing_enabled ? checkins : [];
  const average = visibleCheckins.length ? visibleCheckins.reduce((total, row) => total + row.mood_score, 0) / visibleCheckins.length : null;
  const signOut = async () => { await neon.auth.signOut(); router.replace("/counselor/login"); };

  return (
    <main className="min-h-screen bg-[#fafdff] font-sans text-[#101936]">
      <div className="min-h-screen w-full bg-[#fafdff]">
        <header className="sticky top-0 z-20 border-b border-[#e6eef9] bg-[#fafdff]/95 backdrop-blur-sm">
          <div className="flex w-full flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-3 sm:px-8 lg:px-10">
            <Link href="/counselor" className="shrink-0 text-[24px] font-extrabold tracking-[-0.06em] text-[#101936]"><span className="mr-2 text-[#5068f7]">◇</span>JomLuah</Link>
            <nav aria-label="Counselor pages" className="order-3 flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:w-auto sm:overflow-visible">
              {([[House, "Dashboard", "dashboard"], [CalendarBlank, "Appointments", "appointments"], [UsersThree, "Clients", "clients"]] as const).map(([Icon, label, target]) => (
                <button key={label} type="button" aria-pressed={target === view} onClick={() => setView(target)} className={`flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-2.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-[#4269ff] sm:flex-none sm:px-4 sm:text-sm ${target === view ? "bg-[#eaf1ff] text-[#295cf2]" : "text-[#526184] hover:bg-[#f4f7ff]"}`}><Icon size={19} weight={target === view ? "fill" : "regular"} />{label}</button>
              ))}
            </nav>
            <button type="button" onClick={signOut} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-[#526184] transition hover:bg-[#f4f7ff] hover:text-[#295cf2] sm:gap-2 sm:px-3 sm:text-sm"><SignOut size={18} /> Sign out</button>
          </div>
        </header>
        <div className="min-w-0 px-4 py-6 sm:px-8 lg:px-10">
          {view === "dashboard" ? <>
            {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            <div className="mb-7 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">Counselor overview</h1><p className="mt-2 text-[#667498]">Assigned students and scheduled sessions. Private conversations remain private.</p></div><time className="pt-2 text-sm text-[#667498]">{new Date().toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</time></div>
            <div className="grid gap-4 sm:grid-cols-3">{([[CalendarRange, "Today’s sessions", loadingAppointments ? "—" : String(todayAppointments.length), "text-[#4269f4]"], [UserRoundCheck, "Assigned clients", loadingRoster ? "—" : String(students.length), "text-[#05aebb]"], [ChartSpline, "Sharing mood", loadingRoster ? "—" : String(students.filter((student) => student.mood_sharing_enabled).length), "text-[#9a65e7]"]] as const).map(([Icon, label, value, color]) => <div key={label} className="flex min-h-[150px] items-start gap-5 rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(50,80,130,0.04)]"><Icon aria-hidden="true" size={39} strokeWidth={1.7} className={`mt-1 shrink-0 ${color}`} /><div><p className="text-sm text-[#586789]">{label}</p><p className="mt-1 text-4xl font-extrabold">{value}</p></div></div>)}</div>
            <CounselorTrends />
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
              <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(50,80,130,0.04)]">
                <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-extrabold">Today’s schedule</h2><button type="button" onClick={() => setView("appointments")} className="text-sm font-semibold text-[#315ef1]">View calendar</button></div>
                {appointmentError ? <p role="alert" className="mt-6 text-sm text-red-700">{appointmentError}</p> : loadingAppointments ? <p role="status" className="mt-6 text-sm text-[#667498]">Loading sessions…</p> : todayAppointments.length === 0 ? <p className="mt-6 rounded-xl bg-[#f6f9ff] p-5 text-sm text-[#667498]">No appointments scheduled today</p> : <div className="mt-5 divide-y divide-[#edf1f8]">{todayAppointments.map((appointment) => <div key={appointment.id} className="flex items-center gap-4 py-4"><time className="w-24 shrink-0 text-sm tabular-nums text-[#627295]">{new Date(appointment.starts_at).toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" })}</time><div><p className="font-semibold">{appointment.student_name || "Student"}</p><p className="text-sm text-[#667498]">{appointment.kind === "follow_up" ? "Follow-up" : appointment.kind === "initial" ? "Initial consultation" : "Individual session"}</p></div></div>)}</div>}
              </section>
              <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(50,80,130,0.04)]"><h2 className="text-xl font-extrabold">Quick actions</h2><button type="button" onClick={() => setView("clients")} className="mt-6 flex min-h-20 w-full items-center gap-4 rounded-xl bg-[#edf5ff] p-4 text-left"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#dcecff] text-[#3570f6]"><UsersThree size={27} /></span><span><strong className="block">Client profiles</strong><span className="text-sm text-[#667498]">View assigned students’ shared moods</span></span><ArrowRight className="ml-auto text-[#3570f6]" /></button><button type="button" onClick={() => setView("appointments")} className="mt-3 min-h-11 text-sm font-semibold text-[#315ef1]">Manage appointments →</button></section>
            </div>
          </> : view === "appointments" ? <CounselorAppointments students={students} /> : <CounselorClients students={students} selectedId={selectedId} onSelect={setSelectedId} search={search} onSearch={setSearch} loading={loadingRoster} error={error} onRefresh={loadStudents} from={from} to={to} onFrom={setFrom} onTo={setTo} checkinCount={visibleCheckins.length} average={average} chart={loadingCheckins || checkinsKey !== `${selectedId}:${from}:${to}` && selectedStudent?.mood_sharing_enabled ? <p role="status" className="text-sm text-[#687898]">Loading check-ins…</p> : visibleCheckins.length ? <MoodChart checkins={visibleCheckins} /> : <p className="rounded-lg bg-[#f5f8ff] p-4 text-sm text-[#687898]">No shared check-ins in this period.</p>} />}
        </div>
      </div>
    </main>
  );
}

function MoodChart({ checkins }: { checkins: Checkin[] }) {
  const rows = [...checkins].sort((a, b) => `${a.checkin_date}-${a.period}`.localeCompare(`${b.checkin_date}-${b.period}`));
  const width = 900;
  const height = 240;
  const paddingX = 32;
  const paddingY = 28;
  const x = (index: number) => rows.length === 1 ? width / 2 : paddingX + (index / (rows.length - 1)) * (width - paddingX * 2);
  const y = (score: number) => height - paddingY - ((score - 1) / 4) * (height - paddingY * 2);
  const path = rows.map((row, index) => `${index ? "L" : "M"}${x(index)},${y(row.mood_score)}`).join(" ");
  return <div className="rounded-xl bg-[#fafbff] p-3"><svg role="img" aria-label="Mood scores over time, from one to five" viewBox={`0 0 ${width} ${height}`} className="h-48 w-full">
    {[1, 2, 3, 4, 5].map((score) => <g key={score}><line x1={paddingX} x2={width - paddingX} y1={y(score)} y2={y(score)} stroke="#e5e8f3" strokeDasharray="4 5" /><text x="4" y={y(score) + 4} fill="#747b95" fontSize="12">{score}</text></g>)}
    <path d={path} fill="none" stroke="#b6b6f8" strokeWidth="2" />
    {rows.map((row, index) => <circle key={`${row.checkin_date}-${row.period}`} cx={x(index)} cy={y(row.mood_score)} r="6" fill={row.period === "morning" ? "#6366F1" : "#53a9c4"}><title>{row.checkin_date} {row.period}: {row.mood_score} out of 5</title></circle>)}
    <text x={paddingX} y={height - 4} fill="#747b95" fontSize="11">{rows[0]?.checkin_date}</text><text x={width - paddingX} y={height - 4} textAnchor="end" fill="#747b95" fontSize="11">{rows[rows.length - 1]?.checkin_date}</text>
  </svg></div>;
}
