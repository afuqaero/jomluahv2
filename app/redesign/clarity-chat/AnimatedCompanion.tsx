"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowUp, Pause, Play, ArrowCounterClockwise, Robot, Sparkle } from "@phosphor-icons/react";
import styles from "./chat.module.css";

const feeling = "I’ve been feeling overwhelmed lately. Like I’m falling behind.";
const reply = "That sounds like a lot to carry. You don’t have to figure everything out today. What’s one thing that’s been weighing on you?";
const duration = 16000;
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export default function AnimatedCompanion() {
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setElapsed(value => (value + 50) % duration);
    }, 50);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion]);

  const time = reducedMotion ? 12000 : elapsed;
  const userTyping = time >= 700 && time < 3900;
  const userVisible = time >= 700;
  const thinking = time >= 4100 && time < 5500;
  const responding = time >= 5500 && time < 10400;
  const aiVisible = time >= 4100;
  const userText = feeling.slice(0, Math.max(0, Math.floor((time - 700) / 42)));
  const aiText = reply.slice(0, Math.max(0, Math.floor((time - 5500) / 35)));
  const status = userTyping ? "You’re finding the words…" : thinking ? "Your companion is thinking…" : responding ? "A little understanding, one word at a time." : time >= 10400 ? "You don’t have to carry it alone." : "Start wherever feels right.";

  return <section className={styles.card} aria-label="Animated AI companion conversation demo" data-paused={!playing}>
    <header className={styles.header}><span className={styles.avatar}><Robot size={23} weight="duotone"/></span><div><h3>Your AI companion</h3><span><i/> A little space to be heard</span></div><span className={styles.demo}>DEMO</span></header>
    <div className={styles.conversation} aria-hidden="true">
      <div className={styles.day}>A MOMENT, JUST FOR YOU</div>
      <div className={`${styles.userRow} ${userVisible ? styles.visible : ""}`}><span className={styles.who}>YOU <span>{userTyping ? "· typing" : "· just now"}</span></span><div className={styles.userBubble}>{userText || "\u00a0"}{userTyping && <i className={styles.caret}/>}</div></div>
      <div className={`${styles.aiRow} ${aiVisible ? styles.visible : ""}`}><span className={styles.smallAvatar}><Robot size={16} weight="duotone"/></span><div className={styles.aiContent}><span className={styles.who}>JOMLUAH <Sparkle size={10}/></span><div className={styles.aiBubble}>{thinking ? <span className={styles.dots}><i/><i/><i/></span> : <>{aiText || "\u00a0"}{responding && <i className={styles.caret}/>}</>}</div></div></div>
    </div>
    <p className={styles.srOnly}>Example conversation. You: {feeling} AI companion: {reply}</p>
    <div className={styles.status} aria-hidden="true"><Sparkle size={12}/>{status}</div>
    <div className={styles.composer} aria-hidden="true"><span>{userTyping ? "Finding the words…" : "Let it out. We’re listening."}</span><span className={styles.send}><ArrowUp size={16}/></span></div>
    <footer className={styles.footer}><span>Illustrated conversation · No messages sent</span><div>{!reducedMotion && <><button type="button" aria-label={playing ? "Pause conversation animation" : "Play conversation animation"} onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={13} weight="fill"/> : <Play size={13} weight="fill"/>}</button><button type="button" aria-label="Replay conversation animation" onClick={() => { setElapsed(0); setPlaying(true); }}><ArrowCounterClockwise size={14}/></button></>}</div></footer>
  </section>;
}
