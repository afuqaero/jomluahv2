"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkle, 
  ArrowRight, 
  ChatCircleDots, 
  Notebook, 
  ClockCounterClockwise, 
  LockSimple, 
  ShieldCheck, 
  GraduationCap
} from "@phosphor-icons/react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F6] text-[#4a5568] flex flex-col relative overflow-hidden font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Background glowing decorations - soft light mode glows */}
      <div aria-hidden="true" className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)] pointer-events-none blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0%,transparent_70%)] pointer-events-none blur-3xl" />
      
      {/* Grid background overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat"
        style={{
          backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center border-b border-neutral-200/50 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-[#1a202c]">
            JomLuah
          </span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]">
            PCU
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-bold text-neutral-600 hover:text-neutral-900 transition"
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="text-xs font-bold uppercase tracking-wider bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-full shadow-lg shadow-[#6366F1]/20 transition hover:scale-105 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Headline and Pitch */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 shadow-sm">
            <GraduationCap className="w-4 h-4 text-[#6366F1]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              UTHM Psychological Counseling Unit (PCU)
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-[#1a202c]">
            Your Safe Space to <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Express & Reflect
            </span>
          </h2>

          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed max-w-xl">
            An intelligent emotional management companion designed for UTHM students. Log your mood, get AI-guided insights, and track your emotional spectrum in a fully secure space.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              href="/dashboard" 
              className="group bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              Enter Application 
              <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/login" 
              className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 shadow-sm px-8 py-4 rounded-full font-bold transition hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <LockSimple weight="duotone" className="w-4 h-4 text-[#6366F1]" /> Sign In Securely
            </Link>
          </div>

          {/* Security details badges */}
          <div className="pt-6 flex items-center gap-6 border-t border-neutral-200 text-neutral-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Sandbox RLS
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkle className="w-4 h-4 text-[#6366F1]" /> AI Insights Enabled
            </span>
          </div>
        </div>

        {/* Right Column: Premium Illustration Banner */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-full max-w-md bg-white border border-neutral-200/50 p-4 rounded-3xl shadow-xl shadow-neutral-100">
            {/* Ambient shadow/glow behind illustration card */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#6366F1]/10 to-transparent blur-xl rounded-3xl" />
            
            <img 
              src="/wellness_illustration.png" 
              alt="Mental Wellness Illustration" 
              className="w-full h-auto rounded-2xl object-cover hover:scale-[1.01] transition-transform duration-500"
            />
          </div>
        </div>
      </main>

      {/* Grid Features List */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 border-t border-neutral-200/60 bg-white/40 backdrop-blur-sm">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 text-left mb-6">
          // Platform Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: Companion AI */}
          <Link 
            href="/chat" 
            className="group p-6 rounded-3xl border border-neutral-200/50 bg-white hover:bg-neutral-50/50 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/20 shadow-sm hover:shadow-md text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6366F1] group-hover:scale-110 transition duration-300 mb-4">
              <ChatCircleDots weight="duotone" className="w-5.5 h-5.5" />
            </div>
            <h4 className="font-bold text-[#1a202c] text-base group-hover:text-[#6366F1] transition">
              Companion AI
            </h4>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              Trained companion to support reflections, lead grounding practices, and provide emotional scaffolding.
            </p>
          </Link>

          {/* Module 2: Idea Board / Journal */}
          <Link 
            href="/journal" 
            className="group p-6 rounded-3xl border border-neutral-200/50 bg-white hover:bg-neutral-50/50 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/20 shadow-sm hover:shadow-md text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 group-hover:scale-110 transition duration-300 mb-4">
              <Notebook weight="duotone" className="w-5.5 h-5.5" />
            </div>
            <h4 className="font-bold text-[#1a202c] text-base group-hover:text-purple-600 transition">
              Private Journal
            </h4>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              Capture daily logs, categorize ideas into custom notebooks, and manage thoughts or actionable to-dos.
            </p>
          </Link>

          {/* Module 3: Memories */}
          <Link 
            href="/memories" 
            className="group p-6 rounded-3xl border border-neutral-200/50 bg-white hover:bg-neutral-50/50 transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/20 shadow-sm hover:shadow-md text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600 group-hover:scale-110 transition duration-300 mb-4">
              <ClockCounterClockwise weight="duotone" className="w-5.5 h-5.5" />
            </div>
            <h4 className="font-bold text-[#1a202c] text-base group-hover:text-pink-600 transition">
              Memories & Spectrum
            </h4>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              Revisit historical reflections, look back on past entries, and view emotional trends and metrics.
            </p>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between text-xs text-neutral-400 border-t border-neutral-200/50 gap-4 text-left">
        <div>
          <p className="font-bold text-neutral-600">DEVELOPER: Muhammad Afiq Bin Rudy Azmir (CI220139)</p>
          <p className="mt-0.5">SUPERVISOR: Dr Suhaila Binti Mohd Yasin (UTHM PCU)</p>
        </div>
        <div className="md:text-right flex flex-col justify-end">
          <p className="font-bold text-neutral-700">JomLuah - UTHM Student Support Platform</p>
          <p className="mt-0.5 text-[10px]">Securely connected to Supabase Cloud Instance</p>
        </div>
      </footer>
    </div>
  );
}
