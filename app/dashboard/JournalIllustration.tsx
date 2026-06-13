"use client";

import { PenNib, Sparkle, Star, HeartStraight } from "@phosphor-icons/react";

export default function JournalIllustration({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 shrink-0 flex items-center justify-center"
    >
      {/* Ambient glow */}
      <div
        className={`absolute inset-0 rounded-full blur-2xl animate-pulse-breath ${
          isDarkMode ? "bg-gradient-to-tr from-amber-400/20 to-rose-400/20" : "bg-indigo-200/40"
        }`}
      />

      {/* Notebook */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="journalCoverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <g transform="rotate(-8 100 100)">
          {/* Cover */}
          <rect x="35" y="25" width="130" height="150" rx="14" fill="url(#journalCoverGradient)" />
          {/* Spiral binding */}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx="45" cy={48 + i * 28} r="4" fill={isDarkMode ? "#1c1917" : "#F0F2F6"} />
          ))}
          {/* Title block */}
          <rect x="62" y="55" width="80" height="10" rx="5" fill="#ffffff" opacity="0.35" />
          {/* Handwritten lines, drawing in on a loop */}
          <line x1="62" y1="85" x2="142" y2="85" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="4" strokeLinecap="round" className="animate-draw-line" />
          <line x1="62" y1="100" x2="130" y2="100" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="4" strokeLinecap="round" className="animate-draw-line" style={{ animationDelay: "0.4s" }} />
          <line x1="62" y1="115" x2="138" y2="115" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="4" strokeLinecap="round" className="animate-draw-line" style={{ animationDelay: "0.8s" }} />
          <line x1="62" y1="130" x2="110" y2="130" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="4" strokeLinecap="round" className="animate-draw-line" style={{ animationDelay: "1.2s" }} />
          {/* Ribbon bookmark */}
          <path d="M128 25 L128 70 L118 58 L108 70 L108 25 Z" fill="#FACC15" opacity="0.9" />
        </g>
      </svg>

      {/* Pen, gently wiggling as if writing */}
      <div className="absolute bottom-1 right-0 sm:bottom-2 sm:right-1 animate-pen-wiggle">
        <PenNib
          weight="duotone"
          className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-md ${isDarkMode ? "text-white" : "text-[#1a202c]"}`}
        />
      </div>

      {/* Floating decorative accents */}
      <Sparkle weight="duotone" className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 animate-float-slow" />
      <Star weight="duotone" className="absolute top-1/3 -left-3 w-5 h-5 sm:w-6 sm:h-6 text-[#6366F1] animate-float-delayed" />
      <HeartStraight weight="duotone" className="absolute -bottom-1 left-1/4 w-5 h-5 sm:w-6 sm:h-6 text-rose-400 animate-float-slow" />
    </div>
  );
}
