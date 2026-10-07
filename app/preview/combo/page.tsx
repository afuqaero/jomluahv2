"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PreviewBar } from "../PreviewBar";
import {
  ArrowRight,
  Heart,
  UserCheck,
  CheckCircle,
  Sparkle,
  BookOpen,
  Robot,
  User,
  ArrowsClockwise,
} from "@phosphor-icons/react";

interface Scenario {
  userMessage: string;
  robotMessage: string;
  tag: string;
}

const scenarios: Scenario[] = [
    {
      userMessage: "I feel really overwhelmed with assignments tonight...",
      robotMessage: "I hear you. Take a slow breath in... You don't have to tackle everything at once. Let's start with just 1 small step together.",
      tag: "Assignment Stress",
    },
    {
      userMessage: "I just needed a quiet place to vent without judgment.",
      robotMessage: "Your thoughts are completely safe here. Take all the time you need — I'm right here listening.",
      tag: "Safe Venting",
    },
    {
      userMessage: "How do I stop overthinking about tomorrow?",
      robotMessage: "Focus on right now. You are doing much better than you give yourself credit for. Grab some water and rest your mind.",
      tag: "Overthinking",
    },
];

export default function ComboPage() {
  const [selectedMood, setSelectedMood] = useState<string>("Overwhelmed");
  const [activeDiaryTab, setActiveDiaryTab] = useState<number>(0);

  // ── Animated Chat State ──

  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const [typedUserText, setTypedUserText] = useState<string>("");
  const [typedRobotText, setTypedRobotText] = useState<string>("");
  const [isRobotThinking, setIsRobotThinking] = useState<boolean>(false);
  const [step, setStep] = useState<"typing-user" | "user-done" | "robot-thinking" | "typing-robot" | "done">("typing-user");

  const triggerScenario = useCallback((idx: number) => {
    setScenarioIndex(idx);
    setTypedUserText("");
    setTypedRobotText("");
    setIsRobotThinking(false);
    setStep("typing-user");
  }, []);

  // Typewriter effect controller
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const currentScenario = scenarios[scenarioIndex];

    if (step === "typing-user") {
      if (typedUserText.length < currentScenario.userMessage.length) {
        timeoutId = setTimeout(() => {
          setTypedUserText(currentScenario.userMessage.slice(0, typedUserText.length + 1));
        }, 40);
      } else {
        timeoutId = setTimeout(() => setStep("user-done"), 0);
      }
    } else if (step === "user-done") {
      timeoutId = setTimeout(() => {
        setIsRobotThinking(true);
        setStep("robot-thinking");
      }, 400);
    } else if (step === "robot-thinking") {
      timeoutId = setTimeout(() => {
        setIsRobotThinking(false);
        setStep("typing-robot");
      }, 1200);
    } else if (step === "typing-robot") {
      if (typedRobotText.length < currentScenario.robotMessage.length) {
        timeoutId = setTimeout(() => {
          setTypedRobotText(currentScenario.robotMessage.slice(0, typedRobotText.length + 1));
        }, 25);
      } else {
        timeoutId = setTimeout(() => setStep("done"), 0);
      }
    } else if (step === "done") {
      timeoutId = setTimeout(() => {
        // Loop to next scenario
        const nextIdx = (scenarioIndex + 1) % scenarios.length;
        triggerScenario(nextIdx);
      }, 4000);
    }

    return () => clearTimeout(timeoutId);
  }, [step, typedUserText, typedRobotText, scenarioIndex, triggerScenario]);

  const diaryEntries = [
    {
      date: "Wednesday, Sept 30 • 10:45 PM",
      title: "Dear Diary,",
      text: "Felt so overwhelmed with assignment deadlines today... But taking 5 minutes to write this out and talk to my companion made my chest feel lighter. I'm doing better than I thought.",
      tags: ["#Overwhelmed", "#SelfCare", "#Gratitude"],
      mood: "🌿 Calm",
    },
    {
      date: "Tuesday, Sept 29 • 11:20 PM",
      title: "Dear Diary,",
      text: "Had a quiet cup of coffee today between lectures. Small wins count! Glad I gave myself permission to pause instead of rushing through everything.",
      tags: ["#Peaceful", "#SmallWins", "#Mindfulness"],
      mood: "✨ Hopeful",
    },
  ];

  const moodResponses: Record<string, { title: string; text: string; tag: string }> = {
    Overwhelmed: {
      title: "Take a slow breath in...",
      text: "It is completely okay to pause. Try breaking your tasks into tiny 5-minute steps. You don't have to carry everything at once.",
      tag: "Gentle Reminder",
    },
    Peaceful: {
      title: "Savor this calm moment.",
      text: "Moments of stillness are precious. Logging what brought you peace today creates a cozy anchor for harder days.",
      tag: "Cozy Vibe",
    },
    Reflective: {
      title: "Your thoughts matter.",
      text: "Writing down what's on your mind turns tangled emotions into clear perspective. JomLuah holds that space for you.",
      tag: "Deep Thought",
    },
    Hopeful: {
      title: "Hold on to this light!",
      text: "Even small sparks of hope carry immense strength. What's one tiny thing you're looking forward to tomorrow?",
      tag: "Bright Outlook",
    },
    Exhausted: {
      title: "Rest is necessary, not earned.",
      text: "Be gentle with yourself tonight. Grab a warm drink, step away from screens, and let your mind rest.",
      tag: "Self Care",
    },
  };

  return (
    <div className="combo-root pt-12">
      <PreviewBar />

      {/* ── Editorial Header ── */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-indigo-100/70">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-500/20">
            JL
          </div>
          <span className="font-black text-2xl tracking-tight text-indigo-950">JomLuah</span>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-600 text-white uppercase tracking-wider shadow-sm">
            Live Chat Animation
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

      {/* ── Combo Hero ── */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Headline + Handwritten "Dear Diary" Card */}
          <div className="lg:col-span-6 text-left space-y-6">
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

            <p className="text-slate-600 text-sm leading-relaxed">
              Life gets hectic. JomLuah pairs a gentle AI companion with a private handwritten journal — so you can express feelings freely without pressure.
            </p>

            {/* 📖 HANDWRITTEN "DEAR DIARY" CARD 📖 */}
            <div className="relative p-6 rounded-3xl bg-amber-50/90 border border-amber-200/90 shadow-xl shadow-amber-900/5 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen weight="bold" className="text-amber-800 w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 font-sans">
                    {diaryEntries[activeDiaryTab].date}
                  </span>
                </div>
                <button
                  onClick={() => setActiveDiaryTab((prev) => (prev === 0 ? 1 : 0))}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline font-sans"
                >
                  Flip Page ➔
                </button>
              </div>

              <div className="font-journal text-amber-950 space-y-2 py-1">
                <h3 className="text-2xl font-bold italic tracking-wide">{diaryEntries[activeDiaryTab].title}</h3>
                <p className="text-xl leading-relaxed italic">
                  &quot;{diaryEntries[activeDiaryTab].text}&quot;
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-amber-200/60 font-sans">
                <div className="flex flex-wrap gap-1.5">
                  {diaryEntries[activeDiaryTab].tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-950">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-900 bg-white/80 px-2.5 py-0.5 rounded-full shadow-xs">
                  Mood: {diaryEntries[activeDiaryTab].mood}
                </span>
              </div>
            </div>

            {/* CTA Buttons & Trust Badges */}
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

            <div className="flex items-center gap-4 text-[11px] font-bold text-indigo-900/70 pt-1">
              <span className="flex items-center gap-1"><UserCheck weight="fill" className="text-emerald-500" /> 100% Free</span>
              <span className="flex items-center gap-1"><CheckCircle weight="fill" className="text-indigo-500" /> Fully Anonymous</span>
              <span className="flex items-center gap-1"><Heart weight="fill" className="text-pink-500" /> No Judgment</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Typewriter Chat Animation */}
          <div className="lg:col-span-6 space-y-4">

            {/* 🤖 ANIMATED LIVE CHAT BUBBLE WIDGET 🤖 */}
            <div className="bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-2xl shadow-indigo-500/15 text-left relative overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-indigo-50/80 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <Robot weight="fill" className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-indigo-950 leading-tight">
                      JomLuah Companion AI
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Typing Simulation
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  {scenarios.map((sc, idx) => (
                    <button
                      key={sc.tag}
                      onClick={() => triggerScenario(idx)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                        scenarioIndex === idx
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-indigo-100"
                      }`}
                    >
                      {sc.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="space-y-4 min-h-[220px] flex flex-col justify-end py-1">

                {/* 👤 USER BUBBLE (Typewriter Effect) */}
                <div className="flex items-start justify-end gap-2">
                  <div className="max-w-[85%] bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-xs shadow-md shadow-indigo-500/20 text-xs leading-relaxed font-medium">
                    {typedUserText}
                    {step === "typing-user" && (
                      <span className="inline-block w-1.5 h-3.5 bg-white/80 ml-0.5 animate-pulse" />
                    )}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    <User weight="bold" className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 🤖 ROBOT BUBBLE (Thinking Dots or Typewriter Answer) */}
                {(isRobotThinking || step === "typing-robot" || step === "done") && (
                  <div className="flex items-start justify-start gap-2 animate-fade-in-up">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Robot weight="fill" className="w-3.5 h-3.5" />
                    </div>

                    <div className="max-w-[85%] bg-slate-100 border border-slate-200/80 text-slate-800 p-3.5 rounded-2xl rounded-tl-xs text-xs leading-relaxed font-medium shadow-xs">
                      {isRobotThinking ? (
                        <div className="flex items-center gap-1.5 py-1 px-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      ) : (
                        <>
                          {typedRobotText}
                          {step === "typing-robot" && (
                            <span className="inline-block w-1.5 h-3.5 bg-indigo-600 ml-0.5 animate-pulse" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Re-play Button Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Scenario {scenarioIndex + 1} of 3</span>
                <button
                  onClick={() => triggerScenario(scenarioIndex)}
                  className="flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                >
                  <ArrowsClockwise weight="bold" className="w-3 h-3" />
                  Replay Typing
                </button>
              </div>

            </div>

            {/* Quick Vibe Selector below chat */}
            <div className="bg-white/80 border border-white/90 rounded-2xl p-4 shadow-sm text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 block mb-2">
                Quick Vibe Reassurance Chips:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(moodResponses).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMood(m)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      selectedMood === m
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-indigo-100"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2.5 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100/70 italic">
                &quot;{moodResponses[selectedMood].text}&quot;
              </p>
            </div>

          </div>

        </div>
      </main>

      <footer className="text-center py-8 text-xs text-slate-400 border-t border-indigo-100">
        © 2026 JomLuah — Your Safe Space to Express &amp; Reflect
      </footer>

      <style jsx global>{`
        .combo-root {
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
