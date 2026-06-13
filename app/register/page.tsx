"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Lock } from "lucide-react";
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
    <div className="min-h-screen bg-white text-black font-mono border-4 md:border-8 border-black p-4 md:p-6 flex flex-col justify-between">
      {/* Navigation */}
      <header className="border-b-4 border-black pb-4">
        <Link href="/" className="inline-flex items-center gap-2 hover:underline font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> BACK TO PORTAL
        </Link>
      </header>

      {/* Main Register Box */}
      <main className="my-12 flex justify-center items-center">
        <div className="border-4 border-black p-8 w-full max-w-md bg-white">
          <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h2 className="text-2xl font-black uppercase">[ REGISTER ]</h2>
            <p className="text-xs text-neutral-600 mt-1">// Join JomLuah as Student</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border-2 border-red-500 text-red-600 p-2 text-xs font-bold mb-4">
              [ERROR] {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 border-2 border-green-500 text-green-600 p-2 text-xs font-bold mb-4">
              [SUCCESS] {successMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ali Bin Abu"
                  required
                  className="w-full border-2 border-black p-2 pl-10 focus:bg-neutral-50 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Student ID (Metric No)</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="CI220000"
                  required
                  className="w-full border-2 border-black p-2 pl-10 focus:bg-neutral-50 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">UTHM Student Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@student.uthm.edu.my"
                  required
                  className="w-full border-2 border-black p-2 pl-10 focus:bg-neutral-50 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border-2 border-black p-2 pl-10 focus:bg-neutral-50 outline-none text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full border-4 border-black bg-black text-white py-3 font-bold hover:bg-white hover:text-black transition flex justify-center items-center uppercase text-sm disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs space-y-2 border-t-2 border-black pt-4">
            <p className="text-neutral-600">Already have a profile?</p>
            <Link href="/login" className="font-bold underline uppercase hover:text-neutral-700">
              Sign in to profile
            </Link>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="text-center text-xs text-neutral-500">
        <p>[ REGISTRATION SANDBOXED // UTHM STUDENTS ONLY ]</p>
      </footer>
    </div>
  );
}
