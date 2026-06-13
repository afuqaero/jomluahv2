"use client";

import { Lightbulb, Sparkle, Star, PaperPlaneTilt } from "@phosphor-icons/react";

export default function IdeaBoardIllustration({ isDarkMode }: { isDarkMode: boolean }) {
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

      {/* Stack of notebooks / folders */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="ideaCoverBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="ideaCoverMiddle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="ideaCoverFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>

        {/* Back notebook */}
        <g transform="rotate(14 100 100) translate(18 -6)">
          <rect x="40" y="40" width="110" height="130" rx="12" fill="url(#ideaCoverBack)" opacity="0.9" />
          <rect x="56" y="62" width="60" height="8" rx="4" fill="#ffffff" opacity="0.35" />
        </g>

        {/* Middle notebook */}
        <g transform="rotate(-10 100 100) translate(-14 4)">
          <rect x="38" y="35" width="112" height="135" rx="12" fill="url(#ideaCoverMiddle)" opacity="0.95" />
          <rect x="54" y="58" width="62" height="8" rx="4" fill="#ffffff" opacity="0.35" />
          <line x1="54" y1="78" x2="120" y2="78" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="4" strokeLinecap="round" />
          <line x1="54" y1="93" x2="108" y2="93" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Front notebook */}
        <g transform="rotate(4 100 100)">
          <rect x="35" y="25" width="130" height="150" rx="14" fill="url(#ideaCoverFront)" />
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
          {/* Ribbon bookmark */}
          <path d="M128 25 L128 70 L118 58 L108 70 L108 25 Z" fill="#FACC15" opacity="0.9" />
        </g>
      </svg>

      {/* Lightbulb, gently bobbing as if a new idea just struck */}
      <div className="absolute bottom-1 right-0 sm:bottom-2 sm:right-1 animate-pen-wiggle">
        <Lightbulb
          weight="duotone"
          className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-md ${isDarkMode ? "text-amber-300" : "text-amber-500"}`}
        />
      </div>

      {/* Floating decorative accents */}
      <Sparkle weight="duotone" className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 animate-float-slow" />
      <Star weight="duotone" className="absolute top-1/3 -left-3 w-5 h-5 sm:w-6 sm:h-6 text-[#6366F1] animate-float-delayed" />
      <PaperPlaneTilt weight="duotone" className="absolute -bottom-1 left-1/4 w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 animate-float-slow" />
    </div>
  );
}
