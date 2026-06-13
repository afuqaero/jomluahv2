"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Brain, GraduationCap } from "@phosphor-icons/react";
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, student_id: studentId } },
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Registration successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Blobs */}
      <div aria-hidden="true" className="blob blob-1" />
      <div aria-hidden="true" className="blob blob-2" />
      <div aria-hidden="true" className="dot-grid" />

      {/* Header */}
      <header className="auth-header">
        <Link href="/" className="back-link">
          <ArrowLeft weight="bold" className="w-4 h-4" />
          Back to Portal
        </Link>
        <div className="logo-group">
          <div className="logo-icon">
            <Brain weight="fill" className="w-4 h-4" />
          </div>
          <span className="logo-text">JomLuah</span>
        </div>
      </header>

      {/* Main */}
      <main className="auth-main">
        <div className="auth-card">
          <div className="card-top-glow" />

          {/* Brand panel */}
          <div className="auth-panel auth-panel-brand">
            <div className="brand-content">
              <div className="brand-badge">
                <GraduationCap weight="duotone" className="w-5 h-5 text-indigo-500" />
                UTHM Student Registration
              </div>
              <h2 className="brand-title">
                Start your<br />
                <span className="brand-gradient">wellness journey.</span>
              </h2>
              <p className="brand-sub">
                Create your free JomLuah profile to access your personal AI companion, private journal, and emotional insights — all in one place.
              </p>

              <div className="feature-list">
                {[
                  { label: "Private AI Companion", desc: "Guided emotional support" },
                  { label: "Encrypted Journal", desc: "Your thoughts, secured" },
                  { label: "PCU Bridge", desc: "Connect with your counsellor" },
                ].map((item) => (
                  <div key={item.label} className="feature-item">
                    <div className="feature-dot" />
                    <div>
                      <p className="feature-item-title">{item.label}</p>
                      <p className="feature-item-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="brand-orb" />
          </div>

          {/* Form panel */}
          <div className="auth-panel auth-panel-form">
            <div className="form-header">
              <h1 className="form-title">Create Profile</h1>
              <p className="form-subtitle">Join JomLuah as a UTHM student</p>
            </div>

            {errorMsg && (
              <div className="alert alert-error">
                <span className="alert-dot bg-red-400" />
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success">
                <span className="alert-dot bg-emerald-400" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleRegister} className="auth-form">
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Full Name</label>
                  <div className="field-input-wrap">
                    <span className="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ali Bin Abu"
                      required
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Student ID (Metric No)</label>
                  <div className="field-input-wrap">
                    <span className="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 3v4M8 3v4M2 9h20"/></svg>
                    </span>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="CI220000"
                      required
                      className="field-input"
                    />
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="field-label">UTHM Student Email</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@student.uthm.edu.my"
                    required
                    className="field-input"
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Password</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="field-input"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <>
                    <span className="spinner" />
                    Creating Account...
                  </>
                ) : "Create My Account"}
              </button>
            </form>

            <p className="form-footer-text">
              Already have a profile?{" "}
              <Link href="/login" className="form-link">Sign in to profile</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="auth-footer">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        Secure · Sandboxed · Row-Level Security Enforced
      </footer>

      <style jsx>{`
        .auth-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 40%, #ede9fe 100%);
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex; flex-direction: column;
          position: relative; overflow: hidden;
        }
        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .blob-1 {
          width: 600px; height: 600px; top: -200px; left: -200px;
          background: radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 70%);
        }
        .blob-2 {
          width: 500px; height: 500px; bottom: -150px; right: -150px;
          background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%);
        }
        .dot-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(99,102,241,0.10) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none; z-index: 0;
        }
        .auth-header {
          position: relative; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.5rem;
          background: rgba(255,255,255,0.5); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.7);
        }
        .back-link {
          display: inline-flex; align-items: center; gap: 0.375rem;
          font-size: 0.875rem; font-weight: 600; color: #6b7280;
          text-decoration: none; transition: color 0.2s;
        }
        .back-link:hover { color: #1e1b4b; }
        .logo-group { display: flex; align-items: center; gap: 0.5rem; }
        .logo-icon {
          width: 30px; height: 30px; border-radius: 9px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          color: white; box-shadow: 0 4px 10px rgba(99,102,241,0.35);
        }
        .logo-text { font-size: 1.05rem; font-weight: 800; color: #1e1b4b; }

        .auth-main {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 2rem 1.5rem; position: relative; z-index: 10;
        }
        .auth-card {
          width: 100%; max-width: 960px;
          background: rgba(255,255,255,0.60); backdrop-filter: blur(24px);
          border: 1.5px solid rgba(255,255,255,0.90); border-radius: 2rem;
          box-shadow: 0 24px 80px rgba(99,102,241,0.14), 0 4px 16px rgba(0,0,0,0.06);
          display: grid; grid-template-columns: 1fr 1fr;
          overflow: hidden; position: relative;
        }
        @media (max-width: 768px) {
          .auth-card { grid-template-columns: 1fr; }
          .auth-panel-brand { display: none; }
        }
        .card-top-glow {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, #6366f1, #8b5cf6, transparent);
          z-index: 1;
        }

        .auth-panel { padding: 2.5rem; position: relative; overflow: hidden; }
        .auth-panel-brand {
          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.10));
          border-right: 1px solid rgba(255,255,255,0.6);
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .brand-badge {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.3rem 0.75rem; border-radius: 999px;
          background: rgba(255,255,255,0.70); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.95);
          font-size: 0.7rem; font-weight: 700; color: #6b7280;
          margin-bottom: 1.25rem;
        }
        .brand-title {
          font-size: 2rem; font-weight: 900; color: #1e1b4b;
          line-height: 1.1; letter-spacing: -0.04em; margin-bottom: 0.875rem;
        }
        .brand-gradient {
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .brand-sub {
          font-size: 0.8375rem; color: #6b7280; line-height: 1.7; margin-bottom: 1.75rem;
        }
        .feature-list { display: flex; flex-direction: column; gap: 0.875rem; }
        .feature-item {
          display: flex; align-items: flex-start; gap: 0.75rem;
          padding: 0.75rem; border-radius: 0.875rem;
          background: rgba(255,255,255,0.50); border: 1px solid rgba(255,255,255,0.80);
        }
        .feature-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 3px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }
        .feature-item-title { font-size: 0.8125rem; font-weight: 700; color: #1e1b4b; line-height: 1; margin-bottom: 2px; }
        .feature-item-desc { font-size: 0.7rem; color: #9ca3af; }
        .brand-orb {
          position: absolute; bottom: -80px; right: -80px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 70%);
          filter: blur(30px);
        }

        .auth-panel-form { display: flex; flex-direction: column; justify-content: center; }
        .form-header { margin-bottom: 1.5rem; }
        .form-title {
          font-size: 1.75rem; font-weight: 900; color: #1e1b4b;
          letter-spacing: -0.035em; margin-bottom: 0.25rem;
        }
        .form-subtitle { font-size: 0.875rem; color: #9ca3af; font-weight: 500; }

        .alert {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1rem; border-radius: 0.875rem;
          font-size: 0.8125rem; font-weight: 600; margin-bottom: 1rem;
        }
        .alert-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.20); color: #dc2626; }
        .alert-success { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.20); color: #059669; }
        .alert-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        .auth-form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
        @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }
        .field { display: flex; flex-direction: column; gap: 0.3rem; }
        .field-label { font-size: 0.7rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; }
        .field-input-wrap { position: relative; }
        .field-icon {
          position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%);
          color: #9ca3af; display: flex; align-items: center;
        }
        .field-input {
          width: 100%; padding: 0.75rem 0.875rem 0.75rem 2.5rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.70); backdrop-filter: blur(8px);
          border: 1.5px solid rgba(255,255,255,0.90);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          font-size: 0.875rem; color: #1e1b4b; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .field-input::placeholder { color: #d1d5db; }
        .field-input:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .submit-btn {
          width: 100%; padding: 0.875rem 1.5rem;
          border-radius: 0.875rem; border: none;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: white; font-size: 0.9375rem; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          box-shadow: 0 6px 20px rgba(99,102,241,0.40);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          font-family: inherit; margin-top: 0.25rem;
        }
        .submit-btn:hover:not(:disabled) {
          transform: scale(1.02); box-shadow: 0 10px 28px rgba(99,102,241,0.50);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .form-footer-text { font-size: 0.8125rem; color: #9ca3af; text-align: center; }
        .form-link {
          color: #6366f1; font-weight: 700; text-decoration: none; transition: color 0.2s;
        }
        .form-link:hover { color: #4f46e5; }

        .auth-footer {
          position: relative; z-index: 10;
          text-align: center; font-size: 0.7rem; font-weight: 600; color: #9ca3af;
          padding: 1rem 1.5rem;
          display: flex; align-items: center; justify-content: center; gap: 0.375rem;
          border-top: 1px solid rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.40); backdrop-filter: blur(16px);
        }
      `}</style>
    </div>
  );
}
