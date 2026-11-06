import type { CSSProperties } from "react";
import styles from "./santa.module.css";
import { PaperTexture } from "./PaperTexture";
import { WaxSeal } from "./WaxSeal";

export interface LetterDetail {
  label: string;
  value: string;
}

export interface LetterProps {
  giverName: string;
  /** ONLY ever pass this from the POST /api/reveal response. */
  recipientName: string;
  /** The short paragraph. Keep it in lib/config.ts. */
  message: string;
  /** e.g. Budget / When / Where, also from lib/config.ts. */
  details: LetterDetail[];
  kicker?: string;
  signOff?: string;
  signature?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Pinyon Script is wide (about 0.45em per letter) and the text column is
 * about 77% of the letter's width. So a name fits on one line when
 * fontSize ≤ 170 / length (in cqw). Capping at the design size (18.6cqw)
 * keeps short names from getting huge. Very long names still wrap,
 * thanks to overflow-wrap.
 */
function nameSize(name: string) {
  const fit = 170 / Math.max(name.length, 1);
  return `min(18.6cqw, ${fit.toFixed(2)}cqw)`;
}

/** Revealed A4 letter: the front face. */
export function Letter({
  giverName,
  recipientName,
  message,
  details,
  kicker = `GrizzHacks Secret Santa · ${new Date().getFullYear()}`,
  signOff = "With cheer,",
  signature = "the GrizzHacks Elves",
  className,
  style,
}: LetterProps) {
  return (
    <article className={`${styles.letter} ${className ?? ""}`} style={style}>
      <PaperTexture />
      <div className={styles.frameOuter} aria-hidden="true" />
      <div className={styles.frameInner} aria-hidden="true" />

      <div className={styles.letterBody}>
        <Holly />
        <p className={styles.letterKicker}>{kicker}</p>
        <p className={styles.greeting}>{giverName}, you’re buying a gift for…</p>
        <h1 className={styles.name} style={{ fontSize: nameSize(recipientName) }}>
          {recipientName}
        </h1>
        <Divider />
        <p className={styles.message}>{message}</p>
        <ul className={styles.details}>
          {details.map((d) => (
            <li key={d.label} className={styles.detailItem}>
              <span className={styles.detailLabel}>{d.label}</span>
              <span>{d.value}</span>
            </li>
          ))}
        </ul>
        <p className={styles.signOff}>{signOff}</p>
        <p className={styles.signature}>{signature}</p>
      </div>

      <WaxSeal className={styles.letterSeal} />
    </article>
  );
}

/** Blank back of the letter: what shows before the card flips. */
export function LetterBack({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`${styles.letter} ${className ?? ""}`} style={style} aria-hidden="true">
      <PaperTexture seed={9} />
      <div className={styles.frameOuter} />
      <div className={styles.frameInner} />
      <div className={styles.letterBody} style={{ justifyContent: "center" }}>
        <Holly />
      </div>
    </div>
  );
}

function Holly() {
  return (
    <svg className={styles.holly} viewBox="0 0 60 30" aria-hidden="true" focusable="false">
      <path d="M30 16 C22 6 10 6 2 12 C8 12 10 16 8 20 C14 18 18 22 18 26 C22 20 26 18 30 16 Z" fill="#2f6b45" />
      <path d="M30 16 C22 6 10 6 2 12 C8 12 10 16 8 20 C14 18 18 22 18 26 C22 20 26 18 30 16 Z" fill="#2f6b45" transform="matrix(-1 0 0 1 60 0)" />
      <path d="M29 16 C20 13 12 12 5 13 M31 16 C40 13 48 12 55 13" fill="none" stroke="#7fae86" strokeWidth=".9" />
      <circle cx="26" cy="16" r="4.4" fill="#b3202a" />
      <circle cx="34" cy="16" r="4.4" fill="#b3202a" />
      <circle cx="30" cy="11" r="4.4" fill="#c22a33" />
      <circle cx="28.6" cy="9.6" r="1.2" fill="#ffffff" opacity=".6" />
    </svg>
  );
}

function Divider() {
  return (
    <svg className={styles.divider} viewBox="0 0 200 12" aria-hidden="true" focusable="false">
      <path d="M0 6 H84 M116 6 H200" stroke="#b08a3e" strokeWidth="1" />
      <circle cx="90" cy="6" r="1.6" fill="#b08a3e" />
      <circle cx="110" cy="6" r="1.6" fill="#b08a3e" />
      <path d="M100 1 L105 6 L100 11 L95 6 Z" fill="#b08a3e" />
    </svg>
  );
}
