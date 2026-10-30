"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowClockwise, SignOut, ShieldCheck } from "@phosphor-icons/react";
import { neon } from "../lib/neonClient";

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
const scoreText = ["", "Very low", "Low", "Steady", "Good", "Very good"];

export default function CounselorPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [checkins, setCheckins] = useState<Checkin[]>([]);
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
  const selectedStudent = students.find((student) => student.student_id === selectedId);

  useEffect(() => {
    let cancelled = false;
    const loadCheckins = async () => {
      if (!selectedStudent?.mood_sharing_enabled || !selectedId || from > to) {
        setCheckins([]);
        return;
      }
      setLoadingCheckins(true);
      setError("");
      try {
        const query = new URLSearchParams({ studentId: selectedId, from, to });
        const response = await fetch(`/api/counselor/checkins?${query}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Mood check-ins could not be loaded.");
        if (!cancelled) setCheckins((result.checkins ?? []) as Checkin[]);
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

  const average = useMemo(() => checkins.length ? checkins.reduce((total, row) => total + row.mood_score, 0) / checkins.length : null, [checkins]);
  const signOut = async () => { await neon.auth.signOut(); router.replace("/login"); };
  const buttonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dce1f1] bg-white px-4 py-2 text-sm font-semibold text-[#393b64] hover:bg-[#f7f7ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4F46E5] disabled:opacity-50";

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f7f8ff_0%,#edf2ff_52%,#f7f8ff_100%)] text-[#1c1a48]">
      <header className="border-b border-[#dce2f3] bg-white/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-[#201d56]">JomLuah <span className="ml-2 text-xs font-semibold text-[#6b7190]">COUNSELOR</span></Link>
          <button type="button" onClick={signOut} className={buttonClass}><SignOut aria-hidden="true" size={17} /> Sign out</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">Assigned students · mood only</p><h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Mood check-ins</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#59617e]">View morning and evening mood scores only when a student has explicitly enabled sharing. Journals, chats, notes, and deeper check-ins stay private.</p></div>
          <button type="button" onClick={() => void loadStudents()} disabled={loadingRoster} className={buttonClass}><ArrowClockwise aria-hidden="true" size={17} /> Refresh students</button>
        </div>

        {error && <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
        {loadingRoster ? <div role="status" className="rounded-2xl border border-[#dfe4f2] bg-white p-8 text-sm text-[#59617e]">Loading assigned students…</div> : students.length === 0 ? (
          <section className="rounded-2xl border border-[#dfe4f2] bg-white p-8"><h2 className="font-bold">No assigned students yet</h2><p className="mt-2 text-sm text-[#59617e]">An administrator needs to assign students to your counselor account.</p></section>
        ) : (
          <>
            <section className="mb-5 rounded-2xl border border-[#dfe4f2] bg-white p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-[minmax(220px,1fr)_180px_180px] md:items-end">
                <div><label htmlFor="student-choice" className="mb-1.5 block text-sm font-semibold">Assigned student</label><select id="student-choice" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="min-h-11 w-full rounded-xl border border-[#d5daeb] bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]">{students.map((student) => <option key={student.student_id} value={student.student_id}>{student.full_name || "Name not set"}{student.student_number ? ` · ${student.student_number}` : ""}</option>)}</select></div>
                <div><label htmlFor="range-from" className="mb-1.5 block text-sm font-semibold">From</label><input id="range-from" type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="min-h-11 w-full rounded-xl border border-[#d5daeb] bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]" /></div>
                <div><label htmlFor="range-to" className="mb-1.5 block text-sm font-semibold">To</label><input id="range-to" type="date" value={to} min={from} max={initialTo} onChange={(event) => setTo(event.target.value)} className="min-h-11 w-full rounded-xl border border-[#d5daeb] bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]" /></div>
              </div>
            </section>

            {!selectedStudent?.mood_sharing_enabled ? (
              <section className="rounded-2xl border border-[#dfe4f2] bg-white p-8"><h2 className="font-bold">Mood sharing is off</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#59617e]">This student has not enabled mood sharing. Their scores are not available to you; private journal and chat data are never shown here.</p></section>
            ) : (
              <>
                <section className="mb-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#dfe4f2] bg-white p-5"><p className="text-sm font-medium text-[#69708c]">Check-ins in selected range</p><p className="mt-2 text-3xl font-extrabold">{checkins.length}</p></div>
                  <div className="rounded-2xl border border-[#dfe4f2] bg-white p-5"><p className="text-sm font-medium text-[#69708c]">Average mood score</p><p className="mt-2 text-3xl font-extrabold">{average === null ? "—" : `${average.toFixed(1)} / 5`}</p></div>
                </section>
                <section className="rounded-2xl border border-[#dfe4f2] bg-white p-5 md:p-6">
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold">Mood over time</h2><p className="mt-1 text-xs text-[#69708c]">Scores are student-entered check-ins, not AI analysis of private conversations.</p></div><div className="flex items-center gap-2 text-xs text-[#68708b]"><span className="h-2.5 w-2.5 rounded-full bg-[#6366F1]" />Morning <span className="ml-2 h-2.5 w-2.5 rounded-full bg-[#53a9c4]" />Evening</div></div>
                  {loadingCheckins ? <div role="status" className="py-14 text-center text-sm text-[#68708b]">Loading mood check-ins…</div> : checkins.length === 0 ? <div className="rounded-xl border border-dashed border-[#d8deef] bg-[#fafbff] px-5 py-10 text-center"><p className="font-semibold">No shared check-ins in this range</p><p className="mt-1 text-sm text-[#68708b]">The chart will appear when the student submits morning or evening scores after enabling sharing.</p></div> : <MoodChart checkins={checkins} />}
                  {checkins.length > 0 && <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[420px] border-collapse text-left text-sm"><thead><tr className="border-b border-[#e8eaf3] text-xs uppercase tracking-wide text-[#727895]"><th className="py-3 pr-4">Date</th><th className="py-3 pr-4">Period</th><th className="py-3">Mood score</th></tr></thead><tbody>{checkins.map((row) => <tr key={`${row.checkin_date}-${row.period}`} className="border-b border-[#f0f1f7] last:border-0"><td className="py-3 pr-4">{new Date(`${row.checkin_date}T12:00:00`).toLocaleDateString()}</td><td className="py-3 pr-4 capitalize">{row.period}</td><td className="py-3">{row.mood_score} / 5 · {scoreText[row.mood_score]}</td></tr>)}</tbody></table></div>}
                </section>
              </>
            )}
          </>
        )}
        <div className="mt-5 flex items-center gap-2 text-xs text-[#68708b]"><ShieldCheck aria-hidden="true" size={16} className="text-[#4f6cad]" /> Access is limited to assigned students with active mood-sharing consent.</div>
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
  return <div className="overflow-x-auto rounded-xl bg-[#fafbff] p-3"><svg role="img" aria-label="Mood scores over time, from one to five" viewBox={`0 0 ${width} ${height}`} className="h-56 min-w-[620px] w-full">
    {[1, 2, 3, 4, 5].map((score) => <g key={score}><line x1={paddingX} x2={width - paddingX} y1={y(score)} y2={y(score)} stroke="#e5e8f3" strokeDasharray="4 5" /><text x="4" y={y(score) + 4} fill="#747b95" fontSize="12">{score}</text></g>)}
    <path d={path} fill="none" stroke="#b6b6f8" strokeWidth="2" />
    {rows.map((row, index) => <circle key={`${row.checkin_date}-${row.period}`} cx={x(index)} cy={y(row.mood_score)} r="6" fill={row.period === "morning" ? "#6366F1" : "#53a9c4"}><title>{row.checkin_date} {row.period}: {row.mood_score} out of 5</title></circle>)}
    <text x={paddingX} y={height - 4} fill="#747b95" fontSize="11">{rows[0]?.checkin_date}</text><text x={width - paddingX} y={height - 4} textAnchor="end" fill="#747b95" fontSize="11">{rows[rows.length - 1]?.checkin_date}</text>
  </svg></div>;
}
