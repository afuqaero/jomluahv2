"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChatsCircle,
  Smiley,
} from "@phosphor-icons/react";

export function Design1LandingPage({ antiSlopPreview = false }: { antiSlopPreview?: boolean }) {
  const [activeScenario, setActiveScenario] = useState(0);
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const chatScenarios = [
    {
      label: "Assignment Stress",
      question: "I feel really overwhelmed with assignments tonight...",
      answer: "That sounds like a lot to carry. Let’s make it smaller: what’s one task you could work on for just ten minutes?",
    },
    {
      label: "Safe Venting",
      question: "I need to talk, but I’m worried you’ll judge me.",
      answer: "You can say what’s on your mind here. I’ll listen without judgment. What’s been weighing on you?",
    },
    {
      label: "Overthinking",
      question: "I keep replaying everything I said today.",
      answer: "That loop can feel exhausting. Let’s pause with one gentle question: what would you say to a friend in your situation?",
    },
  ];

  useEffect(() => {
    if (!antiSlopPreview || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setMotionPaused(true);
    setDisplayedAnswer(chatScenarios[activeScenario].answer);
  }, [activeScenario, antiSlopPreview]);

  useEffect(() => {
    if (!antiSlopPreview) return;
    const updateScrollState = () => setIsScrolled(window.scrollY > 12);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, [antiSlopPreview]);

  useEffect(() => {
    const answer = chatScenarios[activeScenario].answer;
    if (antiSlopPreview && motionPaused) {
      setDisplayedAnswer(answer);
      setIsTyping(false);
      return;
    }
    let characterIndex = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    setDisplayedAnswer("");
    setIsTyping(false);
    timers.push(setTimeout(() => setIsTyping(true), 1900));
    timers.push(setTimeout(() => {
      setIsTyping(false);
      const interval = setInterval(() => {
        characterIndex += 1;
        setDisplayedAnswer(answer.slice(0, characterIndex));
        if (characterIndex >= answer.length) {
          clearInterval(interval);
          timers.push(setTimeout(() => setActiveScenario((current) => (current + 1) % chatScenarios.length), 4200));
        }
      }, 28);
      timers.push(interval as unknown as ReturnType<typeof setTimeout>);
    }, 3100));

    return () => timers.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer as unknown as ReturnType<typeof setInterval>);
    });
  }, [activeScenario, antiSlopPreview, motionPaused]);

  return (
    <div className={`page1-root${antiSlopPreview ? " antislop-preview" : ""}`}>
      {/* ── Main Nav ── */}
      <div className="pill-nav-wrap">
        <nav className={`pill-nav${antiSlopPreview && isScrolled ? " is-scrolled" : ""}`}>
          <Link href="/" className="pill-logo">
            <span className="logo-text">JomLuah</span>
          </Link>
          <div className="pill-right-group">
            <a href="#features" className="pill-link">Features</a>
            {antiSlopPreview && <span className="preview-label">Design preview</span>}
            <Link href="/register" className="pill-cta">
              Start Free
              <ArrowRight weight="bold" className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </div>

      {/* ── Hero ── */}
      <main className="hero1">
        <div className="hero1-note" aria-hidden="true">You can<br />do this.</div>
        <div className="hero1-copy">
        <h1 className="hero1-headline">
          Take a breath. <br />
          You&apos;re <span className="hero1-gradient">doing better</span> than you think.
        </h1>

        <p className="hero1-subtext">
          JomLuah pairs a gentle AI companion with a private handwritten journal, so you can check in, vent, and reflect — one quiet moment at a time.
        </p>
        <div className="hero1-cta-group">
          <Link href="/register" className="btn-primary-lg">Create Free Account<ArrowRight weight="bold" className="w-4 h-4" /></Link>
          <Link href="/login" className="btn-glass-lg">Sign In</Link>
        </div>
        </div>
        <div className="hero1-visual">
        <div className="hero-chat-demo" aria-label="Looping conversation preview">
          <div className="hero-chat-header">
            <div className="hero-chat-brand">
              <span className="hero-chat-robot"><ChatsCircle weight="fill" /></span>
              <span><strong>JomLuah Companion AI</strong></span>
            </div>
          </div>
          <div className="hero-chat-messages" aria-live="off">
            <div className="hero-chat-question" key={`question-${activeScenario}`}><span>{chatScenarios[activeScenario].question}</span><b><Smiley weight="fill" /></b></div>
            {(isTyping || displayedAnswer) && <div className="hero-chat-response">
              <b className="hero-chat-robot small"><ChatsCircle weight="fill" /></b>
              {isTyping ? <span className="hero-chat-typing"><i /><i /><i /></span> : <span className="hero-chat-answer">{displayedAnswer}<i className="hero-chat-caret" /></span>}
            </div>}
          </div>
          <Link href="/chat" className="hero-chat-entry">Share what&apos;s on your mind... <span><ArrowRight weight="bold" /></span></Link>
          {antiSlopPreview && <div className="hero-chat-controls">
            <button type="button" onClick={() => setMotionPaused((paused) => !paused)} aria-pressed={motionPaused}>
              {motionPaused ? "Play conversation" : "Pause conversation"}
            </button>
          </div>}
        </div>
        </div>
      </main>

      {/* ── Features Section ── */}
      <section className="features-section mt-12" id="features">
        <div className="features-inner">
          <h2 className="section-title">Everything you need{" "}<span>to feel lighter</span></h2>
          <p className="section-subtitle">
            A supportive space to talk, reflect and understand how you feel — all in one place.
          </p>

          <div className="feature-showcase">
            <article className="feature-companion">
              <div className="feature-companion-copy">
                <div className="feature-heading">
                  <div className="feature-icon icon-indigo"><ChatsCircle weight="duotone" className="w-6 h-6" /></div>
                  <h3 className="feature-title">Companion AI</h3>
                </div>
                <p className="feature-desc">Chat about your thoughts, feelings or whatever&apos;s on your mind — anytime.</p>
                <Link href="/chat" className="feature-open-link" aria-label="Open Companion AI">
                  <ArrowRight weight="bold" className="w-4 h-4" />
                </Link>
              </div>
              <div className="feature-chat-preview" aria-label="Example conversation with Companion AI">
                <div className="feature-chat-messages">
                  <div className="feature-message feature-message-ai"><span className="feature-avatar"><Image src="/images/ai-companion-avatar.png" alt="" width={48} height={48} /></span><p className="feature-chat-bubble">Hey, I&apos;m here. What&apos;s on your mind today?</p></div>
                  <div className="feature-message feature-message-me"><p className="feature-chat-bubble">I&apos;ve been feeling really overwhelmed lately.</p></div>
                  <div className="feature-message feature-message-ai"><span className="feature-avatar"><Image src="/images/ai-companion-avatar.png" alt="" width={48} height={48} /></span><p className="feature-chat-bubble">That sounds really tough.<br />Want to tell me more about what&apos;s been happening?</p></div>
                </div>
              </div>
              <div className="feature-companion-art">
                <Image src="/images/companion-student.png" alt="A student finding a quiet moment to reflect" width={768} height={512} sizes="(max-width: 800px) 45vw, 300px" />
              </div>
            </article>

            <div className="feature-support-grid">
              <article className="feature-support feature-journal">
                <div className="feature-support-copy">
                  <div className="feature-heading">
                    <div className="feature-icon icon-violet"><Image src="/images/journal-feature-icon.svg" alt="" width={28} height={28} /></div>
                    <h3 className="feature-title">Private Journal</h3>
                  </div>
                  <p className="feature-desc">Write freely and keep your thoughts safe, always private.</p>
                </div>
                <Image className="journal-illustration" src="/images/journal-notepad.png" alt="" width={240} height={240} sizes="(max-width: 600px) 100px, 140px" />
              </article>

              <article className="feature-support feature-mood">
                <div className="feature-support-copy">
                  <div className="feature-heading">
                    <div className="feature-icon icon-pink"><Image src="/images/mood-feature-icon.svg" alt="" width={28} height={28} /></div>
                    <h3 className="feature-title">Mood Spectrum</h3>
                  </div>
                  <p className="feature-desc">Explore your emotional patterns over time.</p>
                  <Link href="/dashboard" className="feature-text-link" aria-label="Open Mood Spectrum"><ArrowRight weight="bold" className="w-4 h-4" /></Link>
                </div>
                <svg className="mood-chart" viewBox="0 0 160 94" role="img" aria-label="Illustration of moods changing over time">
                  <defs><linearGradient id="mood-area" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#82d7d3" stopOpacity=".32" /><stop offset="1" stopColor="#eff2ff" stopOpacity="0" /></linearGradient></defs>
                  <path d="M5 77 C25 77 26 45 45 49 S74 82 91 58 S117 12 145 27 L145 92 L5 92Z" fill="url(#mood-area)" />
                  <path d="M5 77 C25 77 26 45 45 49 S74 82 91 58 S117 12 145 27" fill="none" stroke="#6674fa" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="45" cy="49" r="5" fill="#7160f9" /><circle cx="91" cy="58" r="5" fill="#7c70f9" /><circle cx="117" cy="26" r="5" fill="#448fef" /><circle cx="145" cy="27" r="5" fill="#56b9af" />
                </svg>
              </article>
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
          position: sticky; top: 0; z-index: 40;
          width: 100%; display: flex;
        }
        .pill-nav {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.9rem clamp(1.25rem, 6vw, 5rem);
          background: rgba(255,255,255,0.78); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 8px 32px rgba(99,102,241,0.08);
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
          max-width: 1200px; margin: 0 auto; padding: 4rem 2rem 1rem; display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); align-items: center; gap: 3rem; text-align: left;
        }
        .hero1-copy { min-width: 0; }.hero1-visual { min-width: 0; }
        .hero1-headline {
          font-size: clamp(2.7rem, 5vw, 4.25rem); font-weight: 900; line-height: 1.1; color: #1e1b4b;
        }
        .hero1-gradient {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3b82f6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero1-subtext {
          font-size: 1.05rem; color: #4b5563; max-width: 580px; margin: 1rem 0; line-height: 1.7;
        }
        .hero-chat-demo { width: 100%; max-width: 560px; height: 375px; min-height: 0; margin: 1.5rem auto; padding: 25px 24px 0; display: flex; flex-direction: column; overflow: hidden; text-align: left; background: rgba(255,255,255,.94); border: 1px solid rgba(255,255,255,.95); border-radius: 24px; box-shadow: 0 18px 50px rgba(79,70,229,.12); }
        .hero-chat-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 13px; border-bottom: 1px solid #eef0f7; }
        .hero-chat-brand { display: flex; align-items: center; gap: 9px; flex-shrink: 0; }
        .hero-chat-robot { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 9px; background: #563bfa; color: white; font-size: 17px; box-shadow: 0 4px 10px #563bfa30; }
        .hero-chat-brand strong,.hero-chat-brand small { display: block; }
        .hero-chat-brand strong { color: #242044; font-size: 11px; }
        .hero-chat-brand small { margin-top: 3px; color: #10a779; font-size: 9px; font-weight: 700; }
        .hero-chat-brand small i { display: inline-block; width: 6px; height: 6px; margin-right: 4px; border-radius: 50%; background: #17c98b; animation: hero-status-pulse 1.5s infinite; }
        .hero-chat-topics { display: flex; gap: 5px; }
        .hero-chat-topics span { padding: 6px 9px; border-radius: 99px; background: #f1f4f8; color: #526078; font-size: 8px; font-weight: 700; white-space: nowrap; transition: background .25s,color .25s; }
        .hero-chat-topics span.active { background: #563bfa; color: white; }
        .hero-chat-messages { min-height: 0; flex: 1; padding: 20px 0; display: flex; flex-direction: column; justify-content: center; gap: 17px; overflow: hidden; }
        .hero-chat-question { display: flex; justify-content: flex-end; align-items: center; gap: 9px; animation: hero-message-in .45s ease-out both; }
        .hero-chat-question span { max-width: 82%; padding: 14px 16px; border-radius: 16px 4px 16px 16px; background: #563bfa; color: white; font-size: 14px; line-height: 1.55; box-shadow: 0 5px 12px #563bfa30; }
        .hero-chat-question b { display: grid; place-items: center; width: 28px; height: 28px; flex: 0 0 28px; border-radius: 50%; background: #e9eaff; color: #563bfa; font-size: 16px; }
        .hero-chat-response { display: flex; align-items: flex-start; gap: 9px; animation: hero-message-in .45s ease-out both; }
        .hero-chat-robot.small { width: 24px; height: 24px; flex: 0 0 24px; border-radius: 50%; font-size: 13px; }
        .hero-chat-typing,.hero-chat-answer { display: inline-flex; align-items: center; min-height: 44px; padding: 12px 15px; border-radius: 4px 15px 15px; background: #f1f4f8; color: #3d4660; font-size: 13px; line-height: 1.6; }
        .hero-chat-typing { gap: 5px; }
        .hero-chat-typing i { width: 7px; height: 7px; border-radius: 50%; background: #6864ff; animation: hero-dot-bounce .8s infinite ease-in-out; }
        .hero-chat-typing i:nth-child(2) { animation-delay: .12s; }.hero-chat-typing i:nth-child(3) { animation-delay: .24s; }
        .hero-chat-answer { display: block; max-width: 88%; }
        .hero-chat-caret { display: inline-block; width: 2px; height: 12px; margin-left: 2px; vertical-align: -2px; background: #6864ff; animation: hero-caret-blink .8s steps(2) infinite; }
        .hero-chat-footer { min-height: 52px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #eef0f7; color: #8a94a8; font-size: 10px; }
        .hero-chat-footer button { border: 0; background: none; color: #563bfa; font-size: 12px; font-weight: 700; cursor: pointer; }
        .hero-chat-footer button:hover { color: #3925cc; }
        @keyframes hero-message-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hero-dot-bounce { 0%,60%,100% { transform: translateY(0); opacity: .55; } 30% { transform: translateY(-4px); opacity: 1; } }
        @keyframes hero-caret-blink { to { opacity: 0; } }
        @keyframes hero-status-pulse { 50% { opacity: .35; } }
        @media (max-width: 600px) { .hero-chat-demo { height: 350px; padding: 18px 15px 0; border-radius: 20px; } .hero-chat-header { align-items: flex-start; flex-direction: column; } .hero-chat-messages { padding: 18px 0; } .hero-chat-question span { font-size: 13px; } .hero-chat-answer { font-size: 12px; } }
        @media (prefers-reduced-motion: reduce) { .hero-chat-demo *, .hero-chat-demo *::before, .hero-chat-demo *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; } }
        .hero1-cta-group { display: flex; gap: 1rem; justify-content: flex-start; flex-wrap: wrap; }
        .hero1-trust { display: flex; flex-direction: column; gap: 10px; margin-top: 28px; color: rgba(30,27,75,.7); font-size: 11px; font-weight: 600; }
        .hero1-trust span { display: flex; align-items: center; gap: 7px; }
        .hero1-trust svg { width: 15px; height: 15px; }
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
        .section-title { text-align: center; font-size: clamp(1.8rem, 3vw, 2.35rem); font-weight: 900; color: #1e1b4b; margin-top: 0.5rem; }
        .section-subtitle { max-width: 660px; margin: 0 auto 2rem; text-align: center; color: #6b7280; font-size: 0.98rem; line-height: 1.65; }
        .feature-showcase { display: grid; gap: 0.9rem; }
        .feature-companion { position: relative; min-height: 278px; display: grid; grid-template-columns: minmax(150px, .72fr) minmax(300px, 1.55fr) minmax(150px, .72fr); align-items: center; overflow: hidden; padding: 1.2rem 1.5rem; border: 1px solid #e4eafa; border-radius: 20px; background: #fff; }
        .feature-companion-copy { position: relative; z-index: 1; max-width: 215px; }
        .feature-heading { display: flex; align-items: center; gap: 0.75rem; }
        .feature-icon { flex: 0 0 auto; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 0; }
        .icon-indigo,.icon-violet,.icon-pink { background: #eef0ff; color: #563bfa; }
        .feature-title { margin: 0; font-size: 1.05rem; font-weight: 800; color: #1e1b4b; }
        .feature-desc { margin: 0.55rem 0 0.8rem; color: #5b6278; font-size: 0.86rem; line-height: 1.55; }
        .feature-open-link,.feature-chat-send { width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #563bfa; color: white; }
        .feature-open-link { text-decoration: none; }
        .feature-chat-preview { position: relative; z-index: 1; align-self: stretch; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 0.7rem; padding: 1rem 0.4rem; }
        .feature-chat-messages { display: grid; gap: 0.55rem; }
        .feature-chat-bubble { max-width: 88%; margin: 0; padding: 0.7rem 0.85rem; border-radius: 13px; color: #333b57; background: #f0f2f7; font-size: 0.76rem; line-height: 1.5; }
        .feature-chat-bubble-user { justify-self: start; border-bottom-left-radius: 4px; }
        .feature-chat-bubble-companion { justify-self: end; color: #fff; background: #563bfa; border-bottom-right-radius: 4px; }
        .feature-chat-input { min-height: 40px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.3rem 0.4rem 0.3rem 0.8rem; border: 1px solid #e0e5f0; border-radius: 999px; color: #8a91a5; font-size: 0.72rem; }
        .feature-chat-send { width: 32px; height: 32px; }
        .feature-companion-art { position: relative; align-self: stretch; min-width: 0; }
        .feature-companion-art img { position: absolute; right: -1.2rem; bottom: -1.8rem; width: min(125%, 330px); height: 112%; object-fit: contain; object-position: bottom right; }
        .feature-support-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.9rem; }
        .feature-support { min-width: 0; min-height: 164px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(90px, .72fr); align-items: center; gap: 0.75rem; padding: 1rem 1.2rem; border: 1px solid #e4eafa; border-radius: 17px; background: #fff; }
        .feature-support-copy { min-width: 0; }
        .feature-support .feature-icon { width: 40px; height: 40px; }
        .feature-support .feature-title { font-size: 0.98rem; }
        .feature-support .feature-desc { margin: 0.4rem 0 0.55rem; font-size: 0.78rem; }
        .feature-text-link { display: inline-flex; align-items: center; gap: 0.3rem; color: #563bfa; font-size: 0.75rem; font-weight: 700; text-decoration: none; }
        .journal-paper { position: relative; min-height: 116px; overflow: hidden; padding: 0.75rem 0.9rem; border-radius: 11px; background: #f6f4ed; color: #3b3834; font-family: var(--font-caveat), cursive; box-shadow: 0 1px 4px rgba(49,44,33,.08); }
        .journal-paper > span:first-child { color: #78746d; font-family: var(--font-plus-jakarta), sans-serif; font-size: 0.61rem; }
        .journal-paper p { max-width: 95%; margin: 0.35rem 0 0; font-size: 1rem; line-height: 1.3; }
        .journal-paper .journal-sprig { position: absolute; right: 0.7rem; bottom: 0.45rem; color: #6b9b92; font-family: sans-serif; font-size: 1.4rem; }
        .mood-slider-label { display: flex; justify-content: space-between; gap: 0.5rem; color: #49516a; font-size: 0.7rem; font-weight: 700; }
        .mood-slider-label span { color: #563bfa; }
        .mood-slider { display: block; width: 100%; margin-top: 0.35rem; accent-color: #563bfa; cursor: pointer; }
        .mood-chart { width: 100%; align-self: center; overflow: visible; }
        .feature-open-link:focus-visible,.feature-text-link:focus-visible { outline: 3px solid #563bfa; outline-offset: 4px; }
        .font-journal { font-family: var(--font-caveat), cursive; }
        .landing-footer { text-align: center; padding: 2rem; font-size: 0.75rem; color: #9ca3af; border-top: 1px solid rgba(99,102,241,0.1); }
        @media (max-width: 850px) { .hero1 { grid-template-columns: 1fr; gap: 1.5rem; padding: 3rem 1.5rem 1rem; } .hero1-copy { text-align: center; } .hero1-subtext { margin-inline: auto; } .hero1-cta-group { justify-content: center; } .hero1-trust { flex-direction: row; flex-wrap: wrap; justify-content: center; } .feature-companion { grid-template-columns: minmax(130px, .72fr) minmax(240px, 1.28fr); } .feature-companion-art { position: absolute; right: 0; bottom: 0; width: 28%; height: 56%; opacity: .72; } .feature-chat-preview { padding-right: 1.5rem; } }
        @media (max-width: 600px) { .hero1 { padding: 2.5rem 1rem 1rem; } .hero1-headline { font-size: clamp(2.4rem, 11vw, 3.4rem); } .features-section { padding: 3rem 1rem; } .section-subtitle { margin-bottom: 1.35rem; font-size: .9rem; } .feature-companion { min-height: auto; grid-template-columns: 1fr; gap: .6rem; padding: 1.2rem; } .feature-companion-copy { max-width: none; padding-right: 4rem; } .feature-companion-art { width: 36%; height: 42%; opacity: .38; } .feature-chat-preview { padding: 0; } .feature-chat-bubble { max-width: 94%; font-size: .73rem; } .feature-support-grid { grid-template-columns: 1fr; } .feature-support { min-height: 155px; padding: .9rem; } }
        .antislop-preview.page1-root { background: linear-gradient(112deg, #f1f4ff 0%, #e8edff 52%, #dce6ff 100%); }
        .antislop-preview .pill-nav { background: rgba(255,255,255,.82); backdrop-filter: blur(10px); border: 0; box-shadow: none; transition: background-color .2s ease; }
        .antislop-preview .pill-nav.is-scrolled { background: rgba(255,255,255,.62); }
        .antislop-preview .pill-cta,.antislop-preview .btn-primary-lg { background: #563bfa; box-shadow: none; }
        .antislop-preview .pill-cta { border-radius: 8px; }
        .antislop-preview .hero1-gradient { background: none; -webkit-text-fill-color: #563bfa; }
        .antislop-preview .hero-chat-demo { background: #fff; border-color: #e6e5ed; border-radius: 18px; box-shadow: 0 8px 24px rgba(34,30,65,.08); }
        .antislop-preview .hero-chat-robot,.antislop-preview .hero-chat-question span { background: #563bfa; box-shadow: none; }
        .antislop-preview .hero-chat-question b { background: #f0f2ff; color: #563bfa; }
        .antislop-preview .hero-chat-caret { animation: none; }
        .antislop-preview .hero-chat-controls { display: flex; justify-content: flex-end; padding: 0 0 12px; }
        .antislop-preview .hero-chat-controls button { min-height: 44px; padding: 0 12px; border: 1px solid #d8d6e5; border-radius: 8px; background: #fff; color: #393456; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
        .antislop-preview .hero-chat-controls button:hover { background: #f0eff6; }
        .antislop-preview .hero-chat-controls button:focus-visible,.antislop-preview a:focus-visible,.antislop-preview button:focus-visible,.antislop-preview input:focus-visible { outline: 3px solid #563bfa; outline-offset: 3px; }
        .antislop-preview .preview-label { color: #625f72; font-size: 12px; }
        .antislop-preview .features-section { background: #fff; backdrop-filter: none; border-color: #e7e6ef; }
        .antislop-preview .section-eyebrow { color: #563bfa; }
        .antislop-preview .eyebrow-line { background: #d7d4e7; }
        .antislop-preview .feature-companion,.antislop-preview .feature-support { border-color: #e7eaf4; box-shadow: none; }
        .antislop-preview .feature-support { border-radius: 15px; }
        .antislop-preview .feature-companion-art { opacity: 1; }
        .antislop-preview .feature-icon { background: #e8e4ff; color: #563bfa; }
        .antislop-preview .icon-violet,.antislop-preview .icon-pink { background: #f0f3ff; color: #563bfa; }
        .antislop-preview .bg-indigo-600 { background-color: #563bfa; }
        .antislop-preview .border-indigo-600 { border-color: #563bfa; }
        .antislop-preview .hover\\:border-indigo-300:hover { border-color: #a99cff; }
        .antislop-preview .text-indigo-600 { color: #563bfa; }
        .antislop-preview .bg-indigo-950 { background-color: #21146f; }
        .antislop-preview .text-indigo-300 { color: #cfc7ff; }
        .antislop-preview .text-indigo-100 { color: #f2f0ff; }
        .antislop-preview .bg-indigo-100 { background-color: #e8e4ff; }
        .antislop-preview .text-indigo-800 { color: #21146f; }
        .antislop-preview input[type="range"] { accent-color: #563bfa; }
        .antislop-preview .feature-title { color: #242137; }
        .antislop-preview .feature-desc { color: #555365; }
        .antislop-preview .landing-footer { border-color: #e2e1eb; color: #625f72; }
        @media (max-width: 850px) { .antislop-preview .feature-chat-preview { padding-right: 1.5rem; } }
        .features-section { position: relative; overflow: hidden; background: #f8faff; backdrop-filter: none; border-color: #e9eeff; }
        .features-section::before { content: ""; position: absolute; top: 4rem; left: -7%; width: 43%; height: 9rem; background: #f0f1ff; border-radius: 45% 55% 56% 44%; transform: rotate(9deg); opacity: .6; pointer-events: none; }
        .features-inner { position: relative; }
        .section-title { position: relative; margin: 0; font-size: clamp(2rem, 3.2vw, 2.6rem); letter-spacing: -.035em; line-height: 1.2; }
        .section-title span { color: #563bfa; }
        .section-subtitle { max-width: 555px; margin: .55rem auto 1.8rem; color: #68728e; font-size: .92rem; line-height: 1.5; }
        .feature-showcase { gap: .75rem; }
        .feature-companion { min-height: 302px; grid-template-columns: 26% 49% 25%; padding: 1.15rem 1.4rem; border-color: #e9edfa; border-radius: 19px; box-shadow: 0 7px 24px rgba(69,75,135,.045); }
        .feature-companion::before { content: ""; position: absolute; inset: 9% 0 1% 26%; background: #f2f1ff; border-radius: 20% 35% 0 25% / 33% 50% 0 35%; transform: rotate(-2deg); pointer-events: none; }
        .feature-companion-copy { z-index: 2; max-width: 205px; }
        .feature-heading { gap: .6rem; }
        .feature-companion .feature-heading { display: block; }
        .feature-companion .feature-icon { width: 40px; height: 40px; margin-bottom: .45rem; border-radius: 50%; background: #563bfa; color: #fff; }
        .feature-title { color: #181b43; font-size: 1.02rem; letter-spacing: -.025em; }
        .feature-desc { color: #5d647f; font-size: .8rem; line-height: 1.5; }
        .feature-open-link { width: 42px; height: 32px; border-radius: 999px; margin-top: .35rem; }
        .feature-chat-preview { z-index: 2; align-self: center; gap: 0; padding: 0 .6rem; }
        .feature-chat-messages { gap: .9rem; }
        .feature-message { display: flex; align-items: flex-start; gap: .65rem; min-width: 0; }
        .feature-message-me { justify-content: flex-end; }
        .feature-avatar { flex: 0 0 40px; width: 40px; height: 40px; overflow: hidden; border-radius: 50%; background: #e1e4ff; }
        .feature-avatar img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.25); }
        .feature-chat-bubble { max-width: 88%; padding: .72rem .9rem; border-radius: 12px; background: #fff; box-shadow: 0 1px 4px rgba(57,63,111,.06); font-size: .86rem; line-height: 1.5; }
        .feature-message-me .feature-chat-bubble { color: #fff; background: #6250f6; border-bottom-right-radius: 4px; }
        .feature-companion-art { z-index: 2; position: absolute; right: -1%; bottom: -2%; width: 28%; height: 91%; }
        .feature-companion-art img { right: -2%; bottom: -8%; width: 116%; height: 118%; }
        .feature-support-grid { gap: .75rem; }
        .feature-support { position: relative; min-height: 153px; grid-template-columns: minmax(0, 1fr) 32%; gap: .25rem; overflow: hidden; border-color: #e9edfa; border-radius: 17px; padding: .95rem 1.2rem; box-shadow: 0 5px 18px rgba(69,75,135,.035); }
        .feature-support-copy { z-index: 2; align-self: stretch; display: flex; flex-direction: column; align-items: flex-start; }
        .feature-support .feature-heading { gap: .75rem; }
        .feature-support .feature-icon { width: 42px; height: 42px; background: #eef0ff; color: #563bfa; }
        .feature-journal .feature-icon { background: #e9f1ff; color: #4986e9; }
        .feature-support .feature-desc { margin: .35rem 0 0; max-width: 220px; font-size: .76rem; }
        .feature-text-link { width: 30px; height: 30px; margin-top: auto; margin-left: auto; justify-content: center; color: #563bfa; }
        .journal-illustration { position: absolute; right: .7rem; bottom: .35rem; width: clamp(96px, 25%, 137px); height: auto; transform: rotate(3deg); }
        .mood-chart { width: 100%; height: 110px; align-self: end; margin: 0 0 -.9rem; }
        .feature-mood .feature-text-link { position: absolute; right: .85rem; bottom: .45rem; }
        .feature-open-link:hover { background: #4330d6; }
        .feature-text-link:hover { color: #3525c2; }
        @media (max-width: 850px) { .feature-companion { grid-template-columns: 30% 70%; } .feature-companion-art { width: 23%; height: 70%; opacity: .55; } .feature-chat-preview,.antislop-preview .feature-chat-preview { padding-right: 12%; } .feature-support { grid-template-columns: 1fr 30%; } }
        @media (max-width: 600px) { .features-section { padding: 3rem 1rem; } .section-title { font-size: clamp(1.75rem, 7vw, 2.25rem); } .section-subtitle { font-size: .82rem; } .feature-companion { min-height: auto; grid-template-columns: 1fr; gap: 1.2rem; padding: 1.2rem; } .feature-companion::before { inset: 37% -10% 0 5%; } .feature-companion-copy { max-width: 100%; } .feature-companion .feature-heading { display: flex; align-items: center; } .feature-companion .feature-icon { margin-bottom: 0; } .feature-companion-copy .feature-desc { max-width: 280px; } .feature-chat-preview,.antislop-preview .feature-chat-preview { padding: 0 18% 0 0; } .feature-companion-art { width: 30%; height: 39%; opacity: .78; } .antislop-preview .feature-companion-art { opacity: .78; } .feature-avatar { flex-basis: 34px; width: 34px; height: 34px; } .feature-chat-bubble { max-width: 100%; font-size: .78rem; } .feature-support { min-height: 145px; } .journal-illustration { width: 105px; } }
        .hero1 { position: relative; isolation: isolate; max-width: none; min-height: min(690px, calc(100svh - 65px)); padding: 5rem max(4%, calc((100vw - 1200px)/2)) 4rem; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 2.25rem; background: #e9edff url('/images/hero-room-illustration.png') left 58% / 107% auto no-repeat; }
        .hero1::before { content: ""; position: absolute; inset: 0 47% 0 0; z-index: -1; background: linear-gradient(90deg, rgba(249,250,255,.42), rgba(249,250,255,0)); pointer-events: none; }
        .hero1-copy { position: relative; z-index: 1; max-width: 545px; }
        .hero1-headline { font-size: clamp(3.1rem, 5vw, 4.6rem); line-height: 1.08; letter-spacing: -.055em; }
        .hero1-gradient,.antislop-preview .hero1-gradient { background: none; -webkit-text-fill-color: #563bfa; color: #563bfa; }
        .hero1-subtext { max-width: 480px; margin: 1.3rem 0 1.15rem; color: #424966; font-size: 1rem; line-height: 1.7; }
        .hero1-visual { position: relative; z-index: 2; display: flex; justify-content: flex-start; transform: translateX(-2.5rem); }
        .hero-chat-demo { width: min(100%, 510px); max-width: 510px; height: 430px; margin: 0; padding: 1.35rem 1.3rem 1.2rem; border: 1px solid rgba(230,234,250,.9); border-radius: 21px; background: #fff; box-shadow: 0 17px 42px rgba(68,67,132,.14); }
        .hero-chat-messages { flex: 1; min-height: 0; padding: 1.6rem 0 .9rem; justify-content: center; }
        .hero-chat-entry { min-height: 43px; display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-top: auto; padding: .3rem .3rem .3rem .75rem; border: 1px solid #e5e9f4; border-radius: 999px; color: #8993a9; font-size: .75rem; text-decoration: none; }
        .hero-chat-entry span { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #563bfa; color: #fff; }
        .hero-chat-entry:focus-visible { outline: 3px solid #563bfa; outline-offset: 3px; }
        .hero1-note { position: absolute; top: 4%; right: 9%; z-index: 1; transform: rotate(-5deg); padding: 1.1rem 1.3rem; background: #fff9f1; color: #4b4392; font: 1.55rem/1.15 var(--font-caveat), cursive; text-align: center; box-shadow: 0 5px 16px rgba(40,36,77,.13); }
        .features-section.mt-12 { margin-top: 0; }
        @media (max-width: 1050px) { .hero1 { min-height: 630px; padding-inline: 4%; grid-template-columns: minmax(0, .86fr) minmax(0, 1.14fr); background-size: cover; background-position: left center; } .hero1-headline { font-size: clamp(2.9rem, 5vw, 4rem); } .hero1-visual { transform: translateX(-.5rem); } .hero-chat-demo { width: min(100%, 37vw); height: 400px; } .hero1-note { right: 5%; } }
        @media (max-width: 850px) { .hero1 { min-height: 0; grid-template-columns: 1fr; padding: 3.3rem 1.5rem 4rem; background-position: 63% center; } .hero1::before { inset: 0; background: rgba(246,248,255,.74); } .hero1-copy { max-width: 600px; text-align: left; } .hero1-subtext { margin-inline: 0; } .hero1-cta-group { justify-content: flex-start; } .hero1-visual { transform: none; } .hero-chat-demo { width: 100%; margin: .8rem 0 0; } .hero1-note { top: auto; bottom: 2rem; right: 4%; } }
        @media (max-width: 600px) { .hero1 { padding: 2.5rem 1rem 3rem; background-position: 67% center; } .hero1-headline { font-size: clamp(2.65rem, 10vw, 3.5rem); } .hero1-subtext { font-size: .94rem; } .hero-chat-demo { width: 100%; height: 350px; padding: 1rem; } .hero-chat-entry { font-size: .7rem; } .hero1-note { display: none; } }
      `}</style>
    </div>
  );
}

export default Design1LandingPage;
