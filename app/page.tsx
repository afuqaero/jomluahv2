"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, LayoutDashboard, MessageSquare, BookOpen, History } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black font-mono border-4 md:border-8 border-black p-4 md:p-6 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b-4 border-black pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">[ JomLuah ]</h1>
          <p className="text-sm mt-1 text-neutral-600">// AI Emotional Management Assistant (UTHM PCU)</p>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition font-bold">
            LOGIN
          </Link>
          <Link href="/register" className="border-4 border-black px-4 py-2 hover:bg-black hover:text-white transition font-bold bg-white">
            REGISTER
          </Link>
        </div>
      </header>

      {/* Hero / Pitch */}
      <main className="my-12 flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="border-4 border-black p-8 space-y-6">
          <span className="border border-black px-2 py-1 text-xs uppercase font-bold bg-neutral-100">
            [ Project Pitch & Overview ]
          </span>
          <h2 className="text-3xl font-black uppercase">
            Let&apos;s Express: Safe, Private, and Intelligent Emotional Support
          </h2>
          <p className="text-sm leading-relaxed text-neutral-700">
            A Progressive Web Application (PWA) designed as an emotional management companion for UTHM students. Integrates AI reflection, secure journaling, and memory indexing.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link href="/dashboard" className="border-4 border-black bg-black text-white px-6 py-3 hover:bg-white hover:text-black transition font-bold flex items-center gap-2">
              ENTER APPLICATION <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Wireframe Modules Grid */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold uppercase tracking-wide">// Core Modules Wireframe Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Module 1 */}
            <Link href="/chat" className="border-2 border-black p-4 hover:bg-neutral-50 block transition group">
              <div className="flex justify-between items-center mb-2">
                <MessageSquare className="w-6 h-6" />
                <span className="text-xs font-bold">[ MODULE 01 ]</span>
              </div>
              <h4 className="font-bold uppercase group-hover:underline">Companion AI</h4>
              <p className="text-xs text-neutral-600 mt-1">AI trained to listen & guide reflection.</p>
            </Link>

            {/* Module 2 */}
            <Link href="/journal" className="border-2 border-black p-4 hover:bg-neutral-50 block transition group">
              <div className="flex justify-between items-center mb-2">
                <BookOpen className="w-6 h-6" />
                <span className="text-xs font-bold">[ MODULE 02 ]</span>
              </div>
              <h4 className="font-bold uppercase group-hover:underline">Private Journal</h4>
              <p className="text-xs text-neutral-600 mt-1">Log thoughts, moods, secure memory.</p>
            </Link>

            {/* Module 3 */}
            <Link href="/memories" className="border-2 border-black p-4 hover:bg-neutral-50 block transition group">
              <div className="flex justify-between items-center mb-2">
                <History className="w-6 h-6" />
                <span className="text-xs font-bold">[ MODULE 03 ]</span>
              </div>
              <h4 className="font-bold uppercase group-hover:underline">Memories</h4>
              <p className="text-xs text-neutral-600 mt-1">Revisit past entries and growth.</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black pt-6 flex flex-col md:flex-row justify-between text-xs text-neutral-500 gap-4">
        <div>
          <p>DEVELOPER: Muhammad Afiq Bin Rudy Azmir (CI220139)</p>
          <p>SUPERVISOR: Dr Suhaila Binti Mohd Yasin (UTHM PCU)</p>
        </div>
        <div className="text-right">
          <p>[ WIREFRAME LAYOUT - BLACK & WHITE ]</p>
          <p>Vercel Optimized // No Active Backend</p>
        </div>
      </footer>
    </div>
  );
}
