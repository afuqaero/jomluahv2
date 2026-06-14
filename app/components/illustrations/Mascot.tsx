"use client";

import type { CSSProperties } from "react";
import { PenNib, Sparkle, Star, HeartStraight } from "@phosphor-icons/react";

/**
 * Cartoon mascot characters for the landing page variants.
 * Soft rounded "blob" creatures on the blue-indigo brand palette —
 * no emojis, just simple shapes + gradients.
 */

export function MascotSitting({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 220" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mascotBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="mascotLimb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      {/* shadow */}
      <ellipse cx="120" cy="208" rx="78" ry="10" fill="#4338ca" opacity="0.15" />

      {/* sitting legs */}
      <path d="M55 178 C55 150 85 158 100 178 C108 190 75 196 55 178 Z" fill="url(#mascotLimb)" />
      <path d="M185 178 C185 150 155 158 140 178 C132 190 165 196 185 178 Z" fill="url(#mascotLimb)" />

      {/* arms wrapping around journal */}
      <path d="M62 130 C40 140 38 165 60 172 C80 178 86 152 76 138 Z" fill="url(#mascotLimb)" />
      <path d="M178 130 C200 140 202 165 180 172 C160 178 154 152 164 138 Z" fill="url(#mascotLimb)" />

      {/* body */}
      <rect x="48" y="44" width="144" height="140" rx="68" fill="url(#mascotBody)" />

      {/* ears / nubs */}
      <circle cx="78" cy="46" r="14" fill="#a5b4fc" />
      <circle cx="162" cy="46" r="14" fill="#a5b4fc" />

      {/* antenna */}
      <path d="M120 44 C120 30 124 22 124 14" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="125" cy="10" r="7" fill="#fbbf24" />

      {/* face */}
      <circle cx="96" cy="100" r="11" fill="#ffffff" />
      <circle cx="144" cy="100" r="11" fill="#ffffff" />
      <circle cx="99" cy="103" r="5" fill="#312e81" />
      <circle cx="147" cy="103" r="5" fill="#312e81" />

      {/* cheeks */}
      <circle cx="82" cy="118" r="8" fill="#fbcfe8" opacity="0.7" />
      <circle cx="158" cy="118" r="8" fill="#fbcfe8" opacity="0.7" />

      {/* smile */}
      <path d="M104 118 Q120 134 136 118" stroke="#312e81" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* journal */}
      <g transform="translate(86 132)">
        <rect x="0" y="0" width="68" height="50" rx="6" fill="#ffffff" />
        <rect x="0" y="0" width="68" height="50" rx="6" fill="none" stroke="#c7d2fe" strokeWidth="2" />
        <line x1="12" y1="16" x2="56" y2="16" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1="27" x2="56" y2="27" stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1="38" x2="40" y2="38" stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 30 L60 40 M60 30 L50 40" stroke="#fbbf24" strokeWidth="0" />
        <circle cx="56" cy="38" r="4" fill="#f472b6" opacity="0.8" />
      </g>
    </svg>
  );
}

