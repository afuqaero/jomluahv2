"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, Eye, EyeSlash } from "@phosphor-icons/react";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

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

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const timedOut = searchParams.get("reason") === "timeout";
  const verified = searchParams.get("verified") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Redirect if already authenticated on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSuccessMsg("Already signed in! Redirecting...");
        setTimeout(() => router.push(redirectTo), 1200);
      }
    };
    checkSession();
  }, [router, redirectTo]);

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
      const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        // Read onboarding status once here → write lightweight cookie →
        // middleware will use cookie only from now on (zero DB calls per request)
        const userId = signInData.session?.user.id;
        if (userId) {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("onboarding_completed")
              .eq("id", userId)
              .single();
            if (profile?.onboarding_completed) {
              document.cookie = "jl_ob=1; path=/; max-age=31536000; SameSite=Lax";
            } else {
              document.cookie = "jl_ob=; path=/; max-age=0; SameSite=Lax";
            }
          } catch (profileErr) {
            console.error("Error reading profile onboarding status:", profileErr);
            document.cookie = "jl_ob=; path=/; max-age=0; SameSite=Lax";
          }
        }
        setSuccessMsg("Signed in! Redirecting...");
        setTimeout(() => router.push(redirectTo), 800);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#6366f1] to-[#4f46e5] overflow-hidden font-sans">
      {/* Background blobs for premium depth */}
      <div aria-hidden="true" className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[120px] opacity-25 pointer-events-none z-0" />
      <div aria-hidden="true" className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px] opacity-25 pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-[460px] min-h-screen flex flex-col justify-between py-12 px-6 animate-page-entrance">
        <header className="flex items-center justify-start w-full mb-12 min-h-[38px]">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all text-sm font-bold cursor-pointer decoration-transparent">
            <ArrowLeft weight="bold" className="w-4 h-4" />
            <span>Back to Portal</span>
          </Link>
        </header>

        <div className="flex-1 flex flex-col justify-center w-full mb-8 animate-fade-slide-up">
          <CuteRobotFace className="mx-auto mb-8" />

          <div className="text-center text-xl font-bold text-white mb-8 leading-relaxed max-w-[360px] mx-auto">
            Welcome back! Enter your email and password to sign in.
          </div>

          {timedOut && !errorMsg && (
            <div className="w-full p-4 rounded-2xl bg-red-500/12 border border-red-500/30 text-red-200 text-sm font-semibold max-w-full text-center mb-4">
              You were signed out due to inactivity. Please sign in again.
            </div>
          )}
          {verified && !errorMsg && !successMsg && (
            <div className="w-full p-4 rounded-2xl bg-emerald-500/12 border border-emerald-500/30 text-emerald-200 text-sm font-semibold max-w-full text-center mb-4">
              Email verified successfully! Please sign in.
            </div>
          )}
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
          <Link href="/register" className="bg-transparent border-none text-white/80 text-sm font-bold tracking-wider uppercase hover:text-white transition-all cursor-pointer py-2 decoration-transparent">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
