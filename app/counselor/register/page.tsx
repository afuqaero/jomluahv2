"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { counselorButtonClass, CounselorAuthShell, counselorInputClass } from "../auth-shell";
import { CounselorAuthNotice } from "../auth-notice";
import { neon } from "../../lib/neonClient";

export default function CounselorRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const emailRedirectTo = `${window.location.origin}/counselor/login?verified=true`;
      const { data, error: signUpError } = await neon.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo, data: { full_name: fullName.trim() } },
      });
      if (signUpError) throw new Error(signUpError.message || "Unable to create your account.");

      if (data?.user?.email) {
        const profile = await neon.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName.trim(),
        });
        if (profile.error) {
          localStorage.setItem("jl_pending_profile", JSON.stringify({ email: data.user.email, full_name: fullName.trim() }));
        }
      }

      await neon.auth.signOut();
      document.cookie = "jl_ob=; path=/; max-age=0; SameSite=Lax";
      setRegistered(true);
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Account registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CounselorAuthShell
      compact
      title="Register for access"
      description="Create your counselor account. An admin must assign access before you can view shared mood check-ins."
    >
      <>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3" aria-busy={loading}>
            {error && <p role="alert" className="rounded-xl border border-[#e5b9ae] bg-[#fff2ee] px-4 py-3 text-sm leading-6 text-[#813b30]">{error}</p>}
            <div>
              <label htmlFor="counselor-name" className="text-sm font-semibold text-[#393b64]">Full name</label>
              <input id="counselor-name" name="name" type="text" autoComplete="name" required minLength={2} value={fullName} onChange={(event) => setFullName(event.target.value)} className={counselorInputClass} placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="counselor-register-email" className="text-sm font-semibold text-[#393b64]">Work email</label>
              <input id="counselor-register-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={counselorInputClass} placeholder="name@university.edu" />
            </div>
            <div>
              <label htmlFor="counselor-register-password" className="text-sm font-semibold text-[#393b64]">Password</label>
              <input id="counselor-register-password" name="new-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className={counselorInputClass} placeholder="At least 8 characters" />
            </div>
            <div>
              <label htmlFor="counselor-confirm-password" className="text-sm font-semibold text-[#393b64]">Confirm password</label>
              <input id="counselor-confirm-password" name="confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={counselorInputClass} placeholder="Enter the password again" />
            </div>
            <p className="rounded-xl border border-[#c7d2fe] bg-[#eef2ff] px-4 py-3 text-sm leading-6 text-[#393b64]">Registration does not grant counselor privileges. Your account stays a standard account until an administrator assigns the counselor role.</p>
            <button type="submit" disabled={loading} className={counselorButtonClass}>
              {loading ? "Creating account…" : "Create counselor account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#59617e]">
            Already have a staff account? <Link href="/counselor/login" className="font-bold text-[#4F46E5] underline decoration-[#4F46E5]/35 underline-offset-4 hover:decoration-[#4F46E5]">Sign in</Link>
          </p>
          {registered && <CounselorAuthNotice onClose={() => setRegistered(false)} />}
      </>
    </CounselorAuthShell>
  );
}
