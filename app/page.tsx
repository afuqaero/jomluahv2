"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowUpRight, 
  MessageSquare, 
  BookOpen, 
  History, 
  HeartHandshake, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Phone,
  Globe,
  Clock,
  Lock,
  LineChart,
  UserCheck
} from "lucide-react";

export default function LandingPage() {
  const [activeModule, setActiveModule] = useState(0);

  const modules = [
    {
      title: "Empathetic Chat",
      color: "bg-rose-50 border-rose-100 text-rose-700",
      icon: (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="chatGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
          </defs>
          {/* Main Bubble */}
          <rect x="6" y="8" width="48" height="38" rx="16" fill="url(#chatGrad)" />
          {/* Tail */}
          <path d="M16 45 L24 54 L32 45 Z" fill="#F43F5E" />
          {/* Accent dot/sparkle */}
          <circle cx="46" cy="40" r="10" fill="#FFE4E6" />
          <path d="M46 36 L48 40 L52 40 L48 42 L46 46 L44 42 L40 40 L44 40 Z" fill="#F43F5E" />
          {/* Inner cute chat lines */}
          <rect x="16" y="20" width="28" height="4" rx="2" fill="white" fillOpacity="0.8" />
          <rect x="16" y="28" width="18" height="4" rx="2" fill="white" fillOpacity="0.8" />
        </svg>
      ),
      desc: "Talk with an AI trained to listen and guide reflection without judgment."
    },
    {
      title: "Private Journaling",
      color: "bg-indigo-50 border-indigo-100 text-indigo-700",
      icon: (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bookGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          {/* Book Base / Cover */}
          <rect x="8" y="6" width="48" height="52" rx="14" fill="url(#bookGrad)" />
          {/* Page stack */}
          <rect x="12" y="10" width="40" height="44" rx="10" fill="white" />
          {/* Cute ribbon bookmark */}
          <path d="M22 10 V32 L27 28 L32 32 V10 Z" fill="#6366F1" />
          {/* Journal details / cute lines */}
          <rect x="22" y="38" width="20" height="3" rx="1.5" fill="#E0E7FF" />
          <rect x="22" y="44" width="14" height="3" rx="1.5" fill="#E0E7FF" />
        </svg>
      ),
      desc: "Log your thoughts, moods, and attach mementos in your personal secure space."
    },
    {
      title: "Throwback Memories",
      color: "bg-sky-50 border-sky-100 text-sky-700",
      icon: (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="timeGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          {/* Main Bubble Outer */}
          <circle cx="32" cy="32" r="26" fill="url(#timeGrad)" />
          {/* Inner Light Face */}
          <circle cx="32" cy="32" r="20" fill="white" />
          {/* Hour Glass/Clock Hands */}
          <path d="M32 18 V32 L40 40" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
          {/* Sparkling stars around clock */}
          <circle cx="50" cy="18" r="5" fill="#E0F2FE" />
          <path d="M50 15 L51 17 L53 18 L51 19 L50 21 L49 19 L47 18 L49 17 Z" fill="#0284C7" />
        </svg>
      ),
      desc: "Revisit entries from last year to see how much you have grown over time."
    },
    {
      title: "Counselor Bridge",
      color: "bg-amber-50 border-amber-100 text-amber-700",
      icon: (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="heartGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {/* Rounded Shield or Heart */}
          <rect x="6" y="6" width="52" height="52" rx="20" fill="url(#heartGrad)" />
          {/* Outer Ring support */}
          <rect x="10" y="10" width="44" height="44" rx="16" stroke="white" strokeWidth="2.5" strokeDasharray="6 4" />
          {/* Center Heart Icon */}
          <path d="M32 44 L20 32 C14 26 22 14 32 24 C42 14 50 26 44 32 Z" fill="white" />
        </svg>
      ),
      desc: "Optionally share structured pre-session reports with Pusat Kaunseling UTHM."
    }
  ];

  const features = [
    {
      title: "Interactive AI Chat",
      badge: "Real-time Support",
      desc: "Conversations are structured through an AI companion that remembers context across sessions to gently support emotional clarity.",
      graphic: (
        <div className="relative w-full h-44 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden flex flex-col p-3 text-left">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-rose-400"></div>
            <span className="text-xs font-semibold text-slate-700">JomLuah Assistant</span>
            <span className="text-[10px] text-slate-400 ml-auto flex items-center gap-1"><Clock className="w-3 h-3" /> active</span>
          </div>
          <div className="space-y-2 flex-grow overflow-y-auto pr-1">
            <div className="bg-slate-100 text-slate-800 text-[11px] p-2 rounded-lg max-w-[85%] self-start rounded-tl-none font-sans leading-relaxed">
              I noticed you felt overwhelmed last week. How are you holding up today?
            </div>
            <div className="bg-indigo-600 text-white text-[11px] p-2 rounded-lg max-w-[85%] self-end ml-auto rounded-tr-none font-sans leading-relaxed">
              A bit better, but assignments are piling up. Trying to take it step by step.
            </div>
            <div className="bg-slate-100 text-slate-800 text-[11px] p-2 rounded-lg max-w-[85%] self-start rounded-tl-none font-sans leading-relaxed">
              That's a very healthy approach. Focus on the single step in front of you.
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Visual Mood Timeline",
      badge: "Self Awareness",
      desc: "Track your emotional states and patterns automatically without high cognitive overhead. Learn what triggers or stabilizes your mood.",
      graphic: (
        <div className="relative w-full h-44 bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-700">Weekly Stress Level</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Stable</span>
          </div>
          <div className="flex items-end justify-between h-20 px-2">
            <div className="flex flex-col items-center gap-1 w-full">
              <div className="w-4 bg-indigo-200 rounded-t h-12 hover:bg-indigo-400 transition-colors"></div>
              <span className="text-[9px] text-slate-400 font-medium">Mon</span>
            </div>
            <div className="flex flex-col items-center gap-1 w-full">
              <div className="w-4 bg-indigo-300 rounded-t h-16 hover:bg-indigo-400 transition-colors"></div>
              <span className="text-[9px] text-slate-400 font-medium">Tue</span>
            </div>
            <div className="flex flex-col items-center gap-1 w-full">
              <div className="w-4 bg-rose-300 rounded-t h-10 hover:bg-rose-400 transition-colors"></div>
              <span className="text-[9px] text-slate-400 font-medium">Wed</span>
            </div>
            <div className="flex flex-col items-center gap-1 w-full">
              <div className="w-4 bg-indigo-400 rounded-t h-20 hover:bg-indigo-500 transition-colors"></div>
              <span className="text-[9px] text-slate-400 font-medium">Thu</span>
            </div>
            <div className="flex flex-col items-center gap-1 w-full">
              <div className="w-4 bg-indigo-200 rounded-t h-8 hover:bg-indigo-400 transition-colors"></div>
              <span className="text-[9px] text-slate-400 font-medium">Fri</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 text-center border-t border-slate-100 pt-1.5 flex justify-center gap-3">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-400"></div> Stable</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-300"></div> High Stress</span>
          </div>
        </div>
      )
    },
    {
      title: "Secure Counselor Portal",
      badge: "Campus Integrated",
      desc: "Strictly secure and private by default. Access dynamic cognitive distortion logs and immediate emergency crisis alerts.",
      graphic: (
        <div className="relative w-full h-44 bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col justify-between text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-semibold text-slate-700">PCU Counselor Hub</span>
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="space-y-1.5 py-2">
            <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-700">Assigned Student Intake</span>
              <span className="text-[9px] font-bold text-indigo-600 flex items-center gap-0.5"><UserCheck className="w-3 h-3" /> Verified</span>
            </div>
            <div className="flex items-center justify-between bg-rose-50/50 p-1.5 rounded border border-rose-100">
              <span className="text-[10px] font-semibold text-rose-800">CBT Distortion Alert</span>
              <span className="text-[9px] font-bold text-rose-600 flex items-center gap-0.5"><ShieldAlert className="w-3 h-3" /> Flagged</span>
            </div>
          </div>
          <div className="text-[9px] text-slate-400 bg-white border border-slate-100 px-2 py-1 rounded text-center">
            *All personal notes are strictly encrypted in transit.
          </div>
        </div>
      )
    }
  ];

  const nextModule = () => {
    setActiveModule((prev) => (prev + 1) % modules.length);
  };

  const prevModule = () => {
    setActiveModule((prev) => (prev - 1 + modules.length) % modules.length);
  };

  return (
    <div className="w-full bg-[#FAF9F6] text-slate-900 font-sans min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm border border-indigo-700/10">
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 font-sans">JomLuah</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#about" className="hover:text-indigo-600 transition-colors">Overview</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#counseling" className="hover:text-indigo-600 transition-colors">Pusat Kaunseling</a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline-block text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
            PWA Enabled
          </span>
          <button className="flex items-center gap-2 text-sm font-bold bg-white text-slate-800 border border-slate-200 px-5 py-2.5 rounded-full hover:border-slate-300 active:scale-95 transition-all shadow-sm">
            Access App <ArrowUpRight className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-12 pb-24 overflow-hidden">
        {/* Floating Sparkles decorative */}
        <div className="absolute top-12 left-1/4 animate-bounce duration-1000 hidden md:block">
          <Sparkles className="w-6 h-6 text-indigo-400 opacity-60" />
        </div>
        <div className="absolute top-24 right-1/4 animate-pulse hidden md:block">
          <Sparkles className="w-8 h-8 text-amber-500 opacity-70" />
        </div>
        <div className="absolute bottom-12 left-10 hidden md:block">
          <Sparkles className="w-5 h-5 text-rose-400 opacity-60" />
        </div>

        <div className="w-full flex flex-col items-center text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100/80 px-4 py-2 rounded-full mb-8 shadow-xs">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></div>
            <span className="text-xs font-bold tracking-wide text-indigo-800 uppercase">Partnered with Pusat Kaunseling UTHM</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-800 max-w-4xl leading-[1.1] mb-12">
            Release Your{" "}
            <span className="relative inline-block text-indigo-600 px-3">
              Thoughts
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-400" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,7 C30,2 70,2 100,7" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            {" "}with Our AI Reflective Companion
          </h1>

          {/* Sub-headline & Call-To-Actions */}
          <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8 mt-4 border-t border-slate-200/80 pt-10 text-left">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Safe & Secure Space</p>
              <h3 className="text-2xl font-bold text-slate-800">100% Private Counseling Tech</h3>
              <p className="text-sm text-slate-500">Fully integrated pgvector semantic RAG memories.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 group">
                Express Yourself
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Slide / Grid of Main Modules */}
      <section className="w-full max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-800">Platform Core Modules</h2>
            <p className="text-sm text-slate-500">Designed to guide and support emotional awareness.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={prevModule}
              className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-slate-300 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextModule}
              className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-slate-300 active:scale-95 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Highlight view */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {modules.map((mod, idx) => (
            <div 
              key={idx}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between h-64 ${
                idx === activeModule 
                  ? "bg-white shadow-xl shadow-slate-100 border-indigo-200 scale-[1.02] relative z-10" 
                  : "bg-white/60 hover:bg-white border-slate-200/80"
              }`}
            >
              <div className="space-y-4 text-left">
                <div className={`text-slate-800 flex items-center`}>
                  {mod.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{mod.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{mod.desc}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400">Module 0{idx + 1}</span>
                <span className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1">
                  Explore <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-20">
        <div className="bg-white border border-slate-200/80 rounded-[40px] p-8 md:p-12 shadow-sm">
          <div className="w-full flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                Engineering Highlights
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Advanced System Workflow</h2>
            </div>
            <p className="text-sm text-slate-500 max-w-md text-left">
              How JomLuah translates simple student conversations and journaling entries into secure clinical insights for professional counselors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:bg-slate-50 transition-colors">
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-full">
                      {feat.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Step 0{idx + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{feat.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
                <div className="w-full mt-2">
                  {feat.graphic}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UTHM Counseling Statement Section */}
      <section id="counseling" className="w-full max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-slate-900 text-white rounded-[40px] p-8 md:p-16 relative overflow-hidden text-center shadow-lg shadow-slate-950/10">
          {/* Sparkles */}
          <div className="absolute top-10 left-10">
            <Sparkles className="w-6 h-6 text-amber-300 opacity-40 animate-pulse" />
          </div>
          <div className="absolute bottom-10 right-10">
            <Sparkles className="w-5 h-5 text-indigo-400 opacity-40 animate-pulse" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-full mb-8 inline-block">
            Pusat Kaunseling UTHM Integration
          </span>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-tight mb-8">
            Providing UTHM Students with Secure and Compassionate Care
          </h2>

          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-12">
            The platform is designed in collaboration with Pusat Kaunseling Universiti (PCU) to assist counselors in managing stress indices, cognitive distortions, and risk assessment parameters without breaking student trust.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 border-t border-white/10 pt-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-slate-300 font-medium">pcu@uthm.edu.my</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-slate-300 font-medium">+607-4537465</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-slate-300 font-medium">pcu.uthm.edu.my</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          </div>
          <span className="font-bold text-slate-700">JomLuah Tech • UTHM Final Year Project</span>
        </div>
        <div className="flex items-center gap-6">
          <span>Developer: Muhammad Afiq Bin Rudy Azmir (CI220139)</span>
          <span>Supervisor: Dr Suhaila Binti Mohd Yasin</span>
        </div>
        <div>
          <span>Archived 2026 • Under strict PCU Guidelines</span>
        </div>
      </footer>
    </div>
  );
}
