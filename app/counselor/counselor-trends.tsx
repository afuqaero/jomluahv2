"use client";

import { useEffect, useState } from "react";
import { ChartNoAxesCombined, Smile, UsersRound } from "lucide-react";

type Month = { month: string; label: string; averageMood: number | null; checkinCount: number };
type Trends = { months: Month[]; improvingClients: number; clientsWithData: number };

function linePath(values: (number | null)[], max: number, width: number, height: number) {
  const step = width / Math.max(values.length - 1, 1);
  let path = "";
  let previous: { x: number; y: number } | null = null;
  values.forEach((value, index) => {
    if (value === null) { previous = null; return; }
    const x = index * step;
    const y = height - (value / max) * height;
    if (previous) {
      const middle = (previous.x + x) / 2;
      path += ` C ${middle} ${previous.y}, ${middle} ${y}, ${x} ${y}`;
    } else path += ` M ${x} ${y}`;
    previous = { x, y };
  });
  return path;
}

export function CounselorTrends() {
  const [range, setRange] = useState(6);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch(`/api/counselor/trends?months=${range}`, { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Mood trends could not be loaded.");
        setTrends(data as Trends);
        setError("");
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Mood trends could not be loaded.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    };
    void load();
    return () => controller.abort();
  }, [range]);

  const shown = trends;
  const months = shown?.months ?? [];
  const moodValues = months.map((month) => month.averageMood);
  const countValues = months.map((month) => month.checkinCount);
  const maxCount = Math.max(1, ...countValues);
  const first = moodValues.find((value) => value !== null);
  const last = [...moodValues].reverse().find((value) => value !== null);
  const moodChange = moodValues.filter((value) => value !== null).length >= 2 && first !== undefined && last !== undefined ? `${last! - first! > 0 ? "+" : ""}${last! - first!} pts` : "—";
  const width = 600;
  const height = 164;

  return <section className="mt-5 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(50,80,130,0.04)] sm:p-6" aria-labelledby="client-trends-title">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="client-trends-title" className="text-xl font-extrabold">Client mood trends</h2><p className="mt-1 text-xs text-[#6a7899]">Only assigned students’ consented morning and evening check-ins</p></div><label className="text-xs text-[#6a7899]"><span className="sr-only">Trend date range</span><select value={range} onChange={(event) => { setRange(Number(event.target.value)); setLoading(true); }} className="min-h-10 rounded-lg border border-[#e4ebf7] bg-white px-3 text-sm text-[#3d507b] focus-visible:outline-2 focus-visible:outline-[#4269f4]"><option value={3}>Last 3 months</option><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option></select></label></div>
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    {loading ? <p role="status" className="py-20 text-center text-sm text-[#6a7899]">Loading shared mood trends…</p> : !months.some((month) => month.checkinCount) ? <p className="py-20 text-center text-sm text-[#6a7899]">No shared mood check-ins in this period.</p> : <>
      <div className="mt-6 overflow-x-auto"><div className="min-w-[560px]"><div className="flex"><div className="flex h-[196px] w-9 shrink-0 flex-col justify-between pb-5 text-[11px] text-[#7181a3]"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><svg viewBox={`-8 -8 ${width + 16} ${height + 35}`} role="img" aria-label={`Average mood percentage and shared check-in count by month: ${months.map((month) => `${month.label} ${month.averageMood ?? "no mood data"} percent, ${month.checkinCount} check-ins`).join("; ")}`} className="h-[196px] w-full overflow-visible">
        {[0, 25, 50, 75, 100].map((tick) => <line key={tick} x1="0" x2={width} y1={height - tick / 100 * height} y2={height - tick / 100 * height} stroke="#e6edf7" strokeDasharray={tick === 0 ? undefined : "3 4"} />)}
        {months.map((month, index) => <g key={month.month}><line x1={index * width / Math.max(months.length - 1, 1)} x2={index * width / Math.max(months.length - 1, 1)} y1="0" y2={height} stroke="#f0f4fa" /><text x={index * width / Math.max(months.length - 1, 1)} y={height + 25} textAnchor="middle" fill="#7181a3" fontSize="12">{month.label}</text></g>)}
        <path d={linePath(moodValues, 100, width, height)} fill="none" stroke="#416fff" strokeWidth="2.5" />
        <path d={linePath(countValues, maxCount * 1.4, width, height)} fill="none" stroke="#00bcd4" strokeWidth="2" />
        {months.map((month, index) => <g key={month.month}>{month.averageMood !== null && <circle cx={index * width / Math.max(months.length - 1, 1)} cy={height - month.averageMood / 100 * height} r="4.5" fill="#416fff" stroke="white" strokeWidth="2" />}<circle cx={index * width / Math.max(months.length - 1, 1)} cy={height - month.checkinCount / (maxCount * 1.4) * height} r="4" fill="#00bcd4" stroke="white" strokeWidth="2" /></g>)}
      </svg></div></div></div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-7 gap-y-2 text-xs text-[#687898]"><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#416fff]" />Average mood (0–100)</span><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#00bcd4]" />Shared check-ins (own scale)</span></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="flex items-center gap-3 rounded-xl border border-[#edf1f8] p-3"><Smile className="text-[#17baa9]" size={25} /><div><strong className="block text-lg">{moodChange}</strong><span className="text-xs text-[#6a7899]">Mood change, first to last</span></div></div><div className="flex items-center gap-3 rounded-xl border border-[#edf1f8] p-3"><UsersRound className="text-[#416fff]" size={25} /><div><strong className="block text-lg">{shown?.improvingClients ?? 0} / {shown?.clientsWithData ?? 0}</strong><span className="text-xs text-[#6a7899]">Clients with higher monthly mood</span></div></div><div className="flex items-center gap-3 rounded-xl border border-[#edf1f8] p-3"><ChartNoAxesCombined className="text-[#e6a824]" size={25} /><div><strong className="block text-lg">{countValues.reduce((sum, count) => sum + count, 0)}</strong><span className="text-xs text-[#6a7899]">Shared check-ins</span></div></div></div>
    </>}
  </section>;
}
