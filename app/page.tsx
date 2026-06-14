"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import {
  Sparkle,
  ArrowRight,
  ChatCircleDots,
  ChatsCircle,
  NotePencil,
  Rainbow,
  Heart,
} from "@phosphor-icons/react";
import { GroundBlob, CloudShape, TwinkleSparkle, PlantShape } from "./components/illustrations/Decor";
import { MascotSitting, MascotSmall, MascotWave, MascotJournaling } from "./components/illustrations/Mascot";
import { useScrollReveal } from "./lib/useScrollReveal";

export default function LandingPage() {
  useScrollReveal();

  return (
    <div className="page1-root">
      {/* ── Animated background blobs ── */}
      <div aria-hidden="true" className="blob blob-1" />
      <div aria-hidden="true" className="blob blob-2" />

      {/* ── Dot grid overlay ── */}
      <div aria-hidden="true" className="dot-grid" />

      {/* ══ PILL NAV ══ */}
      <div className="pill-nav-wrap">
        <nav className="pill-nav">
          <Link href="/" className="pill-logo">
            <span className="logo-icon">
              <Sparkle weight="fill" className="w-4 h-4" />
            </span>
            <span className="logo-text">JomLuah</span>
          </Link>
          <div className="pill-links">
            <a href="#scene" className="pill-link">Companions</a>
            <a href="#features" className="pill-link">Features</a>
            <Link href="/login" className="pill-link">Sign In</Link>
          </div>
          <Link href="/register" className="pill-cta">
            Get Started
            <ArrowRight weight="bold" className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </div>

      {/* ══ HERO ══ */}
      <main className="hero1">
        <CloudShape className="p1-side-deco p1-side-cloud-l animate-float-slow" />
        <CloudShape className="p1-side-deco p1-side-cloud-r animate-float-delayed" />
        <TwinkleSparkle gradientId="sparkleHeroL" className="p1-side-deco p1-side-sparkle-l animate-twinkle" />
        <TwinkleSparkle gradientId="sparkleHeroR" className="p1-side-deco p1-side-sparkle-r animate-twinkle" />

        <div className="hero1-badge reveal" style={{ "--reveal-delay": "0s" } as CSSProperties}>
          <Sparkle weight="duotone" className="w-3.5 h-3.5" />
          A safe space, made for UTHM students
        </div>

        <h1 className="hero1-headline reveal" style={{ "--reveal-delay": "0.08s" } as CSSProperties}>
          Take a breath.
          <br />
          You&apos;re <span className="hero1-gradient">doing better</span> than you think.
        </h1>

        <p className="hero1-subtext reveal" style={{ "--reveal-delay": "0.16s" } as CSSProperties}>
          JomLuah pairs a friendly AI companion with a private journal, so you can
          check in, reflect, and grow — one gentle day at a time.
        </p>

        <div className="hero1-cta-group reveal" style={{ "--reveal-delay": "0.24s" } as CSSProperties}>
          <Link href="/register" className="btn-primary-lg">
            Start for Free
            <ArrowRight weight="bold" className="w-4 h-4" />
          </Link>
          <Link href="/login" className="btn-glass-lg">
            Sign In
          </Link>
        </div>

        <div className="hero1-illustration-wrap">
          <MascotJournaling className="hero1-illustration reveal reveal-scale" style={{ "--reveal-delay": "0.32s" } as CSSProperties} />
        </div>
      </main>

      {/* ══ CHARACTER SCENE ══ */}
      <section className="scene-section" id="scene">
        <div className="scene-stage reveal reveal-scale">
          <CloudShape className="p1-scene-cloud p1-cloud-1 animate-float-slow" />
          <CloudShape className="p1-scene-cloud p1-cloud-2 animate-float-delayed" />
          <TwinkleSparkle gradientId="sparkleScene1" className="p1-scene-sparkle p1-sparkle-1 animate-twinkle" />
          <TwinkleSparkle gradientId="sparkleScene2" className="p1-scene-sparkle p1-sparkle-2 animate-twinkle" />

          <div className="float-pill pill-mood">
            <Heart weight="fill" className="w-4 h-4 text-pink-500" />
            Mood logged
          </div>
          <div className="float-pill pill-ai">
            <ChatCircleDots weight="duotone" className="w-4 h-4 text-indigo-500" />
            AI companion online
          </div>

          <div className="scene-ground">
            <GroundBlob className="p1-ground-svg" />
          </div>

          <PlantShape className="p1-scene-plant p1-plant-left" />
          <PlantShape className="p1-scene-plant p1-plant-right" />

          <MascotSmall className="p1-scene-mascot p1-mascot-left animate-float-slow" />
          <MascotSmall flip className="p1-scene-mascot p1-mascot-right animate-float-delayed" />
          <MascotSitting className="p1-scene-mascot p1-mascot-main" />

          <div className="scene-board">
            <div className="board-stand" />
            <div className="board-face">
              <p className="board-title">Today&apos;s check-in</p>
              <div className="board-row"><span className="board-dot dot-indigo" />Mood: Calm</div>
              <div className="board-row"><span className="board-dot dot-violet" />Streak: 5 days</div>
              <div className="board-row"><span className="board-dot dot-sky" />AI chat: Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="features-section" id="features">
        <PlantShape className="p1-side-deco p1-side-plant-l animate-float-slow" />
        <PlantShape className="p1-side-deco p1-side-plant-r animate-float-delayed" />

        <div className="features-inner">
          <div className="section-eyebrow reveal">
            <div className="eyebrow-line" />
            <span>What&apos;s inside</span>
            <div className="eyebrow-line" />
          </div>

          <h2 className="section-title reveal" style={{ "--reveal-delay": "0.05s" } as CSSProperties}>
            Everything you need to feel a little lighter
          </h2>
          <p className="section-subtitle reveal" style={{ "--reveal-delay": "0.1s" } as CSSProperties}>
            Three friendly modules that work together to support your daily wellness journey.
          </p>

          <div className="feature-grid">
            <Link
              href="/chat"
              className="feature-card feature-card-chat group reveal reveal-left"
              style={{ "--reveal-delay": "0s" } as CSSProperties}
            >
              <div className="feature-card-glow glow-indigo" />
              <div className="feature-icon icon-indigo">
                <ChatsCircle weight="duotone" className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Companion AI</h3>
              <p className="feature-desc">
                A warm AI companion that listens, asks thoughtful questions, and
                gently guides you through moments that feel heavy.
              </p>
              <div className="mini-chat" aria-hidden="true">
                <span className="mini-chat-bubble from-user">How was your day?</span>
                <span className="mini-chat-bubble from-ai">Better than yesterday — proud of you.</span>
              </div>
              <div className="feature-link group-hover:text-indigo-600">
                Open Chat <ArrowRight weight="bold" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/journal"
              className="feature-card feature-card-journal group feature-card-featured reveal"
              style={{ "--reveal-delay": "0.1s" } as CSSProperties}
            >
              <div className="feature-card-glow glow-violet" />
              <span className="feature-badge">Most loved</span>
              <div className="feature-icon icon-violet">
                <NotePencil weight="duotone" className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Private Journal</h3>
              <p className="feature-desc">
                Jot down your day, sort thoughts into cozy folders, and turn
                ideas into simple to-dos — all kept just for you.
              </p>
              <div className="mini-tags" aria-hidden="true">
                <span className="mini-tag mini-tag-violet">Mood</span>
                <span className="mini-tag mini-tag-indigo">Gratitude</span>
                <span className="mini-tag mini-tag-pink">To-do</span>
              </div>
              <div className="feature-link group-hover:text-indigo-600">
                Open Journal <ArrowRight weight="bold" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/memories"
              className="feature-card feature-card-memory group reveal reveal-right"
              style={{ "--reveal-delay": "0.2s" } as CSSProperties}
            >
              <div className="feature-card-glow glow-pink" />
              <div className="feature-icon icon-pink">
                <Rainbow weight="duotone" className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Memories &amp; Spectrum</h3>
              <p className="feature-desc">
                Look back on past entries and watch your emotional spectrum
                shift over time — small wins, visualized.
              </p>
              <div className="mini-spectrum" aria-hidden="true">
                <div className="mini-spectrum-bar">
                  <span className="mini-spectrum-dot" />
                </div>
                <div className="mini-spectrum-labels">
                  <span>Low</span>
                  <span>Bright</span>
                </div>
              </div>
              <div className="feature-link group-hover:text-blue-600">
                View Memories <ArrowRight weight="bold" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section className="cta-banner">
        <div className="cta-banner-glow" />
        <MascotWave className="p1-side-deco p1-side-mascot animate-float-slow" />
        <div className="cta-inner reveal reveal-scale">
          <h2 className="cta-title">Ready to feel lighter?</h2>
          <p className="cta-sub">
            Join UTHM students who are already checking in with JomLuah every day.
          </p>
          <Link href="/register" className="btn-primary-lg cta-btn">
            Create Free Account
            <ArrowRight weight="bold" className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="landing-footer">
        <span>© 2026 feeqazmir</span>
      </footer>

      <style jsx global>{`
        /* ─── Root ─────────────────────────────── */
        .page1-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #dbeafe 100%);
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
          will-change: transform;
          transform: translateZ(0);
        }
        .blob-1 {
          width: 700px; height: 700px;
          top: -220px; left: -200px;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          animation-delay: 0s;
        }
        .blob-2 {
          width: 600px; height: 600px;
          bottom: -200px; right: -150px;
          background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
          animation-delay: 3s;
        }
        @keyframes blobFloat {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.05); }
        }

        /* ─── Dot grid ─────────────────────────── */
        .dot-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none; z-index: 0;
        }

        /* ─── Pill nav ─────────────────────────── */
        .pill-nav-wrap {
          position: sticky; top: 1rem; z-index: 50;
          padding: 0 1.5rem;
          display: flex; justify-content: center;
          transform: translateZ(0);
        }
        .pill-nav {
          width: 100%; max-width: 880px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem;
          padding: 0.625rem 0.625rem 0.625rem 1.25rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.65); backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 8px 32px rgba(99,102,241,0.12);
        }
        .pill-logo {
          display: flex; align-items: center; gap: 0.5rem;
          text-decoration: none;
        }
        .logo-icon {
          width: 32px; height: 32px; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          display: flex; align-items: center; justify-content: center;
          color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.35);
          flex-shrink: 0;
        }
        .logo-text {
          font-size: 1.1rem; font-weight: 800; color: #1e1b4b; letter-spacing: -0.02em;
        }
        .pill-links { display: flex; align-items: center; gap: 1.5rem; }
        .pill-link {
          font-size: 0.875rem; font-weight: 700; color: #4b5563;
          text-decoration: none; transition: color 0.2s;
        }
        .pill-link:hover { color: #1e1b4b; }
        .pill-cta {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.625rem 1.25rem; border-radius: 999px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white; font-size: 0.8125rem; font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .pill-cta:hover { transform: scale(1.04); box-shadow: 0 6px 20px rgba(99,102,241,0.45); }
        @media (max-width: 768px) { .pill-links { display: none; } }

        /* ─── Hero ─────────────────────────────── */
        .hero1 {
          position: relative; z-index: 10;
          max-width: 880px; margin: 0 auto;
          padding: 4rem 1.5rem 1rem;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .hero1-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.375rem 1rem; border-radius: 999px;
          background: rgba(255,255,255,0.65); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 2px 8px rgba(99,102,241,0.08);
          font-size: 0.75rem; font-weight: 700; color: #6366f1;
          margin-bottom: 1.5rem;
        }
        .hero1-headline {
          font-size: clamp(2.75rem, 7vw, 4.75rem);
          font-weight: 900; line-height: 1.1;
          letter-spacing: -0.04em; color: #1e1b4b;
          margin-bottom: 1.25rem;
        }
        .hero1-gradient {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3b82f6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero1-subtext {
          font-size: 1.0625rem; color: #6b7280; line-height: 1.7;
          max-width: 540px; margin-bottom: 2rem;
        }
        .hero1-cta-group {
          display: flex; flex-wrap: wrap; gap: 0.875rem; justify-content: center;
        }
        .hero1-illustration {
          width: clamp(220px, 28vw, 320px);
          aspect-ratio: 280 / 240;
          margin: 2.5rem auto 0;
        }
        @media (min-width: 1440px) {
          .hero1-illustration-wrap {
            position: absolute;
            top: 50%;
            right: -270px;
            transform: translateY(-50%);
            z-index: 2;
            pointer-events: none;
          }
          .hero1-illustration {
            width: clamp(220px, 16vw, 280px);
            margin: 0;
            pointer-events: auto;
          }
        }
        .btn-primary-lg {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.9rem 1.75rem; border-radius: 999px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
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

        /* ─── Character scene ───────────────────── */
        .scene-section {
          position: relative; z-index: 5;
          padding: 1.5rem 1.5rem 4rem;
        }
        .scene-stage {
          position: relative; max-width: 1100px; margin: 0 auto;
          height: clamp(380px, 60vw, 480px);
        }
        .scene-ground {
          position: absolute; left: 0; right: 0; bottom: 0; height: 58%;
          z-index: 0;
          filter: drop-shadow(0 -12px 32px rgba(99,102,241,0.18));
        }

        .scene-board {
          position: absolute; left: 4%; bottom: 8%; z-index: 3;
          display: flex; flex-direction: column; align-items: flex-start;
        }
        .board-stand {
          width: 6px; height: 46px; margin-left: 18px;
          background: #c7d2fe; border-radius: 4px;
        }
        .board-face {
          margin-top: -4px; padding: 0.9rem 1.1rem; border-radius: 1rem;
          background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 8px 24px rgba(99,102,241,0.15);
          min-width: 165px;
        }
        .board-title { font-size: 0.75rem; font-weight: 800; color: #1e1b4b; margin-bottom: 0.5rem; }
        .board-row {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.7rem; font-weight: 600; color: #6b7280; margin-bottom: 0.3rem;
        }
        .board-row:last-child { margin-bottom: 0; }
        .board-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .dot-indigo { background: #6366f1; }
        .dot-violet { background: #4f46e5; }
        .dot-sky { background: #38bdf8; }

        /* Floating pills */
        .float-pill {
          position: absolute; z-index: 6;
          display: flex; align-items: center; gap: 0.375rem;
          padding: 0.375rem 0.75rem; border-radius: 999px;
          background: rgba(255,255,255,0.80); backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          font-size: 0.7rem; font-weight: 700; color: #374151;
          animation: pillFloat 4s ease-in-out infinite alternate;
          will-change: transform;
        }
        .pill-mood { top: 6%; left: 4%; animation-delay: 0s; }
        .pill-ai { bottom: 36%; right: 2%; animation-delay: 1.5s; }
        @keyframes pillFloat {
          from { transform: translateY(0px); }
          to   { transform: translateY(-8px); }
        }

        @media (max-width: 768px) {
          .scene-board, .pill-ai { display: none; }
        }

        /* ─── Features section ─────────────────── */
        .features-section {
          position: relative; z-index: 10;
          border-top: 1px solid rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.35); backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 5rem 1.5rem;
          overflow: hidden;
        }
        .features-inner { max-width: 1280px; margin: 0 auto; position: relative; z-index: 1; }
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
          -webkit-backdrop-filter: blur(20px);
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
          border-color: rgba(79,70,229,0.3);
          background: rgba(255,255,255,0.70);
        }
        .feature-card-glow {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 999px 999px 0 0;
        }
        .glow-indigo { background: linear-gradient(to right, transparent, #6366f1, transparent); }
        .glow-violet { background: linear-gradient(to right, transparent, #4f46e5, transparent); }
        .glow-pink   { background: linear-gradient(to right, transparent, #3b82f6, transparent); }

        .feature-icon {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.25rem;
          transition: transform 0.3s;
        }
        .feature-card:hover .feature-icon { transform: scale(1.1) rotate(-4deg); }
        .icon-indigo { background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); color: #6366f1; }
        .icon-violet { background: rgba(79,70,229,0.12); border: 1px solid rgba(79,70,229,0.2); color: #4f46e5; }
        .icon-pink   { background: rgba(59,130,246,0.10); border: 1px solid rgba(59,130,246,0.2); color: #3b82f6; }

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

        /* ─── Feature card variants ────────────── */
        .feature-card-chat {
          background: rgba(255,255,255,0.55);
        }
        .feature-card-memory {
          background:
            radial-gradient(circle at 110% 110%, rgba(59,130,246,0.10), transparent 60%),
            rgba(255,255,255,0.55);
        }
        .feature-card-journal {
          padding-top: 2.5rem;
        }
        @media (min-width: 1024px) {
          .feature-card-journal {
            transform: translateY(-0.75rem);
          }
          .feature-card-journal:hover {
            transform: translateY(-1.5rem);
          }
        }

        .feature-badge {
          position: absolute; top: 1.5rem; right: 1.5rem;
          font-size: 0.65rem; font-weight: 800; letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.3rem 0.65rem; border-radius: 999px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          box-shadow: 0 4px 12px rgba(79,70,229,0.35);
        }

        /* Companion AI — mini chat preview */
        .mini-chat {
          display: flex; flex-direction: column; gap: 0.4rem;
          margin-bottom: 1.25rem;
        }
        .mini-chat-bubble {
          max-width: 88%;
          padding: 0.5rem 0.8rem;
          border-radius: 0.9rem;
          font-size: 0.7rem; font-weight: 600; line-height: 1.4;
        }
        .mini-chat-bubble.from-user {
          align-self: flex-end;
          background: rgba(99,102,241,0.10);
          color: #4338ca;
          border-radius: 0.9rem 0.9rem 0.25rem 0.9rem;
        }
        .mini-chat-bubble.from-ai {
          align-self: flex-start;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff;
          border-radius: 0.9rem 0.9rem 0.9rem 0.25rem;
        }

        /* Private Journal — mini tag chips */
        .mini-tags {
          display: flex; flex-wrap: wrap; gap: 0.4rem;
          margin-bottom: 1.25rem;
        }
        .mini-tag {
          font-size: 0.7rem; font-weight: 700;
          padding: 0.3rem 0.7rem; border-radius: 999px;
        }
        .mini-tag-violet { background: rgba(79,70,229,0.12); color: #4f46e5; }
        .mini-tag-indigo { background: rgba(99,102,241,0.12); color: #4f46e5; }
        .mini-tag-pink   { background: rgba(59,130,246,0.12); color: #2563eb; }

        /* Memories & Spectrum — mini mood spectrum */
        .mini-spectrum { margin-bottom: 1.25rem; }
        .mini-spectrum-bar {
          position: relative;
          height: 8px; border-radius: 999px;
          background: linear-gradient(to right, #f87171, #fbbf24, #34d399, #38bdf8, #818cf8);
        }
        .mini-spectrum-dot {
          position: absolute; top: 50%; left: 68%;
          width: 16px; height: 16px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #4f46e5;
          box-shadow: 0 2px 6px rgba(79,70,229,0.35);
        }
        .mini-spectrum-labels {
          display: flex; justify-content: space-between;
          margin-top: 0.4rem;
          font-size: 0.65rem; font-weight: 700; color: #9ca3af;
        }

        /* ─── CTA Banner ───────────────────────── */
        .cta-banner {
          position: relative; z-index: 10;
          padding: 5rem 1.5rem; overflow: hidden;
          background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(59,130,246,0.08));
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
          padding: 1.25rem 1.5rem 4rem;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 600; color: #9ca3af;
          background: rgba(255,255,255,0.45); backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
