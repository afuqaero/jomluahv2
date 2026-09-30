import styles from "./polish.module.css";

export default function MascotBuddy() {
  return <div className={styles.mascot}>
    <span className={styles.mascotNote}>hey, I’m right here ♡</span>
    <svg viewBox="0 0 180 170" role="img" aria-label="A smiling lavender axolotl mascot that floats, blinks, and waves">
      <defs>
        <linearGradient id="axiBody" x1="35" y1="36" x2="140" y2="145" gradientUnits="userSpaceOnUse"><stop stopColor="#d8dcff"/><stop offset=".55" stopColor="#a5b4fc"/><stop offset="1" stopColor="#818cf8"/></linearGradient>
        <linearGradient id="axiTail" x1="110" y1="110" x2="170" y2="143" gradientUnits="userSpaceOnUse"><stop stopColor="#818cf8"/><stop offset="1" stopColor="#6366f1"/></linearGradient>
        <linearGradient id="axiBelly" x1="74" y1="97" x2="112" y2="149" gradientUnits="userSpaceOnUse"><stop stopColor="#f7f5ff"/><stop offset="1" stopColor="#dfe3ff"/></linearGradient>
      </defs>
      <ellipse className={styles.mascotShadow} cx="88" cy="158" rx="48" ry="7" fill="#4338ca" opacity=".13"/>
      <g className={styles.mascotTail}><path d="M116 123c22-21 44-17 47-4 4 14-12 25-34 20l-16-7Z" fill="url(#axiTail)"/><path d="M130 127c15-9 27-9 35-5" fill="none" stroke="#d6d9ff" strokeWidth="3" strokeLinecap="round" opacity=".7"/></g>
      <g className={styles.mascotGills}>
        <path d="M45 68c-20-16-28-16-34-11 12 2 18 10 22 17-17-7-25-5-29 2 12-1 21 4 29 9-15 0-20 6-20 12 8-6 16-5 31-1" fill="#a5b4fc" stroke="#818cf8" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M126 68c20-16 28-16 34-11-12 2-18 10-22 17 17-7 25-5 29 2-12-1-21 4-29 9 15 0 20 6 20 12-8-6-16-5-31-1" fill="#a5b4fc" stroke="#818cf8" strokeWidth="2" strokeLinejoin="round"/>
        <path d="m22 62 11 11m-13 4 12 4m-6 12 11-2m123-29-11 11m13 4-12 4m6 12-11-2" stroke="#eef2ff" strokeWidth="2" strokeLinecap="round" opacity=".85"/>
      </g>
      <path d="M62 104c-11 8-14 23-10 36 3 10 15 16 35 16 21 0 35-6 38-18 4-16-3-29-16-36Z" fill="url(#axiBody)" stroke="#818cf8" strokeWidth="2"/>
      <ellipse cx="86" cy="125" rx="21" ry="24" fill="url(#axiBelly)" opacity=".9"/>
      <path d="M59 141c-12 0-18 8-14 13 4 5 14 3 23-1m47-12c12 0 18 8 14 13-4 5-14 3-23-1" fill="#818cf8" stroke="#6f72df" strokeWidth="2" strokeLinecap="round"/>
      <g className={styles.mascotWave}><path d="M117 108c12-7 20-2 20 5 0 8-7 13-19 14" fill="#a5b4fc" stroke="#777be8" strokeWidth="2"/><path d="m126 111 4-7m2 11 7-5" stroke="#777be8" strokeWidth="2.2" strokeLinecap="round"/></g>
      <path d="M53 110c-11-1-17 8-15 16 2 9 10 13 22 8" fill="#a5b4fc" stroke="#777be8" strokeWidth="2"/>
      <path d="M86 35c31 0 54 22 54 48 0 30-21 37-54 37S32 113 32 83c0-26 23-48 54-48Z" fill="url(#axiBody)" stroke="#8589ec" strokeWidth="2"/>
      <path d="M53 61c7-11 20-18 35-19" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".32"/>
      <circle cx="56" cy="94" r="9" fill="#f8c5dd" opacity=".85"/><circle cx="117" cy="94" r="9" fill="#f8c5dd" opacity=".85"/>
      <g className={styles.openEyes}><ellipse cx="67" cy="77" rx="7" ry="9" fill="#29255e"/><ellipse cx="106" cy="77" rx="7" ry="9" fill="#29255e"/><circle cx="69" cy="74" r="2.4" fill="#fff"/><circle cx="108" cy="74" r="2.4" fill="#fff"/></g>
      <g className={styles.closedEyes}><path d="m59 78 15 1m25 0 15-1" fill="none" stroke="#29255e" strokeWidth="3.4" strokeLinecap="round"/></g>
      <path d="M77 94q9 10 19 0" fill="none" stroke="#4b4387" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="89" cy="52" r="3" fill="#eef2ff" opacity=".85"/><circle cx="98" cy="49" r="2" fill="#eef2ff" opacity=".7"/>
    </svg>
    <span className={styles.mascotSpark} aria-hidden="true">✧</span>
  </div>;
}
