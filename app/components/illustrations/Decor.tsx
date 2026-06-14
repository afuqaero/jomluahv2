"use client";

/**
 * Small reusable decorative SVG shapes shared by the landing page variants.
 * Kept on the blue-indigo brand palette so they drop into either layout.
 */

export function GroundBlob({ className, gradientId = "groundBlobGradient" }: { className?: string; gradientId?: string }) {
  return (
    <svg
      viewBox="0 0 1440 420"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="55%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <path
        d="M0,170 C160,60 380,10 700,30 C1020,50 1200,140 1440,110 L1440,420 L0,420 Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

export function CloudShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 70" className={className} aria-hidden="true">
      <ellipse cx="40" cy="42" rx="36" ry="24" fill="currentColor" />
      <ellipse cx="72" cy="32" rx="28" ry="22" fill="currentColor" />
      <ellipse cx="90" cy="46" rx="24" ry="18" fill="currentColor" />
    </svg>
  );
}

export function SparkleStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M50 0 C53 28 56 41 100 50 C56 59 53 72 50 100 C47 72 44 59 0 50 C44 41 47 28 50 0 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * A little twinkling cluster: a soft 4-point star with a gradient glow,
 * plus a tiny companion star and dot for a cutesy "sparkle" feel.
 * Pairs with the `.animate-twinkle` keyframes (no box-shadow halo).
 */
export function TwinkleSparkle({ className, gradientId = "twinkleSparkleGradient" }: { className?: string; gradientId?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      {/* main star */}
      <path
        d="M50 6 C53 30 57 43 94 50 C57 57 53 70 50 94 C47 70 43 57 6 50 C43 43 47 30 50 6 Z"
        fill={`url(#${gradientId})`}
      />
      {/* small companion star */}
      <path
        d="M82 10 C83 19 85 23 96 26 C85 29 83 33 82 42 C81 33 79 29 68 26 C79 23 81 19 82 10 Z"
        fill="#a5b4fc"
        opacity="0.95"
      />
      {/* tiny dot */}
      <circle cx="16" cy="82" r="5.5" fill="#a5b4fc" opacity="0.85" />
    </svg>
  );
}

export function PlantShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="potGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {/* leaves */}
      <path d="M50 70 C20 65 12 30 22 8 C44 18 54 45 50 70 Z" fill="#a7f3d0" />
      <path d="M50 70 C80 65 88 32 78 10 C56 20 46 46 50 70 Z" fill="#6ee7b7" />
      <path d="M50 70 C50 40 50 18 50 2 C56 22 60 48 50 70 Z" fill="#34d399" />
      {/* pot */}
      <path d="M28 72 L72 72 L66 112 C66 116 34 116 34 112 Z" fill="url(#potGradient)" />
      <rect x="26" y="66" width="48" height="10" rx="5" fill="#4f46e5" />
    </svg>
  );
}

export function WaveDivider({ className, fill = "#ffffff" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d="M0,40 C240,90 480,0 720,30 C960,60 1200,10 1440,50 L1440,100 L0,100 Z" fill={fill} />
    </svg>
  );
}
