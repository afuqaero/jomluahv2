"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { counselorButtonClass, CounselorAuthShell, counselorInputClass } from "../auth-shell";
import { neon } from "../../lib/neonClient";

export default function CounselorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void neon.auth.getSession().then(async ({ data }) => {
      const userId = data.session?.user.id;
      if (!userId) return;
      const { data: profile } = await neon.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (profile?.role === "counselor") router.replace("/counselor");
      else if (profile?.role === "admin") router.replace("/admin");
    }).catch(() => undefined).finally(() => setCheckingSession(false));
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await neon.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) throw new Error(signInError.message || "Sign-in failed. Check your email and password.");
      const userId = data.session?.user.id;
      if (!userId) throw new Error("Your account session could not be started. Please try again.");

      const { data: profile, error: profileError } = await neon.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (profileError) {
        await neon.auth.signOut();
        document.cookie = "jl_ob=; path=/; max-age=0; SameSite=Lax";
        throw new Error("We couldn’t verify your staff access. Try again or contact your administrator.");
      }
      if (profile?.role === "admin") {
        document.cookie = "jl_ob=; path=/; max-age=0; SameSite=Lax";
        router.replace("/admin");
        return;
      }
      if (profile?.role !== "counselor") {
        await neon.auth.signOut();
        document.cookie = "jl_ob=; path=/; max-age=0; SameSite=Lax";
        throw new Error("This account does not have counselor access yet. Ask your administrator to assign the counselor role.");
      }

      document.cookie = "jl_ob=; path=/; max-age=0; SameSite=Lax";
      router.replace("/counselor");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CounselorAuthShell
      eyebrow="Staff sign-in"
      title="Welcome back"
      description="Sign in with the counselor account assigned to you."
    >
      <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading || checkingSession}>
        {error && <p role="alert" className="rounded-xl border border-[#e5b9ae] bg-[#fff2ee] px-4 py-3 text-sm leading-6 text-[#813b30]">{error}</p>}
        <div>
          <label htmlFor="counselor-email" className="text-sm font-semibold text-[#393b64]">Work email</label>
          <input id="counselor-email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className={counselorInputClass} placeholder="name@university.edu" />
        </div>
        <div>
          <label htmlFor="counselor-password" className="text-sm font-semibold text-[#393b64]">Password</label>
          <input id="counselor-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className={counselorInputClass} placeholder="Enter your password" />
        </div>
        <button type="submit" disabled={loading || checkingSession} className={counselorButtonClass}>
          {checkingSession ? "Checking session…" : loading ? "Signing in…" : "Sign in to counselor portal"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#59617e]">
        Need an account? <Link href="/counselor/register" className="font-bold text-[#4F46E5] underline decoration-[#4F46E5]/35 underline-offset-4 hover:decoration-[#4F46E5]">Register for counselor access</Link>
      </p>
    </CounselorAuthShell>
  );
}
