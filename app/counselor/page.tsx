"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ShieldAlert, CheckCircle, Search, UserCheck } from "lucide-react";

export default function CounselorDashboard() {
  const intakes = [
    { name: "Ali Bin Abu", metric: "CI220000", date: "12 June 2026", distortion: "Catastrophizing", risk: "Low", status: "Verified" },
    { name: "Siti Aminah", metric: "CI220112", date: "11 June 2026", distortion: "All-or-Nothing", risk: "Medium", status: "Flagged" },
    { name: "Ahmad Razak", metric: "CI220054", date: "10 June 2026", distortion: "Emotional Reasoning", risk: "High", status: "Emergency" }
  ];

  return (
    <div className="min-h-screen bg-white text-black font-mono border-4 md:border-8 border-black p-4 md:p-6 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b-4 border-black pb-6 flex justify-between items-center">
        <div>
          <span className="text-xs border border-black px-2 py-0.5 uppercase bg-neutral-100 font-bold">
            [ Counselor Administrative Hub ]
          </span>
          <h1 className="text-3xl font-black uppercase mt-1">PCU Counselor Hub</h1>
        </div>
        <Link href="/" className="border-2 border-black p-2 hover:bg-neutral-100 transition flex items-center gap-2 text-xs font-bold uppercase">
          <ArrowLeft className="w-4 h-4" /> Exit Portal
        </Link>
      </header>

      {/* Main Body */}
      <main className="my-8 flex-grow space-y-6">
        {/* Statistics highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-4 border-black p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Total Assigned Intakes</h3>
            <p className="text-3xl font-black">12</p>
          </div>
          <div className="border-4 border-black p-4 space-y-2 bg-neutral-50">
            <h3 className="text-xs font-bold uppercase text-neutral-500">CBT Distortion Flagged</h3>
            <p className="text-3xl font-black">04</p>
          </div>
          <div className="border-4 border-black p-4 space-y-2 border-dashed">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Crisis Risk Referrals</h3>
            <p className="text-3xl font-black text-neutral-800">01</p>
          </div>
        </section>

        {/* Intakes List */}
        <section className="border-4 border-black p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold uppercase">// Student Intake Queue</h2>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search metric or name..."
                className="w-full border-2 border-black p-2 pl-10 focus:bg-neutral-50 outline-none text-xs bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-2 border-black text-left text-xs">
              <thead className="bg-neutral-100 border-b-2 border-black">
                <tr>
                  <th className="p-3 border-r-2 border-black font-bold uppercase">Student Name</th>
                  <th className="p-3 border-r-2 border-black font-bold uppercase">Metric ID</th>
                  <th className="p-3 border-r-2 border-black font-bold uppercase">Intake Date</th>
                  <th className="p-3 border-r-2 border-black font-bold uppercase">Primary Distortion</th>
                  <th className="p-3 border-r-2 border-black font-bold uppercase">Risk Level</th>
                  <th className="p-3 font-bold uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {intakes.map((int, idx) => (
                  <tr key={idx} className="border-b-2 border-black hover:bg-neutral-50 last:border-b-0">
                    <td className="p-3 border-r-2 border-black font-bold">{int.name}</td>
                    <td className="p-3 border-r-2 border-black">{int.metric}</td>
                    <td className="p-3 border-r-2 border-black">{int.date}</td>
                    <td className="p-3 border-r-2 border-black font-bold text-neutral-700">{int.distortion}</td>
                    <td className="p-3 border-r-2 border-black">
                      <span className={`border px-1.5 py-0.5 font-bold uppercase ${
                        int.risk === "High" ? "bg-black text-white" : "bg-neutral-100 text-black"
                      }`}>
                        {int.risk}
                      </span>
                    </td>
                    <td className="p-3 flex items-center gap-1 font-bold">
                      {int.status === "Verified" && <CheckCircle className="w-4 h-4" />}
                      {int.status === "Flagged" && <ShieldAlert className="w-4 h-4" />}
                      {int.status === "Emergency" && <ShieldAlert className="w-4 h-4" />}
                      {int.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black pt-4 text-xs text-neutral-500 flex justify-between">
        <span>Logged in as counselor@uthm.edu.my</span>
        <span>JomLuah Administrative Dashboard</span>
      </footer>
    </div>
  );
}
