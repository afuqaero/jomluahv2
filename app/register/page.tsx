"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !studentId) {
      setErrorMsg("All fields are required");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            student_id: studentId,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Registration successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between relative overflow-hidden font-sans p-6">
      {/* Background glowing decorations */}
      <div aria-hidden="true" className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)] pointer-events-none blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.10)_0%,transparent_70%)] pointer-events-none blur-3xl" />

      {/* Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-stone-400 hover:text-white font-semibold text-sm transition hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </Link>
      </header>

      {/* Main Register Box */}
      <main className="relative z-10 my-12 flex justify-center items-center flex-grow">
        <div className="border border-white/10 p-8 w-full max-w-md bg-stone-900/65 backdrop-blur-xl rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Card subtle top-glow border */}
          <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className="text-center mb-8 pb-4 border-b border-white/5">
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
              Create Profile
            </h2>
            <p className="text-xs text-stone-400 mt-2">// Join JomLuah as Student</p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-2xl text-xs font-bold mb-6 text-left">
              [ERROR] {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-2xl text-xs font-bold mb-6 text-left">
              [SUCCESS] {successMsg}
            </div>
          )}

          <form className="space-y-4 text-left" onSubmit={handleRegister}>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ali Bin Abu"
                  required
                  className="w-full border border-white/10 bg-white/5 rounded-full px-4 py-3 pl-12 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400">Student ID (Metric No)</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="CI220000"
                  required
                  className="w-full border border-white/10 bg-white/5 rounded-full px-4 py-3 pl-12 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400">UTHM Student Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-stone-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@student.uthm.edu.my"
                  required
                  className="w-full border border-white/10 bg-white/5 rounded-full px-4 py-3 pl-12 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-stone-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-white/10 bg-white/5 rounded-full px-4 py-3 pl-12 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3.5 rounded-full font-bold hover:from-indigo-500 hover:to-indigo-600 transition shadow-lg shadow-indigo-600/20 flex justify-center items-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-xs space-y-3 border-t border-white/5 pt-5">
            <p className="text-stone-400">Already have a profile?</p>
            <Link 
              href="/login" 
              className="font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 uppercase hover:scale-105 inline-block transition"
            >
              Sign in to profile
            </Link>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="text-center text-[10px] text-stone-500 relative z-10 flex items-center justify-center gap-1.5 pb-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SECURE SHIELD ENFORCED // RLS SANDBOXED
      </footer>
    </div>
  );
}
