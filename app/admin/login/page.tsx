"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { neon } from "../../lib/neonClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void neon.auth.getSession().then(async ({ data }) => {
      const userId = data.session?.user.id;
      if (!userId) return;
      const { data: profile } = await neon.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (profile?.role === "admin") router.replace("/admin");
    }).catch(() => undefined).finally(() => setChecking(false));
  }, [router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data, error: signInError } = await neon.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) throw new Error("Incorrect email or password.");
      const userId = data.session?.user.id;
      if (!userId) throw new Error("Could not start your session. Please try again.");
      const { data: profile, error: profileError } = await neon.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (profileError || profile?.role !== "admin") {
        await neon.auth.signOut();
        throw new Error("This account does not have admin access.");
      }
      document.cookie = "jl_ob=; path=/; max-age=0; SameSite=Lax";
      router.replace("/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return <main className="flex min-h-screen items-center justify-center bg-[#f2f4ff] px-5 py-10 font-sans text-[#1c1a48]">
    <section className="w-full max-w-sm rounded-2xl border border-[#e1e4f2] bg-white p-7 shadow-[0_12px_40px_rgba(42,55,105,0.08)] sm:p-9">
      <h1 className="text-center text-2xl font-bold tracking-tight">Admin sign in</h1>
      <p className="mt-2 text-center text-sm text-[#68708b]">Administrator access only</p>
      <form onSubmit={submit} className="mt-7 space-y-5" aria-busy={busy || checking}>
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}
        <div><label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold">Email</label><input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-xl border border-[#d5daeb] px-3 text-sm outline-none focus:border-[#7771ef] focus:ring-4 focus:ring-[#6366F1]/10" /></div>
        <div><label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold">Password</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-xl border border-[#d5daeb] px-3 text-sm outline-none focus:border-[#7771ef] focus:ring-4 focus:ring-[#6366F1]/10" /></div>
        <button type="submit" disabled={busy || checking} className="h-11 w-full rounded-xl bg-[#5b55e8] text-sm font-semibold text-white transition hover:bg-[#4d47d2] disabled:opacity-60">{checking ? "Checking…" : busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </section>
  </main>;
}
