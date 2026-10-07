import styles from "./polish.module.css";

export default function BrandMark() {
  return <svg className={styles.brandMark} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M13 7h16a8 8 0 0 1 8 8v10a8 8 0 0 1-8 8h-6l-6 4v-5" fill="#c7d2fe" />
    <path d="M11 3h15a9 9 0 0 1 9 9v10a9 9 0 0 1-9 9H15l-9 5v-8a9 9 0 0 1-4-7v-9a9 9 0 0 1 9-9Z" fill="#6366f1" />
    <path d="M18.5 23.5s-8-4.6-8-9a4.4 4.4 0 0 1 8-2.5 4.4 4.4 0 0 1 8 2.5c0 4.4-8 9-8 9Z" fill="#eef2ff" />
  </svg>;
}
