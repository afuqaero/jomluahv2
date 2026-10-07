"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ArrowRight, ChatCircleDots, NotePencil, ChartLineUp, Sparkle, LockSimple, Sun, Moon, Heart, Smiley, SmileyMeh, SmileySad } from "@phosphor-icons/react";
import { MascotSitting } from "../components/illustrations/Mascot";
import styles from "./redesign.module.css";

type Kind = "clarity" | "companion" | "afterhours";
const options = [{ slug: "clarity", label: "01 Clarity" }, { slug: "companion", label: "02 Companion" }, { slug: "afterhours", label: "03 After hours" }];
const moods = [{ label: "Low", icon: SmileySad }, { label: "A little off", icon: SmileyMeh }, { label: "Okay", icon: Smiley }, { label: "Good", icon: Sun }, { label: "Great", icon: Sparkle }];
const responses = ["Some days ask a little more of us. You can start with just one thought.", "You don’t have to have it all figured out. Give yourself a little room.", "Okay is a perfectly good place to start. What’s on your mind?", "Let’s make a little space for what went well today.", "Hold onto this feeling. What made today feel good?"];

function CheckIn({ compact = false }: { compact?: boolean }) {
  const [mood, setMood] = useState(2);
  return <div className={`${styles.checkIn} ${compact ? styles.compactCheckIn : ""}`}>
    <div className={styles.cardTop}><span><Sun size={16} /> A MOMENT FOR YOU</span><span>DEMO</span></div>
    <h3>How are you, really?</h3><p>Every feeling has a place here.</p>
    <div className={styles.moods} aria-label="Try a mood check-in">{moods.map((item, i) => <button key={item.label} type="button" aria-pressed={mood === i} onClick={() => setMood(i)} className={mood === i ? styles.selectedMood : ""}><item.icon size={29} weight={mood === i ? "fill" : "regular"} /><span>{item.label}</span></button>)}</div>
    <div className={styles.moodResponse} aria-live="polite"><Sparkle size={20} /><p>{responses[mood]}</p></div>
    <Link className={styles.cardLink} href="/register">Make space for this feeling <ArrowUpRight size={17} /></Link>
    <small className={styles.demoNote}>Try it out · Nothing is saved in this preview</small>
  </div>;
}

function Actions({ light = false }: { light?: boolean }) {
  return <div className={styles.actions}><Link className={`${styles.primary} ${light ? styles.lightButton : ""}`} href="/register">Find your breathing room <ArrowUpRight size={19} /></Link><a href="#how-it-works" className={styles.secondary}>Take a look around <ArrowRight size={17} /></a></div>;
}

function Features({ kind }: { kind: Kind }) {
  return <section id="how-it-works" className={styles.features}>
    <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>SMALL RITUALS. A LITTLE MORE ROOM.</span><h2>{kind === "companion" ? "A little support, your way." : "You don’t have to untangle it all at once."}</h2></div><p>A conversation, a page, a moment of reflection.<br />Start wherever feels right.</p></div>
    <div className={styles.featureGrid}>
      <Link href="/chat" className={styles.feature}><div className={styles.featureTop}><ChatCircleDots size={29} /><span>01 / TALK</span><ArrowUpRight size={19} /></div><h3>Let it out.</h3><p>A thoughtful AI companion for the thoughts you haven’t found the words for yet.</p><div className={styles.chatSnippet}><span>There’s a lot on my mind.</span><span>We can take it one thought at a time.</span></div></Link>
      <Link href="/journal" className={styles.feature}><div className={styles.featureTop}><NotePencil size={29} /><span>02 / REFLECT</span><ArrowUpRight size={19} /></div><h3>Put it on paper.</h3><p>A private journal for the messy thoughts, small joys, and everything in between.</p><div className={styles.journalSnippet}>Today, I’m giving myself permission to…<span>take things a little slower.</span></div></Link>
      <Link href="/memories" className={styles.feature}><div className={styles.featureTop}><ChartLineUp size={29} /><span>03 / GROW</span><ArrowUpRight size={19} /></div><h3>See the little shifts.</h3><p>Look back on your moods and memories. Find the patterns in your own story.</p><div className={styles.spectrum} aria-label="Illustrative mood spectrum">{[35,55,42,70,60,83,75].map((height,i)=><i key={i} style={{height:`${height}%`}}/>)}<span>Every day is part of the picture.</span></div></Link>
    </div>
  </section>;
}

function About() {
  return <section className={styles.about} id="about"><span className={styles.eyebrow}>A SPACE TO BE HUMAN</span><h2>Not every day has to be a breakthrough.<br /><em>Showing up is enough.</em></h2><p>JomLuah brings conversation, journaling, and reflection together for the ups, downs, and in-betweens of student life.</p><Link href="/register" className={styles.primary}>Start with one small step <ArrowUpRight size={18}/></Link></section>;
}