export function MascotSmall({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 110"
      className={className}
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <defs>
        <linearGradient id={`mascotSmallBody${flip ? "Flip" : ""}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="100" rx="38" ry="7" fill="#4338ca" opacity="0.12" />

      {/* feet */}
      <ellipse cx="42" cy="92" rx="14" ry="9" fill="#4f46e5" />
      <ellipse cx="78" cy="92" rx="14" ry="9" fill="#4f46e5" />

      {/* body */}
      <circle cx="60" cy="56" r="44" fill={`url(#mascotSmallBody${flip ? "Flip" : ""})`} />

      {/* ear */}
      <circle cx="88" cy="22" r="10" fill="#c7d2fe" />

      {/* face */}
      <circle cx="46" cy="52" r="8" fill="#ffffff" />
      <circle cx="74" cy="52" r="8" fill="#ffffff" />
      <circle cx="48" cy="54" r="3.5" fill="#312e81" />
      <circle cx="76" cy="54" r="3.5" fill="#312e81" />
      <path d="M50 68 Q60 78 70 68" stroke="#312e81" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="64" r="6" fill="#fbcfe8" opacity="0.7" />
      <circle cx="80" cy="64" r="6" fill="#fbcfe8" opacity="0.7" />
    </svg>
  );
}

export function MascotWave({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mascotWaveBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {/* raised arm */}
      <path d="M84 50 C104 38 112 50 108 62 C104 74 88 66 82 58 Z" fill="#818cf8" />
      {/* wave lines */}
      <path d="M112 34 L118 28 M118 42 L126 40 M110 50 L118 52" stroke="#c7d2fe" strokeWidth="4" strokeLinecap="round" />

      {/* body */}
      <circle cx="58" cy="62" r="42" fill="url(#mascotWaveBody)" />

      {/* ears */}
      <circle cx="36" cy="28" r="11" fill="#a5b4fc" />
      <circle cx="80" cy="28" r="11" fill="#a5b4fc" />

      {/* antenna */}
      <path d="M58 20 C58 12 60 8 60 4" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="61" cy="3" r="5" fill="#fbbf24" />

      {/* face */}
      <circle cx="44" cy="60" r="9" fill="#ffffff" />
      <circle cx="72" cy="60" r="9" fill="#ffffff" />
      <circle cx="46" cy="62" r="4" fill="#312e81" />
      <circle cx="74" cy="62" r="4" fill="#312e81" />
      <path d="M46 76 Q58 88 70 76" stroke="#312e81" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="34" cy="72" r="6" fill="#fbcfe8" opacity="0.7" />
      <circle cx="82" cy="72" r="6" fill="#fbcfe8" opacity="0.7" />
    </svg>
  );
}

/**
 * Hero illustration: a cartoon mascot sitting cross-legged, journaling —
 * pen mid-wiggle and "ink" lines drawing themselves onto an open notebook.
 * Matches the dashboard's indigo → blue notebook gradient.
 */
export function MascotJournaling({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative ${className ?? ""}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 280 240" className="w-full h-full">
        <defs>
          <linearGradient id="mjBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="mjLimb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="mjBook" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* shadow */}
        <ellipse cx="140" cy="228" rx="95" ry="10" fill="#4338ca" opacity="0.15" />

        {/* crossed sitting legs */}
        <path d="M75 205 C70 175 115 180 132 202 C142 216 95 224 75 205 Z" fill="url(#mjLimb)" />
        <path d="M205 205 C210 175 165 180 148 202 C138 216 185 224 205 205 Z" fill="url(#mjLimb)" />

        {/* body */}
        <rect x="68" y="66" width="144" height="122" rx="62" fill="url(#mjBody)" />

        {/* ears */}
        <circle cx="96" cy="68" r="13" fill="#a5b4fc" />
        <circle cx="184" cy="68" r="13" fill="#a5b4fc" />

        {/* antenna */}
        <path d="M140 66 C140 52 144 44 144 36" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="145" cy="32" r="7" fill="#fbbf24" />

        {/* arms resting on the journal */}
        <path d="M76 150 C56 158 54 182 78 188 C98 192 102 166 92 154 Z" fill="url(#mjLimb)" />
        <path d="M204 150 C224 158 226 182 202 188 C182 192 178 166 188 154 Z" fill="url(#mjLimb)" />

        {/* face */}
        <circle cx="112" cy="122" r="11" fill="#ffffff" />
        <circle cx="168" cy="122" r="11" fill="#ffffff" />
        <circle cx="115" cy="127" r="5" fill="#312e81" />
        <circle cx="171" cy="127" r="5" fill="#312e81" />
        <circle cx="98" cy="140" r="8" fill="#fbcfe8" opacity="0.7" />
        <circle cx="182" cy="140" r="8" fill="#fbcfe8" opacity="0.7" />
        <path d="M118 142 Q140 156 162 142" stroke="#312e81" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* open journal */}
        <g transform="translate(60 158)">
          <rect x="0" y="0" width="160" height="62" rx="8" fill="#ffffff" />
          <rect x="0" y="0" width="160" height="62" rx="8" fill="none" stroke="#c7d2fe" strokeWidth="2" />
          <rect x="74" y="0" width="12" height="62" fill="url(#mjBook)" />
          {/* left page lines */}
          <line x1="12" y1="16" x2="64" y2="16" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" className="animate-draw-line" />
          <line x1="12" y1="28" x2="60" y2="28" stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" className="animate-draw-line" style={{ animationDelay: "0.3s" }} />
          <line x1="12" y1="40" x2="56" y2="40" stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" className="animate-draw-line" style={{ animationDelay: "0.6s" }} />
          {/* right page lines */}
          <line x1="96" y1="16" x2="148" y2="16" stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" className="animate-draw-line" style={{ animationDelay: "0.2s" }} />
          <line x1="96" y1="28" x2="140" y2="28" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" className="animate-draw-line" style={{ animationDelay: "0.5s" }} />
          <line x1="96" y1="40" x2="144" y2="40" stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" className="animate-draw-line" style={{ animationDelay: "0.8s" }} />
        </g>
      </svg>

      {/* pen, gently wiggling as if writing */}
      <div className="absolute" style={{ bottom: "20%", right: "24%" }}>
        <PenNib weight="duotone" className="w-8 h-8 sm:w-10 sm:h-10 text-[#312e81] drop-shadow-md animate-pen-wiggle" />
      </div>

      {/* floating decorative accents */}
      <Sparkle weight="duotone" className="absolute -top-2 -right-1 w-7 h-7 sm:w-9 sm:h-9 text-amber-400 animate-float-slow" />
      <Star weight="duotone" className="absolute top-1/4 -left-3 w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 animate-float-delayed" />
      <HeartStraight weight="duotone" className="absolute bottom-4 right-1/4 w-5 h-5 sm:w-6 sm:h-6 text-blue-400 animate-twinkle" />
    </div>
  );
}
