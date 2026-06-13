"use client";

import React from "react";


export function FloralIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="#FDF4E3" stroke="#F5E6CC" strokeWidth="2" />
      <circle cx="50" cy="45" r="22" fill="#FDBA74" opacity="0.4" />
      <g stroke="#C2410C" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M 50 85 Q 48 50 50 25" />
        <path d="M 50 70 Q 35 60 28 65 Q 40 75 50 70" fill="#E0F2FE" opacity="0.8" />
        <path d="M 50 55 Q 65 45 72 50 Q 60 60 50 55" fill="#FEF08A" opacity="0.8" />
        <path d="M 50 45 Q 32 35 25 40 Q 38 50 50 45" fill="#DCFCE7" opacity="0.8" />
        <path d="M 50 35 Q 68 25 75 30 Q 62 40 50 35" fill="#FEE2E2" opacity="0.8" />
      </g>
      <circle cx="50" cy="20" r="2" fill="#C2410C" />
      <circle cx="28" cy="35" r="1.5" fill="#C2410C" />
      <circle cx="72" cy="65" r="1.5" fill="#C2410C" />
    </svg>
  );
}

export function MountainIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 100" className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C7D2FE" />
        </linearGradient>
        <linearGradient id="mountainGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
      </defs>
      <rect width="200" height="100" rx="0" fill="url(#skyGradient)" />
      <path d="M 0 100 Q 50 60 110 100 Z" fill="#6366F1" opacity="0.5" />
      <path d="M 90 100 Q 150 50 200 100 Z" fill="#6366F1" opacity="0.3" />
      <path d="M 40 100 L 100 25 L 160 100 Z" fill="url(#mountainGradient)" />
      <path d="M 86 42.5 L 100 25 L 114 42.5 Q 107 48 100 42.5 Q 93 48 86 42.5" fill="#EEF2F6" />
      <line x1="100" y1="25" x2="100" y2="12" stroke="#F59E0B" strokeWidth="2" />
      <path d="M 100 12 L 115 17 L 100 22 Z" fill="#EF4444" />
      <circle cx="95" cy="55" r="2" fill="#FFFFFF" />
      <circle cx="105" cy="55" r="2" fill="#FFFFFF" />
      <path d="M 97 59 Q 100 62 103 59" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M 20 50 C 25 45, 35 45, 38 50 C 42 48, 50 52, 45 58 C 40 60, 20 60, 20 50 Z" fill="#FFFFFF" opacity="0.8" />
      <path d="M 155 40 C 160 35, 170 35, 173 40 C 177 38, 185 42, 180 48 C 175 50, 155 50, 155 40 Z" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

// ---------------------------------------------------------
// CUSTOM UNIQUELY COLORED VECTOR EMOJI COMPONENT SVGs
// ---------------------------------------------------------

export function HappyEmoji({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      {/* Face Base */}
      <circle cx="18" cy="18" r="16" fill="#FFCC4D" />
      {/* Simple Happy Eyes */}
      <circle cx="12" cy="16" r="2.5" fill="#664500" />
      <circle cx="24" cy="16" r="2.5" fill="#664500" />
      {/* Big Open Happy Grin */}
      <path d="M11 20c0 4 3.1 7 7 7s7-3 7-7H11z" fill="#664500" />
    </svg>
  );
}

export function GoodEmoji({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      {/* Face Base */}
      <circle cx="18" cy="18" r="16" fill="#77dd77" />
      {/* Smile Eyes */}
      <path d="M12 17c.8-1.2 2-1.2 2.8 0" stroke="#1d5f1d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M24 17c-.8-1.2-2-1.2-2.8 0" stroke="#1d5f1d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Happy Smile Mouth */}
      <path d="M11 21c1.5 3.5 4.5 4.5 7 4.5s5.5-1 7-4.5" stroke="#1d5f1d" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function OkayEmoji({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      {/* Face Base */}
      <circle cx="18" cy="18" r="16" fill="#a4e2fc" />
      {/* Simple Round Eyes */}
      <circle cx="12" cy="16" r="2.5" fill="#1b5a75" />
      <circle cx="24" cy="16" r="2.5" fill="#1b5a75" />
      {/* Neutral Straight Mouth */}
      <line x1="12" y1="23" x2="24" y2="23" stroke="#1b5a75" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function SadEmoji({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      {/* Face Base */}
      <circle cx="18" cy="18" r="16" fill="#5DADE2" />
      {/* Sad Eyes */}
      <path d="M10 18c.5-.8 1.5-.8 2 0" stroke="#1B4F72" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M26 18c-.5-.8-1.5-.8-2 0" stroke="#1B4F72" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Frowning Mouth */}
      <path d="M12 25q6-4 12 0" stroke="#1B4F72" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Tear Drop */}
      <path d="M24.5 20c0 1.5-1 2.5-2.5 2.5s-2.5-1-2.5-2.5c0-1.8 2.5-4.5 2.5-4.5s2.5 2.7 2.5 4.5z" fill="#EBF5FB" />
    </svg>
  );
}
