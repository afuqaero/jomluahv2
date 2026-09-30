"use client";

import { useState } from "react";
import Link from "next/link";
import { PreviewBar } from "../PreviewBar";
import {
  ArrowRight,
  UserCheck,
  CheckCircle,
  Quotes,
  Sparkle,
  ChatTeardropText,
} from "@phosphor-icons/react";

export default function Design4Page() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      title: "1. Pick your mood vibe",
      desc: "Select how your day feels right now using intuitive color tags.",
      preview: "Mood: Overwhelmed -> Shifted to Calm after check-in",
    },
    {
      num: 2,
      title: "2. Chat with AI companion",
      desc: "Talk through thoughts with a gentle AI companion trained to support mental wellness.",
      preview: "AI: 'Take a breath. What feels heaviest right now?'",
    },
    {
      num: 3,
      title: "3. Save to handwritten journal",
      desc: "Lock away private reflections in your encrypted personal journal.",
      preview: "Journal: 'Felt better after writing out my thoughts today.'",
    },
  ];

  return (
    <div className="page4-root pt-12">
      <PreviewBar />

      {/* ── Editorial Header ── */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-indigo-100/70">
        <div className="flex items-center gap-3">
          <span className="font-black text-2xl tracking-tight text-indigo-950">JomLuah</span>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wider">
            Design 4: Editorial
          </span>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-indigo-950">
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* ── Editorial Hero ── */}
      <main className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 text-left space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-indigo-100 text-indigo-700 text-xs font-extrabold shadow-sm">
              <Sparkle weight="fill" className="text-indigo-500 w-3.5 h-3.5" />
              <span>For UTHM Students &amp; Youth</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-indigo-950 leading-tight tracking-tight">
              Your private sanctuary to <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                vent, reflect &amp; grow.
              </span>
            </h1>

            <p className="text-slate-600 text-sm leading-relaxed max-w-lg">
              Life gets hectic. JomLuah gives you a warm space to express feelings freely — backed by AI companionship and private handwritten journaling.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/register"
                className="px-6 py-3 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all"
              >
                Create Free Account
                <ArrowRight weight="bold" className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-full bg-white/80 border border-white text-slate-700 text-xs font-bold hover:bg-white transition-all"
              >
                Sign In
              </Link>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-bold text-indigo-900/70 pt-3">
              <span className="flex items-center gap-1"><UserCheck weight="fill" className="text-emerald-500" /> 100% Free</span>
              <span className="flex items-center gap-1"><CheckCircle weight="fill" className="text-indigo-500" /> Fully Anonymous</span>
            </div>
          </div>

          {/* Interactive Step-by-step Onboarding Card */}
          <div className="md:col-span-5 bg-white/90 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10">
            <h3 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ChatTeardropText weight="bold" className="text-indigo-600 w-4 h-4" />
              How JomLuah Works — Interactive Steps:
            </h3>

            <div className="space-y-3 mb-4">
              {steps.map((s) => (
                <button
                  key={s.num}
                  onClick={() => setActiveStep(s.num)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all ${
                    activeStep === s.num
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/80 hover:border-indigo-300"
                  }`}
                >
                  <span className="text-xs font-bold block mb-0.5">{s.title}</span>
                  <span className={`text-[11px] block leading-normal ${activeStep === s.num ? "text-indigo-100" : "text-slate-500"}`}>
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-indigo-950 text-indigo-100 text-xs font-mono">
              <span className="text-[10px] font-bold text-indigo-400 block uppercase">Step {activeStep} Preview:</span>
              <p className="mt-1">{steps[activeStep - 1].preview}</p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Student Testimonial Quote Section ── */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="p-8 rounded-3xl bg-white/80 border border-white/90 shadow-xl shadow-indigo-500/5 text-center relative overflow-hidden">
          <Quotes weight="fill" className="w-12 h-12 text-indigo-200/60 absolute -top-2 left-4" />
          <p className="font-journal text-2xl text-indigo-950 max-w-xl mx-auto leading-relaxed relative z-10">
            &quot;JomLuah has become my daily mental pitstop. Venting to the AI companion before writing in my journal helps me unclutter my mind after a long day of lectures.&quot;
          </p>
          <span className="text-xs font-extrabold text-indigo-600 block mt-3 uppercase tracking-wider">
            — UTHM Final Year Student
          </span>
        </div>
      </section>

      <footer className="text-center py-8 text-xs text-slate-400 border-t border-indigo-100">
        © 2026 JomLuah — Your Safe Space to Express &amp; Reflect
      </footer>

      <style jsx global>{`
        .page4-root {
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
