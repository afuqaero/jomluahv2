"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Smile, Image, Calendar, AlertTriangle } from "lucide-react";

export default function JournalPage() {
  const [mood, setMood] = useState<number>(3); // 1-5 Scale
  const moods = [
    { score: 1, label: "Awful" },
    { score: 2, label: "Stressed" },
    { score: 3, label: "Okay" },
    { score: 4, label: "Good" },
    { score: 5, label: "Happy" }
  ];

  return (
    <div className="min-h-screen bg-white text-black font-mono border-4 md:border-8 border-black p-4 md:p-6 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b-4 border-black pb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="border-2 border-black p-2 hover:bg-neutral-100 transition flex items-center gap-1 text-xs font-bold uppercase">
            <ArrowLeft className="w-4 h-4" /> Hub
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase">[ Private Journal ]</h1>
            <p className="text-[10px] text-neutral-600">// Secure client side encryption // RLS restricted</p>
          </div>
        </div>
        <div>
          <button className="border-4 border-black bg-black text-white px-4 py-2 hover:bg-white hover:text-black transition flex items-center gap-2 text-xs font-bold uppercase">
            <Save className="w-4 h-4" /> Save Entry
          </button>
        </div>
      </header>

      {/* Main Journal Workspace */}
      <main className="my-6 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Area */}
        <section className="lg:col-span-2 border-4 border-black p-6 space-y-6">
          <div className="flex items-center gap-2 text-xs border-b border-black pb-4">
            <Calendar className="w-4 h-4" />
            <span className="font-bold uppercase">DATE: 13 JUNE 2026 (SATURDAY)</span>
            <span className="ml-auto text-neutral-500">// Draft auto-saved locally</span>
          </div>

          {/* Title input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase">Journal Title</label>
            <input
              type="text"
              placeholder="Reflecting on this week's struggles..."
              className="w-full border-2 border-black p-2 focus:bg-neutral-50 outline-none text-sm font-bold bg-white"
            />
          </div>

          {/* Body input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase">Write your thoughts</label>
            <textarea
              rows={10}
              placeholder="Start typing your thoughts here... How did your day go? What triggered your stress today?"
              className="w-full border-2 border-black p-3 focus:bg-neutral-50 outline-none text-sm bg-white"
            ></textarea>
          </div>

          {/* Attachments */}
          <div className="flex gap-4">
            <button className="border-2 border-black border-dashed p-3 text-xs font-bold flex items-center gap-2 hover:bg-neutral-50 transition">
              <Image className="w-4 h-4" /> Attach Memento Image
            </button>
          </div>
        </section>

        {/* Side Panel: Mood & Insights */}
        <section className="space-y-6">
          {/* Mood Selector */}
          <div className="border-4 border-black p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide">// How do you feel?</h3>
            <div className="grid grid-cols-5 gap-2">
              {moods.map((m) => (
                <button
                  key={m.score}
                  onClick={() => setMood(m.score)}
                  className={`border-2 border-black p-2 text-center text-xs font-bold uppercase transition ${
                    mood === m.score ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-50"
                  }`}
                >
                  <div className="text-sm">{m.score}</div>
                  <div className="text-[8px] mt-1">{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Realtime cognitive distortion tracker placeholder */}
          <div className="border-4 border-black p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide">// CBT Distortion Analysis</h3>
            <p className="text-[10px] text-neutral-600 leading-relaxed">
              As you write, the frontend parses semantic markers for potential cognitive distortions (e.g. Catastrophizing, All-or-nothing thinking) to guide reflection.
            </p>
            <div className="border border-black p-3 bg-neutral-50 text-[10px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-bold">STATUS:</span> No distortion flagged yet.
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Info */}
      <footer className="text-xs text-neutral-500 border-t-2 border-black pt-2">
        <p>*Journal entries are stored securely in Supabase with RLS policies enabled.</p>
      </footer>
    </div>
  );
}
