"use client";

import { useState } from "react";
import Link from "next/link";
import { PreviewBar } from "../PreviewBar";
import {
  Flame,
  NotePencil,
  Heart,
  ShieldCheck,
  PaperPlaneRight,
  Sparkle,
  BookmarkSimple,
} from "@phosphor-icons/react";

export default function Design2Page() {
  const [ventText, setVentText] = useState("");
  const [ventResult, setVentResult] = useState<string | null>(null);
  const [isVenting, setIsVenting] = useState(false);

  const handleVent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ventText.trim()) return;
    setIsVenting(true);
    setTimeout(() => {
      setIsVenting(false);
      setVentResult(
        `Thank you for expressing that. Writing it down takes courage. JomLuah is here whenever you're ready to explore this further with your private AI companion.`
      );
    }, 600);
  };

  return (
    <div className="page2-root pt-12">
      <PreviewBar />

      {/* ── Header ── */}
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
            JL
          </div>
          <span className="font-extrabold text-xl text-indigo-950">JomLuah</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
            Design 2
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-900">
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:scale-105 transition-all"
          >
            Start Venting
          </Link>
        </div>
      </header>

      {/* ── Main Hero with Live Venting Box ── */}
      <main className="max-w-4xl mx-auto px-6 py-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-800 text-xs font-bold mb-6">
          <Flame weight="fill" className="text-indigo-600 w-3.5 h-3.5" />
          <span>No Login Required To Try</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-indigo-950 leading-tight tracking-tight">
          Got something heavy on your mind? <br />
          <span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
            Let it out right now.
          </span>
        </h1>

        <p className="text-slate-600 text-base max-w-xl mx-auto mt-4 mb-8 leading-relaxed">
          &quot;Jom Luah&quot; means expressing what you carry inside. Type a quick thought below to experience how gentle reflection works.
        </p>

        {/* ── Live Venting Widget ── */}
        <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-2xl shadow-indigo-500/15 text-left relative">
          <form onSubmit={handleVent} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <NotePencil weight="bold" className="text-indigo-600 w-4 h-4" />
                Your Private Vent Box:
              </label>
              <span className="text-[11px] font-semibold text-slate-400">100% Anonymous Demo</span>
            </div>

            <textarea
              rows={3}
              value={ventText}
              onChange={(e) => setVentText(e.target.value)}
              placeholder="e.g. I'm feeling really stressed about upcoming exams and don't know who to talk to..."
              className="w-full p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {ventText.length} characters
              </span>
              <button
                type="submit"
                disabled={!ventText.trim() || isVenting}
                className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/30 transition-all"
              >
                {isVenting ? "Releasing..." : "Release Thought"}
                <PaperPlaneRight weight="bold" className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {ventResult && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-indigo-50 border border-emerald-200/80 text-xs text-slate-700 animate-fade-in-up">
              <div className="flex items-center gap-2 font-bold text-emerald-800 mb-1">
                <Sparkle weight="fill" className="text-emerald-500" />
                Venting Space Response:
              </div>
              <p className="leading-relaxed">{ventResult}</p>
            </div>
          )}
        </div>

        {/* ── Privacy reassurance ── */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5"><ShieldCheck weight="fill" className="text-indigo-600" /> Encrypted Storage</span>
          <span className="flex items-center gap-1.5"><Heart weight="fill" className="text-pink-500" /> Compassionate Companion</span>
          <span className="flex items-center gap-1.5"><BookmarkSimple weight="fill" className="text-amber-500" /> Personalized Reflections</span>
        </div>
      </main>

      {/* ── Features Grid ── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-white/80 border border-white/90 shadow-xl shadow-indigo-500/5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-4">
              01
            </div>
            <h3 className="text-xl font-black text-indigo-950 mb-2">Private Handwritten Journal</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Write entries that feel warm and personal. Organize them by emotional tags and revisit past thoughts anytime.
            </p>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 font-journal text-amber-950 text-lg leading-snug">
              &quot;Today I felt like giving up on my report, but talking to my companion reminded me how far I&apos;ve come.&quot;
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white/80 border border-white/90 shadow-xl shadow-indigo-500/5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-4">
              02
            </div>
            <h3 className="text-xl font-black text-indigo-950 mb-2">24/7 Empathetic AI Listener</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Never bottle up stress again. Talk freely with an AI tuned for warmth, active listening, and calm guidance.
            </p>
            <div className="p-3 rounded-xl bg-indigo-950 text-indigo-100 text-xs font-mono">
              &gt; AI: &quot;What is one small thing that would bring you comfort right now?&quot;
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center py-8 text-xs text-slate-400 border-t border-indigo-100">
        © 2026 JomLuah — Your Safe Space to Express &amp; Reflect
      </footer>

      <style jsx global>{`
        .page2-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #dbeafe 100%);
          color: #1e1b4b;
          font-family: var(--font-plus-jakarta), sans-serif;
        }
        .font-journal { font-family: var(--font-caveat), cursive; }
      `}</style>
    </div>
  );
}
