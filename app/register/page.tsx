"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeSlash } from "@phosphor-icons/react";
import { supabase } from "../lib/supabaseClient";

function CuteRobotFace({ className }: { className?: string }) {
  return (
    <div className={`relative w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-lg ${className}`}>
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        {/* Robot Head Base */}
        <rect x="20" y="25" width="60" height="55" rx="26" fill="#f3f4f6" />
        <rect x="23" y="28" width="54" height="49" rx="23" fill="#ffffff" />
        {/* Gray top helmet strip */}
        <path d="M 23 42 A 23 23 0 0 1 77 42 Z" fill="#e5e7eb" />
        <line x1="50" y1="28" x2="50" y2="42" stroke="#d1d5db" strokeWidth="2" />
        {/* Antenna */}
        <circle cx="50" cy="18" r="4" fill="#fbbf24" />
        <line x1="50" y1="18" x2="50" y2="25" stroke="#fbbf24" strokeWidth="2" />
        {/* Eyes */}
        <circle cx="38" cy="54" r="5" fill="#312e81" />
        <circle cx="62" cy="54" r="5" fill="#312e81" />
        {/* Blush */}
        <circle cx="28" cy="62" r="4" fill="#fbcfe8" />
        <circle cx="72" cy="62" r="4" fill="#fbcfe8" />
        {/* Mouth */}
        <path d="M 42 63 Q 50 71 58 63" stroke="#312e81" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  // Navigation states: "welcome" | "onboarding" | "login"
  const [view, setView] = useState<"welcome" | "onboarding" | "login">("welcome");
  
  // Onboarding step: 1 | 2 | 3 | 4
  const [step, setStep] = useState<number>(1);

  // Form states
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Determine active flow from URL params if present (e.g. /register?mode=login)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "login") {
        setView("login");
      }
    }
  }, []);

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!fullName.trim()) {
        setErrorMsg("Please enter your name");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!studentId.trim()) {
        setErrorMsg("Please enter your Student ID");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email)) {
        setErrorMsg("Please enter a valid email address (e.g. name@domain.com)");
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    if (step > 1) {
      setStep(step - 1);
    } else {
      setView("welcome");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address (e.g. name@domain.com)");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const emailRedirectTo = typeof window !== "undefined"
        ? `${window.location.origin}/login?verified=true`
        : undefined;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: { full_name: fullName, student_id: studentId },
        },
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        // Force sign out to prevent auto-login session from bypassing email verification & manual login
        await supabase.auth.signOut();
        setSuccessMsg("Account created successfully! Redirecting to sign in...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Email and password are required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address (e.g. name@domain.com)");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Signed in! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 1200);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Trigger handleNext or submit on Enter key inside inputs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (step < 4) {
        handleNext();
      } else {
        handleRegisterSubmit(e);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#6366f1] to-[#4f46e5] overflow-hidden font-sans">
      {/* Background blobs for premium depth */}
      <div aria-hidden="true" className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[120px] opacity-25 pointer-events-none z-0" />
      <div aria-hidden="true" className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px] opacity-25 pointer-events-none z-0" />

      {/* Welcome View */}
      {view === "welcome" && (
        <div key="welcome" className="relative z-10 w-full max-w-[460px] min-h-screen flex flex-col justify-between py-12 px-6 animate-page-entrance">
          <header className="flex items-center justify-start w-full mb-12 min-h-[38px]">
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all text-sm font-bold cursor-pointer decoration-transparent">
              <ArrowLeft weight="bold" className="w-4 h-4" />
              <span>Back to Portal</span>
            </Link>
          </header>

          <div className="text-center flex-1 flex flex-col justify-center mb-8">
            <CuteRobotFace className="mx-auto mb-8" />
            <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight text-white mb-5">Hi there,<br />I&apos;m Proxima!</h1>
            <p className="text-lg text-white/85 leading-relaxed max-w-[320px] mx-auto">Your AI companion throughout your journey</p>
          </div>

          <div className="flex flex-col gap-4 w-full mt-8">
            <button onClick={() => setView("onboarding")} className="w-full py-4 px-8 rounded-full bg-white text-indigo-600 font-extrabold text-base tracking-wider shadow-lg hover:-translate-y-0.5 hover:shadow-xl hover:bg-opacity-95 transition-all cursor-pointer">
              HI, PROXIMA!
            </button>
            <button onClick={() => setView("login")} className="bg-transparent border-none text-white/80 text-sm font-bold tracking-wider uppercase hover:text-white transition-all cursor-pointer py-2">
              I ALREADY HAVE AN ACCOUNT
            </button>
          </div>
        </div>
      )}

      {/* Onboarding / Conversational Steps View */}
      {view === "onboarding" && (
        <div key="onboarding" className="relative z-10 w-full max-w-[460px] min-h-screen flex flex-col justify-between py-12 px-6 animate-page-entrance">
          <header className="flex items-center justify-start w-full mb-12 min-h-[38px]">
            <button onClick={handleBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all text-sm font-bold cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
              <ArrowLeft weight="bold" className="w-4 h-4" />
              <span>Back</span>
            </button>
          </header>

          <div key={step} className="text-center flex-1 flex flex-col justify-center mb-8 animate-slide-step">
            <CuteRobotFace className="mx-auto mb-8 hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer" />
            
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug text-white mb-8 max-w-[380px] mx-auto text-center">
              {step === 1 && "So nice to meet you! What do your friends call you?"}
              {step === 2 && "Awesome! What is your UTHM Student ID?"}
              {step === 3 && "To secure your profile, what is your personal email?"}
              {step === 4 && "Finally, let's pick a strong password to protect your journal."}
            </h2>

            {errorMsg && (
              <div className="w-full p-4 rounded-2xl bg-red-500/12 border border-red-500/30 text-red-200 text-sm font-semibold max-w-full text-center mb-4 animate-pop-in">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="w-full p-4 rounded-2xl bg-emerald-500/12 border border-emerald-500/30 text-emerald-200 text-sm font-semibold max-w-full text-center mb-4 animate-pop-in">
                {successMsg}
              </div>
            )}

            <div className="mt-4 mb-8 w-full">
              {step === 1 && (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Your nickname..."
                  className="w-full bg-white/10 border border-white/20 py-4 px-6 rounded-full text-xl text-white font-sans text-center outline-none focus:border-white/45 focus:bg-white/15 transition-all placeholder-white/40 shadow-inner hover:border-white/30"
                  autoFocus
                />
              )}

              {step === 2 && (
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Your student ID..."
                  className="w-full bg-white/10 border border-white/20 py-4 px-6 rounded-full text-xl text-white font-sans text-center outline-none focus:border-white/45 focus:bg-white/15 transition-all placeholder-white/40 shadow-inner hover:border-white/30"
                  autoFocus
                />
              )}

              {step === 3 && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Your personal email..."
                  className="w-full bg-white/10 border border-white/20 py-4 px-6 rounded-full text-xl text-white font-sans text-center outline-none focus:border-white/45 focus:bg-white/15 transition-all placeholder-white/40 shadow-inner hover:border-white/30"
                  autoFocus
                />
              )}

              {step === 4 && (
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Choose a password..."
                    className="w-full bg-white/10 border border-white/20 py-4 px-6 rounded-full text-xl text-white font-sans text-center outline-none focus:border-white/45 focus:bg-white/15 transition-all placeholder-white/40 shadow-inner pr-12 hover:border-white/30"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full">
            <div className="w-full mb-8">
              {step < 4 ? (
                <button onClick={handleNext} className="w-full py-4 px-8 rounded-full bg-white text-indigo-600 font-extrabold text-base tracking-wider shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] hover:shadow-xl hover:bg-opacity-95 transition-all cursor-pointer">
                  CONTINUE
                </button>
              ) : (
                <button onClick={handleRegisterSubmit} disabled={loading} className="w-full py-4 px-8 rounded-full bg-white text-indigo-600 font-extrabold text-base tracking-wider shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] hover:shadow-xl hover:bg-opacity-95 transition-all cursor-pointer">
                  {loading ? "CREATING..." : "START MY JOURNEY"}
                </button>
              )}
            </div>

            <div className="flex gap-2 justify-center mt-auto pt-4">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    s === step ? "bg-white scale-125" : s < step ? "bg-white/65" : "bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt View */}
      {view === "login" && (
        <div key="login" className="relative z-10 w-full max-w-[460px] min-h-screen flex flex-col justify-between py-12 px-6 animate-page-entrance">
          <header className="flex items-center justify-start w-full mb-12 min-h-[38px]">
            <button onClick={() => setView("welcome")} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all text-sm font-bold cursor-pointer">
              <ArrowLeft weight="bold" className="w-4 h-4" />
              <span>Back</span>
            </button>
          </header>

          <div className="flex-1 flex flex-col justify-center w-full mb-8">
            <CuteRobotFace className="mx-auto mb-8" />
            
            <div className="text-center text-xl font-bold text-white mb-8 leading-relaxed max-w-[360px] mx-auto">
              Welcome back! Enter your email and password to sign in.
            </div>

            {errorMsg && (
              <div className="w-full p-4 rounded-2xl bg-red-500/12 border border-red-500/30 text-red-200 text-sm font-semibold max-w-full text-center mb-4">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="w-full p-4 rounded-2xl bg-emerald-500/12 border border-emerald-500/30 text-emerald-200 text-sm font-semibold max-w-full text-center mb-4">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="w-full">
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-xs font-extrabold tracking-widest text-white/60 ml-2">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@email.com"
                  required
                  className="w-full bg-white/10 border border-white/20 py-4 px-6 rounded-full text-xl text-white font-sans text-left outline-none focus:border-white/45 focus:bg-white/15 transition-all placeholder-white/40 shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-2 mb-6 relative">
                <label className="text-xs font-extrabold tracking-widest text-white/60 ml-2">PASSWORD</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/10 border border-white/20 py-4 px-6 rounded-full text-xl text-white font-sans text-left outline-none focus:border-white/45 focus:bg-white/15 transition-all placeholder-white/40 shadow-inner pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-[62%] -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 px-8 rounded-full bg-white text-indigo-600 font-extrabold text-base tracking-wider shadow-lg hover:-translate-y-0.5 hover:shadow-xl hover:bg-opacity-95 transition-all cursor-pointer mt-4">
                {loading ? "SIGNING IN..." : "SIGN IN SECURELY"}
              </button>
            </form>
          </div>

          <div className="w-full text-center">
            <button onClick={() => { setView("onboarding"); setStep(1); }} className="bg-transparent border-none text-white/80 text-sm font-bold tracking-wider uppercase hover:text-white transition-all cursor-pointer py-2">
              Don&apos;t have an account? Sign up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
