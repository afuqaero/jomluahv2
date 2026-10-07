"use client";

import { useState } from "react";
import Link from "next/link";
import { PreviewBar } from "../PreviewBar";
import {
  Sparkle,
  ArrowRight,
  ChatsCircle,
  NotePencil,
  Rainbow,
  Heart,
  ShieldCheck,
  Smiley,
  CheckCircle,
} from "@phosphor-icons/react";

export default function Design1Page() {
  const [selectedMood, setSelectedMood] = useState<string>("Overwhelmed");
  const [chatPrompt, setChatPrompt] = useState<string>("assignment");
  const [spectrumVal, setSpectrumVal] = useState<number>(65);

  const moodResponses: Record<string, { title: string; text: string; tag: string }> = {
    Overwhelmed: {
      title: "Take a deep breath in...",
      text: "It is totally okay to pause. Try breaking your tasks into tiny 5-minute steps. You don't have to finish everything today.",
      tag: "Gentle Reminder",
    },
    Peaceful: {
      title: "Savor this calm moment.",
      text: "Moments of stillness are precious. Consider logging what brought you peace today in your private journal so you can revisit it later.",
      tag: "Cozy Vibe",
    },
    Reflective: {
      title: "Your thoughts matter.",
      text: "Writing down what's on your mind can turn tangled emotions into clear perspective. JomLuah is here to hold that space for you.",
      tag: "Deep Thought",
    },
    Hopeful: {
      title: "Hold on to this light!",
      text: "Even small sparks of hope can carry you forward. What's one tiny thing you're looking forward to tomorrow?",
      tag: "Bright Outlook",
    },
    Exhausted: {
      title: "Rest is not earned, it's needed.",
      text: "Be soft with yourself. Grab a warm drink, step away from screens for a bit, and let your mind unwind.",
      tag: "Self Care",
    },
  };

  const chatDemos: Record<string, { question: string; answer: string }> = {
    assignment: {
      question: "I have so many assignments due tomorrow and I feel stuck...",
      answer: "I hear you! When deadlines pile up, our brains get overwhelmed. Let's tackle just ONE small 10-minute task together. Which one feels easiest?",
    },
    vent: {
      question: "I just need a safe place to vent without judgment.",
      answer: "I'm right here with you. Type out whatever you're feeling — no filter needed. Your privacy is 100% protected.",
    },
    gratitude: {
      question: "Help me find something good about today.",
      answer: "Did you enjoy a quiet cup of coffee, finish a class, or share a laugh? Even the tiny moments count.",
    },
  };

  return (
    <div className="page1-root pt-12">
      <PreviewBar />

      {/* ── Pill Nav ── */}
      <div className="pill-nav-wrap">
        <nav className="pill-nav">
          <Link href="/preview/design1" className="pill-logo">
            <span className="logo-text">JomLuah</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              Design 1
            </span>
          </Link>
          <div className="pill-right-group">
            <a href="#features" className="pill-link">Features</a>
            <Link href="/register" className="pill-cta">
              Start Free
              <ArrowRight weight="bold" className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </div>

      {/* ── Hero ── */}
      <main className="hero1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-white/90 shadow-sm text-xs font-semibold text-indigo-600 mb-4">
          <Sparkle weight="fill" className="w-3.5 h-3.5 text-indigo-500" />
          <span>Interactive Sanctuary Landing Page</span>
        </div>

        <h1 className="hero1-headline">
          Take a breath. <br />
          You&apos;re <span className="hero1-gradient">doing better</span> than you think.
        </h1>

        <p className="hero1-subtext">
          JomLuah pairs a gentle AI companion with a private handwritten journal, so you can check in, vent, and reflect — one quiet moment at a time.
        </p>

        {/* ── Interactive Vibe Check Widget ── */}
        <div className="w-full max-w-xl mx-auto my-6 p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-xl shadow-indigo-500/10 text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <Smiley weight="bold" className="w-4 h-4" />
              Instant Vibe Check — Try Clicking:
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Live Demo</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(moodResponses).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMood(m)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedMood === m
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {m === "Overwhelmed" && "😔 "}
                {m === "Peaceful" && "🌿 "}
                {m === "Reflective" && "💭 "}
                {m === "Hopeful" && "✨ "}
                {m === "Exhausted" && "🔋 "}
                {m}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100/80">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold text-indigo-950">
                {moodResponses[selectedMood].title}
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/60 text-indigo-800">
                {moodResponses[selectedMood].tag}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {moodResponses[selectedMood].text}
            </p>
          </div>
        </div>

        <div className="hero1-cta-group">
          <Link href="/register" className="btn-primary-lg">
            Create Free Account
            <ArrowRight weight="bold" className="w-4 h-4" />
          </Link>
          <Link href="/login" className="btn-glass-lg">
            Sign In
          </Link>
        </div>

        {/* ── Trust Badges ── */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs font-semibold text-indigo-900/70">
          <span className="flex items-center gap-1.5"><ShieldCheck weight="fill" className="text-emerald-500" /> 100% Private &amp; Encrypted</span>
          <span className="flex items-center gap-1.5"><CheckCircle weight="fill" className="text-indigo-500" /> No Judgment Zone</span>
          <span className="flex items-center gap-1.5"><Heart weight="fill" className="text-pink-500" /> Built for UTHM Students</span>
        </div>
      </main>

      {/* ── Features Section ── */}
      <section className="features-section mt-12" id="features">
        <div className="features-inner">
          <div className="section-eyebrow">
            <div className="eyebrow-line" />
            <span>Designed for emotional wellness</span>
            <div className="eyebrow-line" />
          </div>

          <h2 className="section-title">Everything you need to feel lighter</h2>
          <p className="section-subtitle">
            Three simple modules working together to help you process feelings without stress.
          </p>

          <div className="feature-grid">
            {/* Feature 1: Companion AI */}
            <div className="feature-card">
              <div className="feature-icon icon-indigo">
                <ChatsCircle weight="duotone" className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Companion AI</h3>
              <p className="feature-desc">
                An empathetic listener trained to ask thoughtful questions and support your mental clarity.
              </p>

              {/* Interactive prompt tabs */}
              <div className="space-y-2 mt-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Try asking:</p>
                <div className="flex flex-col gap-1.5">
                  {Object.keys(chatDemos).map((key) => (
                    <button
                      key={key}
                      onClick={() => setChatPrompt(key)}
                      className={`text-left text-[11px] p-2 rounded-lg border transition-all ${
                        chatPrompt === key
                          ? "bg-indigo-600 text-white border-indigo-600 font-semibold shadow-sm"
                          : "bg-white/80 text-slate-700 border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      &quot;{chatDemos[key].question.slice(0, 36)}...&quot;
                    </button>
                  ))}
                </div>

                <div className="mt-3 p-3 rounded-lg bg-indigo-950 text-white text-xs space-y-1.5 shadow-inner">
                  <span className="text-[10px] text-indigo-300 font-bold block">AI Companion:</span>
                  <p className="text-indigo-100 text-[11px] leading-relaxed">
                    {chatDemos[chatPrompt].answer}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2: Private Journal */}
            <div className="feature-card">
              <div className="feature-icon icon-violet">
                <NotePencil weight="duotone" className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Private Journal</h3>
              <p className="feature-desc">
                Express your feelings in cozy handwritten journal style with mood tagging and topic folders.
              </p>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 shadow-sm font-journal my-2">
                <span className="text-xs font-bold text-amber-900 block mb-1">Today&apos;s Entry — 10:45 PM</span>
                <p className="text-amber-950 text-base leading-snug italic">
                  &quot;Felt a bit anxious about tomorrow, but venting it out helped me see things clearly. Glad I took time to breathe.&quot;
                </p>
                <div className="flex gap-2 mt-3 font-sans">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-900">#Reflective</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">#SelfCare</span>
                </div>
              </div>
            </div>

            {/* Feature 3: Mood Spectrum */}
            <div className="feature-card">
              <div className="feature-icon icon-pink">
                <Rainbow weight="duotone" className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Mood Spectrum</h3>
              <p className="feature-desc">
                Visualize how your feelings evolve over time with smooth color spectrum insights.
              </p>

              <div className="mt-4 p-4 rounded-xl bg-white/90 border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Drag Mood Slider:</span>
                  <span className="font-bold text-indigo-600">{spectrumVal}% Positive Vibe</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={spectrumVal}
                  onChange={(e) => setSpectrumVal(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div
                  className="h-6 rounded-lg transition-all flex items-center justify-center text-white text-[11px] font-bold"
                  style={{
                    background: `linear-gradient(to right, #f43f5e 0%, #fbbf24 40%, #10b981 70%, #6366f1 100%)`,
                    filter: `saturate(${spectrumVal + 20}%)`,
                  }}
                >
                  {spectrumVal < 40 ? "Needs Care & Rest" : spectrumVal < 75 ? "Balanced & Calm" : "Radiant & Empowered"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <span>© 2026 JomLuah — Your Safe Space to Express &amp; Reflect</span>
      </footer>

      <style jsx global>{`
        .page1-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #dbeafe 100%);
          color: #1e1b4b;
          font-family: var(--font-plus-jakarta), sans-serif;
        }
        .pill-nav-wrap {
          position: sticky; top: 3.5rem; z-index: 40;
          padding: 0 1.5rem; display: flex; justify-content: center;
        }
        .pill-nav {
          width: 100%; max-width: 880px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.625rem 1.25rem; border-radius: 999px;
          background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 8px 32px rgba(99,102,241,0.12);
        }
        .pill-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .logo-text { font-size: 1.1rem; font-weight: 800; color: #1e1b4b; }
        .pill-right-group { display: flex; align-items: center; gap: 1.5rem; }
        .pill-link { font-size: 0.875rem; font-weight: 700; color: #4b5563; text-decoration: none; }
        .pill-cta {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.625rem 1.25rem; border-radius: 999px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white; font-size: 0.8125rem; font-weight: 700; text-decoration: none;
        }
        .hero1 {
          max-width: 880px; margin: 0 auto; padding: 3rem 1.5rem 1rem; text-align: center;
        }
        .hero1-headline {
          font-size: clamp(2.5rem, 6vw, 4.25rem); font-weight: 900; line-height: 1.1; color: #1e1b4b;
        }
        .hero1-gradient {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3b82f6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero1-subtext {
          font-size: 1.05rem; color: #4b5563; max-width: 580px; margin: 1rem auto; line-height: 1.7;
        }
        .hero1-cta-group { display: flex; gap: 1rem; justify-content: center; }
        .btn-primary-lg {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.85rem 1.75rem; border-radius: 999px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white; font-weight: 700; text-decoration: none;
          box-shadow: 0 6px 24px rgba(99,102,241,0.35);
        }
        .btn-glass-lg {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.85rem 1.75rem; border-radius: 999px;
          background: rgba(255,255,255,0.75); border: 1px solid rgba(255,255,255,0.9);
          color: #374151; font-weight: 700; text-decoration: none;
        }
        .features-section {
          background: rgba(255,255,255,0.65); backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255,255,255,0.8); padding: 4rem 1.5rem;
        }
        .features-inner { max-width: 1100px; margin: 0 auto; }
        .section-eyebrow {
          display: flex; align-items: center; justify-content: center; gap: 0.75rem;
          font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #6366f1; letter-spacing: 0.1em;
        }
        .eyebrow-line { flex: 1; max-width: 60px; height: 1px; background: rgba(99,102,241,0.3); }
        .section-title { text-align: center; font-size: 2rem; font-weight: 900; color: #1e1b4b; margin-top: 0.5rem; }
        .section-subtitle { text-align: center; color: #6b7280; font-size: 0.95rem; margin-bottom: 2.5rem; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .feature-card {
          padding: 1.75rem; border-radius: 1.5rem;
          background: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(99,102,241,0.08);
        }
        .feature-icon {
          width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;
        }
        .icon-indigo { background: rgba(99,102,241,0.12); color: #6366f1; }
        .icon-violet { background: rgba(139,92,246,0.12); color: #8b5cf6; }
        .icon-pink { background: rgba(244,63,94,0.12); color: #f43f5e; }
        .feature-title { font-size: 1.1rem; font-weight: 800; color: #1e1b4b; margin-bottom: 0.4rem; }
        .feature-desc { font-size: 0.85rem; color: #6b7280; line-height: 1.6; margin-bottom: 1rem; }
        .font-journal { font-family: var(--font-caveat), cursive; }
        .landing-footer { text-align: center; padding: 2rem; font-size: 0.75rem; color: #9ca3af; border-top: 1px solid rgba(99,102,241,0.1); }
      `}</style>
    </div>
  );
}
