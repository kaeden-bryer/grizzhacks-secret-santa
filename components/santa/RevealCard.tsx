"use client";

import { motion, useReducedMotion } from "motion/react";
import styles from "./santa.module.css";
import { Letter, LetterBack, type LetterProps } from "./Letter";

interface RevealCardProps {
  /** null until /api/reveal has answered. The front face isn't rendered before then. */
  letter: LetterProps | null;
  /** Flip from the blank back to the letter. */
  flipped: boolean;
  onFlipped?: () => void;
}

/**
 * The card flip. Both faces sit in the same grid cell (grid-area: 1/1),
 * so the card is exactly as big as the larger face. Each face hides its
 * back (backface-visibility, with the -webkit- prefix for iOS). The front
 * starts already turned 180° away. Turning the parent 180° then hides
 * the back face and shows the front.
 *
 * Security: the front face, and the recipient's name with it, isn't in
 * the DOM at all until `letter` is set from the API.
 */
export function RevealCard({ letter, flipped, onFlipped }: RevealCardProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return letter && flipped ? (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} onAnimationComplete={onFlipped}>
        <Letter {...letter} />
      </motion.div>
    ) : (
      <LetterBack />
    );
  }

  return (
    <div className={styles.flipStage}>
      <motion.div
        className={styles.flipper}
        initial={false}
        animate={{ rotateY: flipped && letter ? 180 : 0 }}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
        onAnimationComplete={() => {
          if (flipped && letter) onFlipped?.();
        }}
      >
        <LetterBack className={styles.flipFace} />
        {letter && <Letter {...letter} className={`${styles.flipFace} ${styles.flipFront}`} />}
      </motion.div>
    </div>
  );
}