export default function Concept({ kind }: { kind: Kind }) {
  return <div className={`${styles.page} ${styles[kind]}`}>
    <aside className={styles.previewBar} aria-label="Design previews"><Link href="/redesign">← All concepts</Link><nav aria-label="Choose design">{options.map(option=><Link key={option.slug} href={`/redesign/${option.slug}`} aria-current={kind === option.slug ? "page" : undefined}>{option.label}</Link>)}</nav><Link href="/">Original ↗</Link></aside>
    <header className={styles.nav}><Link href="/redesign" className={styles.logo}>JomLuah<span>✳</span></Link><nav aria-label="Main navigation"><a href="#how-it-works">The little things</a><a href="#about">Our space</a></nav><div><Link href="/login" className={styles.signIn}>Sign in</Link><Link href="/register" className={styles.navCta}>Come on in <ArrowUpRight size={16}/></Link></div></header>
    <main>
      {kind === "clarity" && <section className={styles.clarityHero}>
        <div className={styles.heroCopy}><span className={styles.eyebrow}><span className={styles.statusDot}/> YOUR SPACE TO EXHALE</span><h1>Make room<br />for <em>you.</em></h1><p>You carry a lot. You don’t have to carry it all alone. A little conversation, a little reflection — at your own pace.</p><Actions/><div className={styles.heroFootnote}><LockSimple size={15}/> Your thoughts. Your pace. Your space.</div></div>
        <div className={styles.clarityVisual}><div className={styles.orbit}/><span className={styles.orbitStar}>✳</span><div className={styles.floatingNote}>a little check-in goes a long way <span>↴</span></div><CheckIn/><div className={styles.littleReminder}><Heart size={20} weight="fill"/><div><strong>A gentle reminder</strong><span>You’re allowed to take your time.</span></div></div><span className={styles.visualCaption}>SMALL STEPS COUNT. EVEN TODAY.</span></div>
      </section>}
      {kind === "companion" && <section className={styles.companionHero}>
        <div className={styles.companionTitle}><span className={styles.eyebrow}>HEY, YOU. GLAD YOU’RE HERE.</span><h1>Big feelings.<br /><em>Little steps.</em><span className={styles.titleSpark}>✳</span></h1><p>A friendly ear. A fresh page. A moment just for you.<br />Meet your everyday space to feel a little lighter.</p><Actions/></div>
        <div className={styles.mascotScene}><div className={styles.sceneRing}/><div className={styles.speech}>You don’t need the right words.<br /><strong>Just start with “hey”.</strong></div><MascotSitting className={styles.heroMascot}/><span className={styles.sceneSpark}>✧</span><div className={styles.sceneLabel}><Heart size={17} weight="fill"/> In your corner, at your pace.</div><div className={styles.smallJournal}><NotePencil size={21}/><span>A LITTLE NOTE TO SELF</span><p>Progress can be<br /><em>quiet, too.</em></p><i/><i/></div></div>
        <div className={styles.companionStrip}><span>NO PERFECT WORDS NEEDED</span><span>✳</span><span>COME AS YOU ARE</span><span>✳</span><span>ONE LITTLE STEP AT A TIME</span></div>
      </section>}
      {kind === "afterhours" && <section className={styles.nightHero}>
        <div className={styles.nightBackdrop} aria-hidden="true"><div/><div/><div/></div><span className={styles.nightStar}>✦</span><span className={styles.nightStarTwo}>✧</span>
        <div className={styles.nightCopy}><span className={styles.eyebrow}><Moon size={14}/> THE WORLD CAN WAIT A MOMENT</span><h1>Let the day<br /><em>unfold.</em></h1><p>For everything you held in today.<br />A quiet space to talk, reflect, and come back to yourself.</p><Actions light/><span className={styles.nightFootnote}>No rush. No perfect words. Just you.</span></div>
        <div className={styles.nightCard}><CheckIn compact/></div><div className={styles.nightBottom}><span>YOUR DAILY EXHALE</span><span>SCROLL TO EXPLORE ↓</span><span>ONE MOMENT AT A TIME</span></div>
      </section>}
      {kind === "clarity" && <div className={styles.benefitStrip}><span>Made for the in-between moments</span><span><ChatCircleDots size={18}/> A space to talk</span><span><NotePencil size={18}/> A page of your own</span><span><ChartLineUp size={18}/> Room to grow</span></div>}
      <Features kind={kind}/>
      {kind === "companion" && <section className={styles.trySection}><div><span className={styles.eyebrow}>LET’S START SMALL</span><h2>No right answer.<br />Just your answer.</h2><p>A check-in doesn’t have to be a big thing.<br />Try choosing the feeling closest to yours.</p></div><CheckIn/></section>}
      <About/>
    </main>
    <footer className={styles.footer}><Link href="/" className={styles.logo}>JomLuah<span>✳</span></Link><span>A little lighter, together.</span><p>AI companionship for everyday reflection.<br />Not a substitute for professional care.</p><span>© 2026 JomLuah</span></footer>
  </div>;
}
