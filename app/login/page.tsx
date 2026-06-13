"use client";

import Link from "next/link";
import { ArrowLeft, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white text-black font-mono border-4 md:border-8 border-black p-4 md:p-6 flex flex-col justify-between">
      {/* Navigation */}
      <header className="border-b-4 border-black pb-4">
        <Link href="/" className="inline-flex items-center gap-2 hover:underline font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> BACK TO PORTAL
        </Link>
      </header>

      {/* Main Login Box */}
      <main className="my-12 flex justify-center items-center">
        <div className="border-4 border-black p-8 w-full max-w-md bg-white">
          <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h2 className="text-2xl font-black uppercase">[ LOGIN ]</h2>
            <p className="text-xs text-neutral-600 mt-1">// Access your JomLuah profile</p>
          </div>

          {/* Form placeholder */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  placeholder="student@uthm.edu.my"
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
                  placeholder="••••••••"
                  className="w-full border-2 border-black p-2 pl-10 focus:bg-neutral-50 outline-none text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard"
                className="w-full border-4 border-black bg-black text-white py-3 font-bold hover:bg-white hover:text-black transition flex justify-center items-center uppercase text-sm"
              >
                Sign In
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center text-xs space-y-2 border-t-2 border-black pt-4">
            <p className="text-neutral-600">Don&apos;t have an account?</p>
            <Link href="/register" className="font-bold underline uppercase hover:text-neutral-700">
              Create student account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="text-center text-xs text-neutral-500">
        <p>[ SECURE SHIELD ENFORCED // RLS SANDBOXED ]</p>
      </footer>
    </div>
  );
}
