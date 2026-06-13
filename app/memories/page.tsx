"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Search, Calendar, RefreshCw } from "lucide-react";

export default function MemoriesPage() {
  const dummyMemories = [
    { date: "13 June 2025", title: "Final year project starting stress", excerpt: "Starting PSM soon and feeling overwhelmed about supervisors...", mood: 2 },
    { date: "24 December 2025", title: "Semester break relief", excerpt: "Finally done with exams, headed back home to rest. Feeling relaxed...", mood: 5 },
    { date: "02 April 2026", title: "Counselling intake first visit", excerpt: "Visited Pusat Kaunseling UTHM today. Friendly counsellor...", mood: 3 }
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
            <h1 className="text-xl font-black uppercase">[ Throwback Memories ]</h1>
            <p className="text-[10px] text-neutral-600">// Index of past semantic vector references</p>
          </div>
        </div>
        <div>
          <button className="border-2 border-black p-2 hover:bg-neutral-100 transition flex items-center gap-1 text-xs font-bold uppercase">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="my-6 flex-grow space-y-6">
        {/* Search / Filters */}
        <section className="border-4 border-black p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search past memories..."
              className="w-full border-2 border-black p-2 pl-10 focus:bg-neutral-50 outline-none text-xs bg-white"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="border-2 border-black px-3 py-2 text-xs font-bold uppercase hover:bg-neutral-50 transition w-1/2 sm:w-auto">
              Filter: Mood
            </button>
            <button className="border-2 border-black px-3 py-2 text-xs font-bold uppercase hover:bg-neutral-50 transition w-1/2 sm:w-auto">
              Sort: Oldest First
            </button>
          </div>
        </section>

        {/* Timeline Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dummyMemories.map((mem, idx) => (
            <div key={idx} className="border-4 border-black p-6 flex flex-col justify-between h-64 bg-neutral-50 hover:bg-white transition">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] border-b border-black pb-2">
                  <span className="flex items-center gap-1 font-bold">
                    <Calendar className="w-3.5 h-3.5" /> {mem.date}
                  </span>
                  <span className="border border-black px-1.5 py-0.5 bg-neutral-200 font-bold uppercase">
                    Mood: {mem.mood}/5
                  </span>
                </div>
                <h3 className="font-bold uppercase text-sm">{mem.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed italic">
                  &ldquo;{mem.excerpt}&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-black border-dashed flex justify-between items-center text-[10px]">
                <span className="text-neutral-500">// Saved 1 year ago</span>
                <span className="font-bold underline cursor-pointer hover:text-neutral-700 uppercase">View full log</span>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Footer Info */}
      <footer className="text-xs text-neutral-500 border-t-2 border-black pt-2">
        <p>*Memory retrieval utilizes cosine similarity comparisons on text-embeddings.</p>
      </footer>
    </div>
  );
}
