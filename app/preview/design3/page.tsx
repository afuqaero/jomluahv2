"use client";

import { useState } from "react";
import Link from "next/link";
import { PreviewBar } from "../PreviewBar";
import {
  ArrowRight,
  Rainbow,
  ChatsCircle,
  NotePencil,
  ShieldCheck,
} from "@phosphor-icons/react";

export default function Design3Page() {
  const [activeMoodIndex, setActiveMoodIndex] = useState(2);

  const spectrumItems = [
    { name: "Heavy / Low", color: "from-rose-500 to-pink-500", desc: "Moments when everything feels like too much." },
    { name: "Quiet / Reflective", color: "from-amber-400 to-orange-400", desc: "Taking time to turn inwards and observe." },
    { name: "Calm & Centered", color: "from-emerald-400 to-teal-500", desc: "Finding steady ground and gentle breathing." },
    { name: "Hopeful & Light", color: "from-indigo-500 to-blue-500", desc: "Reconnecting with small joys and purpose." },
  ];

  return (
    <div className="page3-root pt-12">
      <PreviewBar />

      {/* ── Minimal Header ── */}
      <header className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between border-b border-indigo-100/60">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-indigo-600" />
          <span className="font-bold text-lg text-slate-900 tracking-tight">JomLuah</span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase">
            Design 3: Zen
          </span>
        </div>

        <nav className="flex items-center gap-6 text-xs font-semibold text-slate-600">
          <Link href="/login" className="hover:text-slate-900">Sign In</Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-indigo-600 transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest block mb-3">
          Minimalist Mental Health Sanctuary
        </span>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          A calm, quiet space for your mind.
        </h1>

        <p className="text-slate-600 text-base max-w-lg mx-auto mt-4 mb-10 leading-relaxed">
          No distractions. Just a warm companion and a private space to organize your emotional journey.
        </p>

        {/* ── Interactive Mood Spectrum Selector ── */}
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-left">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Rainbow weight="bold" className="text-indigo-600 w-4 h-4" />
              Interactive Mood Spectrum Demo:
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Click to preview</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {spectrumItems.map((item, idx) => (
              <button
                key={item.name}
                onClick={() => setActiveMoodIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeMoodIndex === idx
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className={`h-2 rounded-full mb-2 bg-gradient-to-r ${item.color}`} />
                <span className="text-xs font-bold text-slate-900 block leading-snug">{item.name}</span>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-1">
            <div className="flex items-center justify-between text-indigo-300 font-bold">
              <span>{spectrumItems[activeMoodIndex].name}</span>
              <span className="text-[10px] text-slate-400">Spectrum Insight</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {spectrumItems[activeMoodIndex].desc}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
          >
            Start Free Today
            <ArrowRight weight="bold" className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* ── Feature Rows ── */}
      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-indigo-100/60">
        <div className="grid sm:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80">
            <ChatsCircle weight="bold" className="w-6 h-6 text-indigo-600 mb-3" />
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">Companion AI</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Empathetic chat assistant trained to offer perspective without pressure.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80">
            <NotePencil weight="bold" className="w-6 h-6 text-purple-600 mb-3" />
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">Cozy Journaling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tag entries with feelings, thoughts, and to-dos in your personal sanctuary.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80">
            <ShieldCheck weight="bold" className="w-6 h-6 text-emerald-600 mb-3" />
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">100% Private</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your thoughts remain entirely confidential and encrypted.
            </p>
          </div>
        </div>
      </section>

      <footer className="text-center py-8 text-xs text-slate-400 border-t border-slate-200">
        © 2026 JomLuah — Your Safe Space to Express &amp; Reflect
      </footer>

      <style jsx global>{`
        .page3-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #dbeafe 100%);
          color: #0f172a;
          font-family: var(--font-plus-jakarta), sans-serif;
        }
      `}</style>
    </div>
  );
}
