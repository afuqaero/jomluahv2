"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkle,
  ArrowRight,
  ChatCircleDots,
  Notebook,
  ClockCounterClockwise,
  ShieldCheck,
  GraduationCap,
  Brain,
  Star,
  Heart,
  LockSimple,
} from "@phosphor-icons/react";

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPct = (clientX / innerWidth - 0.5) * 20;
      const yPct = (clientY / innerHeight - 0.5) * 20;
      heroRef.current.style.setProperty("--mouse-x", `${xPct}px`);
      heroRef.current.style.setProperty("--mouse-y", `${yPct}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="landing-root">
      {/* ── Animated background blobs ── */}
      <div aria-hidden="true" className="blob blob-1" />
      <div aria-hidden="true" className="blob blob-2" />
      <div aria-hidden="true" className="blob blob-3" />

      {/* ── Dot grid overlay ── */}
      <div aria-hidden="true" className="dot-grid" />

      {/* ══ HEADER ══ */}
      <header className="landing-header">
        <div className="header-inner">
          <div className="logo-group">
            <div className="logo-icon">
              <Brain weight="fill" className="w-4 h-4" />
            </div>
            <span className="logo-text">JomLuah</span>
            <span className="logo-badge">PCU</span>
          </div>
          <nav className="header-nav">
            <Link href="/login" className="nav-link">Sign In</Link>
            <Link href="/register" className="btn-primary-sm">
              Get Started <ArrowRight weight="bold" className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <main ref={heroRef} className="hero-section">
        {/* Left column */}
        <div className="hero-left">
          <div className="hero-badge">
            <GraduationCap weight="duotone" className="w-4 h-4 text-indigo-600" />
            <span>UTHM Psychological Counseling Unit (PCU)</span>
          </div>

          <h1 className="hero-headline">
            Your Safe Space to{" "}
            <span className="hero-gradient-text">
              Express &amp; Reflect
            </span>
          </h1>

          <p className="hero-subtext">
            An intelligent emotional management companion designed for UTHM students.
            Log your mood, get AI-guided insights, and track your emotional spectrum
            in a fully secure space.
          </p>

          <div className="hero-cta-group">
            <Link href="/register" className="btn-primary-lg">
              Get Started Free
              <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className="btn-glass-lg">
              <LockSimple weight="duotone" className="w-4 h-4 text-indigo-500" />
              Sign In Securely
            </Link>
          </div>

          {/* Trust badges */}
          <div className="trust-badges">
            <span className="trust-item">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Row-Level Security
            </span>
            <div className="trust-divider" />
            <span className="trust-item">
              <Sparkle weight="duotone" className="w-4 h-4 text-indigo-500" />
              AI Insights Enabled
            </span>
            <div className="trust-divider" />
            <span className="trust-item">
              <Star weight="fill" className="w-4 h-4 text-amber-400" />
              FYP 2025/2026
            </span>
          </div>
        </div>

        {/* Right column — illustration */}
        <div className="hero-right">
          {/* Floating decoration pills */}
          <div className="float-pill pill-1">
            <ChatCircleDots weight="duotone" className="w-4 h-4 text-indigo-500" />
            AI Companion
          </div>
          <div className="float-pill pill-2">
            <Heart weight="fill" className="w-4 h-4 text-pink-500" />
            Mood Logged
          </div>
          <div className="float-pill pill-3">
            <Sparkle weight="duotone" className="w-4 h-4 text-violet-500" />
            Insight Ready
          </div>

          {/* Illustration card */}
          <div className="illustration-card">
            <div className="illustration-glow" />
            <img
              src="/hero_illustration.png"
              alt="Student journaling mental wellness illustration"
              className="illustration-img"
            />
          </div>

          {/* Stat cards floating */}
          <div className="stat-card stat-card-mood">
            <div className="stat-card-dot bg-indigo-400" />
            <div>
              <p className="stat-card-label">Mood Index</p>
              <p className="stat-card-value text-indigo-700">8.4 / 10</p>
            </div>
          </div>
          <div className="stat-card stat-card-session">
            <div className="stat-card-dot bg-violet-400" />
            <div>
              <p className="stat-card-label">AI Sessions</p>
              <p className="stat-card-value text-violet-700">Active</p>
            </div>
          </div>
        </div>
      </main>

      {/* ══ FEATURES ══ */}
      <section className="features-section">
        <div className="features-inner">
          <div className="section-eyebrow">
            <div className="eyebrow-line" />
            <span>Platform Modules</span>
            <div className="eyebrow-line" />
          </div>

          <h2 className="section-title">Everything you need to thrive</h2>
          <p className="section-subtitle">
            Three integrated modules that work together to support your mental wellness journey.
          </p>

          <div className="feature-grid">
            {/* Card 1 */}
            <Link href="/chat" className="feature-card group">
              <div className="feature-card-glow glow-indigo" />
              <div className="feature-icon icon-indigo">
                <ChatCircleDots weight="duotone" className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Companion AI</h3>
              <p className="feature-desc">
                A trained AI companion to support reflections, lead grounding practices, and provide emotional scaffolding during difficult moments.
              </p>
              <div className="feature-link group-hover:text-indigo-600">
                Open Chat <ArrowRight weight="bold" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 2 */}
            <Link href="/journal" className="feature-card group feature-card-featured">
              <div className="feature-card-glow glow-violet" />
              <div className="feature-icon icon-violet">
                <Notebook weight="duotone" className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Private Journal</h3>
              <p className="feature-desc">
                Capture daily logs, categorize ideas into custom notebooks, and manage thoughts or actionable to-dos in your own private space.
              </p>
              <div className="feature-link group-hover:text-violet-600">
                Open Journal <ArrowRight weight="bold" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 3 */}
            <Link href="/memories" className="feature-card group">
              <div className="feature-card-glow glow-pink" />
              <div className="feature-icon icon-pink">
                <ClockCounterClockwise weight="duotone" className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Memories &amp; Spectrum</h3>
              <p className="feature-desc">
                Revisit historical reflections, look back on past entries, and visualize your emotional trends and wellbeing metrics over time.
              </p>
              <div className="feature-link group-hover:text-pink-600">
                View Memories <ArrowRight weight="bold" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section className="cta-banner">
        <div className="cta-banner-glow" />
        <div className="cta-inner">
          <h2 className="cta-title">Ready to start your journey?</h2>
          <p className="cta-sub">Join UTHM students who are already managing their emotional wellness with JomLuah.</p>
          <Link href="/register" className="btn-primary-lg cta-btn">
            Create Free Account
            <ArrowRight weight="bold" className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="landing-footer">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Secure · Sandboxed · Private
        </span>
        <span>© 2025 JomLuah PSM · UTHM PCU Integration</span>
      </footer>

      <style jsx>{`
        /* ─── Root ─────────────────────────────── */
        .landing-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 40%, #ede9fe 100%);
          color: #3730a3;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        /* ─── Background blobs ─────────────────── */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          animation: blobFloat 8s ease-in-out infinite alternate;
        }
        .blob-1 {
          width: 700px; height: 700px;
          top: -200px; left: -200px;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          animation-delay: 0s;
        }
        .blob-2 {
          width: 600px; height: 600px;
          bottom: -200px; right: -150px;
          background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
          animation-delay: 3s;
        }
        .blob-3 {
          width: 400px; height: 400px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%);
          animation-delay: 1.5s;
        }
        @keyframes blobFloat {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.05); }
        }
        .blob-3 { animation-name: blobPulse; }
        @keyframes blobPulse {
          from { transform: translate(-50%, -50%) scale(1); }
          to   { transform: translate(-50%, -50%) scale(1.1); }
        }

        /* ─── Dot grid ─────────────────────────── */
        .dot-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none; z-index: 0;
        }

        /* ─── Header ───────────────────────────── */
        .landing-header {
          position: relative; z-index: 50;
          border-bottom: 1px solid rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .header-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 1.125rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .logo-group {
          display: flex; align-items: center; gap: 0.5rem;
        }
        .logo-icon {
          width: 32px; height: 32px; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.35);
        }
        .logo-text {
          font-size: 1.2rem; font-weight: 800; color: #1e1b4b; letter-spacing: -0.02em;
        }
        .logo-badge {
          font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
          padding: 0.15rem 0.5rem; border-radius: 999px;
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25);
          color: #6366f1; letter-spacing: 0.05em;
        }
        .header-nav { display: flex; align-items: center; gap: 1rem; }
        .nav-link {
          font-size: 0.875rem; font-weight: 600; color: #6b7280;
          text-decoration: none; transition: color 0.2s;
        }
        .nav-link:hover { color: #1e1b4b; }
        .btn-primary-sm {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.5rem 1.25rem; border-radius: 999px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: white; font-size: 0.8125rem; font-weight: 700;
          text-decoration: none; letter-spacing: 0.01em;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary-sm:hover {
          transform: scale(1.04); box-shadow: 0 6px 20px rgba(99,102,241,0.45);
        }

        /* ─── Hero ─────────────────────────────── */
        .hero-section {
          position: relative; z-index: 10;
          max-width: 1280px; margin: 0 auto;
          padding: 5rem 1.5rem 4rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem; align-items: center;
        }
        @media (max-width: 1024px) {
          .hero-section { grid-template-columns: 1fr; gap: 3rem; }
          .hero-right { order: -1; }
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.375rem 0.875rem; border-radius: 999px;
          background: rgba(255,255,255,0.65); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 2px 8px rgba(99,102,241,0.08);
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #4b5563; margin-bottom: 1.25rem;
        }
        .hero-headline {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900; line-height: 1.08;
          letter-spacing: -0.04em; color: #1e1b4b;
          margin-bottom: 1.25rem;
        }
        .hero-gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtext {
          font-size: 1.0625rem; color: #6b7280; line-height: 1.7;
          max-width: 520px; margin-bottom: 2rem;
        }
        .hero-cta-group {
          display: flex; flex-wrap: wrap; gap: 0.875rem; margin-bottom: 2rem;
        }
        .btn-primary-lg {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.9rem 1.75rem; border-radius: 999px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: white; font-size: 0.9375rem; font-weight: 700;
          text-decoration: none;
          box-shadow: 0 6px 24px rgba(99,102,241,0.40);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary-lg:hover {
          transform: scale(1.04); box-shadow: 0 10px 32px rgba(99,102,241,0.50);
        }
        .btn-glass-lg {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.9rem 1.75rem; border-radius: 999px;
          background: rgba(255,255,255,0.65); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.9);
          color: #374151; font-size: 0.9375rem; font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          transition: transform 0.2s, background 0.2s;
        }
        .btn-glass-lg:hover {
          transform: scale(1.03); background: rgba(255,255,255,0.85);
        }
        .trust-badges {
          display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem;
          padding-top: 1.5rem; border-top: 1px solid rgba(99,102,241,0.12);
        }
        .trust-item {
          display: flex; align-items: center; gap: 0.375rem;
          font-size: 0.75rem; font-weight: 600; color: #9ca3af;
        }
        .trust-divider { width: 1px; height: 14px; background: rgba(99,102,241,0.2); }

        /* ─── Hero right ────────────────────────── */
        .hero-right {
          position: relative; display: flex;
          align-items: center; justify-content: center;
        }
        .illustration-card {
          position: relative; border-radius: 2rem;
          background: rgba(255,255,255,0.55); backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255,255,255,0.85);
          box-shadow: 0 20px 60px rgba(99,102,241,0.15), 0 4px 16px rgba(0,0,0,0.06);
          padding: 1.5rem; overflow: hidden;
          transition: transform 0.4s;
        }
        .illustration-card:hover { transform: translateY(-6px); }
        .illustration-glow {
          position: absolute; inset: -1px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15), transparent);
          border-radius: inherit; z-index: 0;
        }
        .illustration-img {
          position: relative; z-index: 1;
          width: 100%; height: auto; border-radius: 1.25rem;
          display: block;
        }

        /* Floating pills */
        .float-pill {
          position: absolute; z-index: 20;
          display: flex; align-items: center; gap: 0.375rem;
          padding: 0.375rem 0.75rem; border-radius: 999px;
          background: rgba(255,255,255,0.80); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          font-size: 0.7rem; font-weight: 700; color: #374151;
          animation: pillFloat 4s ease-in-out infinite alternate;
        }
        .pill-1 { top: -12px; left: 5%; animation-delay: 0s; }
        .pill-2 { bottom: 10%; right: -10px; animation-delay: 1.5s; }
        .pill-3 { top: 40%; left: -14px; animation-delay: 0.8s; }
        @keyframes pillFloat {
          from { transform: translateY(0px); }
          to   { transform: translateY(-8px); }
        }

        /* Stat cards */
        .stat-card {
          position: absolute; z-index: 20;
          display: flex; align-items: center; gap: 0.625rem;
          padding: 0.625rem 1rem; border-radius: 1rem;
          background: rgba(255,255,255,0.80); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          animation: pillFloat 5s ease-in-out infinite alternate;
        }
        .stat-card-mood { bottom: -16px; left: 5%; animation-delay: 0.5s; }
        .stat-card-session { top: 12px; right: -8px; animation-delay: 2s; }
        .stat-card-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .stat-card-label { font-size: 0.65rem; font-weight: 600; color: #9ca3af; line-height: 1; margin-bottom: 2px; }
        .stat-card-value { font-size: 0.875rem; font-weight: 800; line-height: 1; }

        /* ─── Features section ─────────────────── */
        .features-section {
          position: relative; z-index: 10;
          border-top: 1px solid rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.35); backdrop-filter: blur(20px);
          padding: 5rem 1.5rem;
        }
        .features-inner { max-width: 1280px; margin: 0 auto; }
        .section-eyebrow {
          display: flex; align-items: center; gap: 0.75rem;
          justify-content: center; margin-bottom: 1rem;
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.12em; color: #6366f1;
        }
        .eyebrow-line {
          flex: 1; max-width: 80px; height: 1px;
          background: linear-gradient(to right, transparent, rgba(99,102,241,0.4));
        }
        .eyebrow-line:last-child {
          background: linear-gradient(to left, transparent, rgba(99,102,241,0.4));
        }
        .section-title {
          text-align: center; font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 900; color: #1e1b4b; letter-spacing: -0.03em;
          margin-bottom: 0.75rem;
        }
        .section-subtitle {
          text-align: center; color: #6b7280; font-size: 1rem;
          max-width: 520px; margin: 0 auto 3.5rem; line-height: 1.65;
        }
        .feature-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
        }
        @media (max-width: 768px) { .feature-grid { grid-template-columns: 1fr; } }
        @media (min-width: 640px) and (max-width: 1023px) { .feature-grid { grid-template-columns: repeat(2, 1fr); } }

        .feature-card {
          position: relative; overflow: hidden;
          padding: 2rem; border-radius: 1.75rem;
          background: rgba(255,255,255,0.55); backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255,255,255,0.85);
          box-shadow: 0 4px 24px rgba(99,102,241,0.07);
          text-decoration: none; display: block;
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(99,102,241,0.16);
          border-color: rgba(99,102,241,0.3);
        }
        .feature-card-featured {
          border-color: rgba(139,92,246,0.3);
          background: rgba(255,255,255,0.70);
        }
        .feature-card-glow {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 999px 999px 0 0;
        }
        .glow-indigo { background: linear-gradient(to right, transparent, #6366f1, transparent); }
        .glow-violet { background: linear-gradient(to right, transparent, #8b5cf6, transparent); }
        .glow-pink   { background: linear-gradient(to right, transparent, #ec4899, transparent); }

        .feature-icon {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.25rem;
          transition: transform 0.3s;
        }
        .feature-card:hover .feature-icon { transform: scale(1.1) rotate(-4deg); }
        .icon-indigo { background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); color: #6366f1; }
        .icon-violet { background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.2); color: #8b5cf6; }
        .icon-pink   { background: rgba(236,72,153,0.10); border: 1px solid rgba(236,72,153,0.2); color: #ec4899; }

        .feature-title {
          font-size: 1.0625rem; font-weight: 800; color: #1e1b4b;
          margin-bottom: 0.5rem; letter-spacing: -0.015em;
        }
        .feature-desc {
          font-size: 0.875rem; color: #6b7280; line-height: 1.65;
          margin-bottom: 1.25rem;
        }
        .feature-link {
          display: inline-flex; align-items: center; gap: 0.25rem;
          font-size: 0.8125rem; font-weight: 700; color: #9ca3af;
          transition: color 0.2s, gap 0.2s;
        }
        .feature-card:hover .feature-link { gap: 0.5rem; }

        /* ─── CTA Banner ───────────────────────── */
        .cta-banner {
          position: relative; z-index: 10;
          padding: 5rem 1.5rem; overflow: hidden;
          background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08));
          border-top: 1px solid rgba(255,255,255,0.6);
        }
        .cta-banner-glow {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 300px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%);
          filter: blur(40px); pointer-events: none;
        }
        .cta-inner {
          position: relative; z-index: 1;
          max-width: 640px; margin: 0 auto; text-align: center;
        }
        .cta-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900; color: #1e1b4b; letter-spacing: -0.03em;
          margin-bottom: 0.75rem;
        }
        .cta-sub {
          color: #6b7280; font-size: 1rem; line-height: 1.65; margin-bottom: 2rem;
        }
        .cta-btn { margin: 0 auto; }

        /* ─── Footer ───────────────────────────── */
        .landing-footer {
          position: relative; z-index: 10;
          border-top: 1px solid rgba(99,102,241,0.1);
          padding: 1.25rem 1.5rem;
          display: flex; flex-wrap: wrap;
          align-items: center; justify-content: space-between;
          gap: 0.75rem;
          font-size: 0.7rem; font-weight: 600; color: #9ca3af;
          background: rgba(255,255,255,0.45); backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
