import Link from "next/link";
import styles from "./redesign.module.css";

const concepts = [
  { slug: "clarity", number: "01", name: "A little clarity", tag: "EDITORIAL · MY RECOMMENDATION", description: "A quieter first impression. Confident typography, generous space, and a tangible preview of your daily check-in.", title: <>Make room<br />for <em>you.</em></> },
  { slug: "companion", number: "02", name: "A familiar friend", tag: "PLAYFUL · MASCOT FIRST", description: "The personality you already have, with more purpose. A friendly companion and a simple path from feeling to reflection.", title: <>Big feelings.<br /><em>Little steps.</em></> },
  { slug: "afterhours", number: "03", name: "A softer landing", tag: "IMMERSIVE · DEEP INDIGO", description: "An atmospheric, evening-inspired space. Your existing indigo palette becomes a calm backdrop for one meaningful action.", title: <>Let the day<br /><em>unfold.</em></> },
];

export default function RedesignGallery() {
  return <main className={styles.gallery}>
    <header className={styles.galleryHeader}><Link href="/" className={styles.logo}>JomLuah<span>✳</span></Link><span>DESIGN EXPLORATIONS / 2026</span><Link href="/">View original ↗</Link></header>
    <div className={styles.galleryIntro}><span className={styles.eyebrow}>SAME SOUL. THREE NEW PERSPECTIVES.</span><h1>A little more space.<br />A lot more <em>feeling.</em></h1><p>Three directions for JomLuah’s landing page, using your existing indigo, lavender, and deep violet palette. Open a concept to explore it.</p></div>
    <div className={styles.conceptGrid}>{concepts.map(c => <Link key={c.slug} href={`/redesign/${c.slug}`} className={styles.conceptCard}>
      <div className={`${styles.thumbnail} ${styles[c.slug]}`}><span className={styles.miniLogo}>JomLuah ✳</span><h2>{c.title}</h2><div className={styles.miniOrb}/><span className={styles.miniButton}>A moment for you ↗</span></div>
      <div className={styles.conceptInfo}><span>{c.tag}</span><h2><small>{c.number}</small>{c.name}<b>↗</b></h2><p>{c.description}</p></div>
    </Link>)}</div>
    <footer className={styles.galleryFooter}><span>Original homepage and existing previews are preserved.</span><div><i style={{background:"#eef2ff"}}/><i style={{background:"#a5b4fc"}}/><i style={{background:"#6366f1"}}/><i style={{background:"#1e1b4b"}}/> Your existing palette</div></footer>
  </main>;
}
