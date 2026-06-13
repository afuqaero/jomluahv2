"use client";

import React from "react";

export function RobotAvatar({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <style>{`
          @keyframes head-bob {
            0%, 100% { transform: translateY(1.5px) rotate(1deg); }
            50% { transform: translateY(-2.5px) rotate(-1deg); }
          }
          @keyframes eye-blink {
            0%, 95%, 100% { transform: scaleY(1); }
            97.5% { transform: scaleY(0.1); }
          }
          @keyframes ear-twitch {
            0%, 90%, 100% { transform: rotate(0deg); }
            95% { transform: rotate(-5deg); }
          }
          .peeking-cat {
            transform-origin: 50px 65px;
            animation: head-bob 4s ease-in-out infinite;
          }
          .cat-eye {
            transform-origin: 50% 50%;
            animation: eye-blink 4s infinite;
          }
          .cat-ear-left {
            transform-origin: 30px 35px;
            animation: ear-twitch 6s infinite;
          }
        `}</style>
      </defs>

      {/* Background soft circle highlight */}
      <circle cx="50" cy="50" r="46" fill="#FFF" stroke="#E2E8F0" strokeWidth="1.5" />

      {/* The Cat Group */}
      <g className="peeking-cat">
        {/* Left Ear */}
        <path d="M 22 41 L 28 12 Q 37 20 40 28 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" strokeLinejoin="round" className="cat-ear-left" />
        <path d="M 26 37 L 30 17 Q 35 22 36 27 Z" fill="#FDA4AF" className="cat-ear-left" />

        {/* Right Ear */}
        <path d="M 78 41 L 72 12 Q 63 20 60 28 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" strokeLinejoin="round" />
        <path d="M 74 37 L 70 17 Q 65 22 64 27 Z" fill="#FDA4AF" />

        {/* Head Body (Larger size) */}
        <ellipse cx="50" cy="53" rx="31" ry="25" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />

        {/* Grey tabby patches */}
        <path d="M 33 32 Q 36 40 32 42 Q 29 37 33 32 Z" fill="#94A3B8" opacity="0.8" />
        <path d="M 42 31 Q 45 39 41 42 Q 38 36 42 31 Z" fill="#94A3B8" opacity="0.8" />
        
        {/* Blushing Cheeks */}
        <ellipse cx="28" cy="58" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.7" />
        <ellipse cx="72" cy="58" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.7" />

        {/* Big Glossy Eyes */}
        <circle cx="37" cy="48" r="7.5" fill="#0F172A" className="cat-eye" />
        <circle cx="63" cy="46" r="7.5" fill="#0F172A" className="cat-eye" />
        <circle cx="35.5" cy="45.5" r="2.5" fill="#FFFFFF" className="cat-eye" />
        <circle cx="61.5" cy="43.5" r="2.5" fill="#FFFFFF" className="cat-eye" />
        <circle cx="38.5" cy="50.5" r="0.9" fill="#FFFFFF" className="cat-eye" />
        <circle cx="64.5" cy="48.5" r="0.9" fill="#FFFFFF" className="cat-eye" />

        {/* Nose */}
        <polygon points="48.5,54 51.5,54 50,56.5" fill="#FDA4AF" />

        {/* Mouth */}
        <path d="M 45.5 58 Q 48 59.5 50 58 Q 52 59.5 54.5 58" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Whiskers */}
        <line x1="18" y1="56" x2="5" y2="54" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="17" y1="60" x2="4" y2="60" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="82" y1="56" x2="95" y2="54" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="83" y1="60" x2="96" y2="60" stroke="#CBD5E1" strokeWidth="1" />

        {/* --- Flower & Heart Crown --- */}
        {/* Left Heart (pink) */}
        <path d="M 15 28 C 13 24, 17 22, 19 25 C 21 22, 25 24, 23 28 L 19 32 Z" fill="#FF8DA1" />
        {/* Bear 1 */}
        <g transform="translate(20, 16)">
          <circle cx="0" cy="0" r="3.2" fill="#B45309" />
          <circle cx="-2.7" cy="-2.7" r="1.3" fill="#B45309" />
          <circle cx="2.7" cy="-2.7" r="1.3" fill="#B45309" />
          <circle cx="0" cy="1" r="1" fill="#FDE68A" />
        </g>
        {/* Emoji 1 */}
        <g transform="translate(30, 11)">
          <circle cx="0" cy="0" r="3.2" fill="#FFCC4D" />
          <ellipse cx="-1" cy="-0.5" rx="0.6" ry="0.9" fill="#664500" />
          <ellipse cx="1" cy="-0.5" rx="0.6" ry="0.9" fill="#664500" />
          <path d="M -1.5 2 Q 0 1 1.5 2" stroke="#664500" strokeWidth="0.6" strokeLinecap="round" fill="none" />
        </g>
        {/* Pink Flower 1 */}
        <g transform="translate(40, 7)" fill="#F472B6">
          <circle cx="0" cy="-2" r="1.6" />
          <circle cx="2" cy="0" r="1.6" />
          <circle cx="0" cy="2" r="1.6" />
          <circle cx="-2" cy="0" r="1.6" />
          <circle cx="0" cy="0" r="1.2" fill="#FCD34D" />
        </g>
        {/* Heart 2 */}
        <path d="M 50 8 C 49 4, 52 3, 54 5 C 56 3, 59 4, 58 8 L 54 11 Z" fill="#FF8DA1" />
        {/* Bear 2 */}
        <g transform="translate(61, 9)">
          <circle cx="0" cy="0" r="3.2" fill="#B45309" />
          <circle cx="-2.7" cy="-2.7" r="1.3" fill="#B45309" />
          <circle cx="2.7" cy="-2.7" r="1.3" fill="#B45309" />
          <circle cx="0" cy="1" r="1" fill="#FDE68A" />
        </g>
        {/* Pink Flower 2 */}
        <g transform="translate(71, 13)" fill="#F472B6">
          <circle cx="0" cy="-2" r="1.6" />
          <circle cx="2" cy="0" r="1.6" />
          <circle cx="0" cy="2" r="1.6" />
          <circle cx="-2" cy="0" r="1.6" />
          <circle cx="0" cy="0" r="1.2" fill="#FCD34D" />
        </g>
        {/* Emoji 2 */}
        <g transform="translate(79, 20)">
          <circle cx="0" cy="0" r="3.2" fill="#FFCC4D" />
          <ellipse cx="-1" cy="-0.5" rx="0.6" ry="0.9" fill="#664500" />
          <ellipse cx="1" cy="-0.5" rx="0.6" ry="0.9" fill="#664500" />
        </g>
      </g>
    </svg>
  );
}

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
      {/* Squinting Happy Eyes */}
      <path d="M10.5 16.5c.3-.5 1-1 1.7-.8s1 .8.8 1.5-.7 1.1-1.4 1.1h-.3c-.6-.2-.8-1.3-.8-1.8zm15 0c-.3-.5-1-1-1.7-.8s-1 .8-.8 1.5.7 1.1 1.4 1.1h.3c.6-.2.8-1.3.8-1.8z" fill="#664500" />
      {/* Laughing Open Mouth */}
      <path d="M18 21c-4.4 0-7 2.4-7 4.5 0 2 2.6 3.5 7 3.5s7-1.5 7-3.5c0-2.1-2.6-4.5-7-4.5z" fill="#D72828" />
      {/* Tongue */}
      <path d="M18 29c-2.8 0-4.6-.7-5-1.7.9 1 2.8 1.7 5 1.7s4.1-.7 5-1.7c-.4 1-2.2 1.7-5 1.7z" fill="#FF7878" />
      {/* Cheeks */}
      <circle cx="9" cy="20" r="2" fill="#FF7878" opacity="0.7" />
      <circle cx="27" cy="20" r="2" fill="#FF7878" opacity="0.7" />
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
