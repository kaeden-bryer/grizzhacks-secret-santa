"use client";

import { useState, useCallback } from "react";
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
 * After the initial reveal, clicking the card toggles it: it flips back
 * and shrinks (to hide from people nearby), then flips and grows on the
 * next click.
 *
 * Security: the front face, and the recipient's name with it, isn't in
 * the DOM at all until `letter` is set from the API.
 */
export function RevealCard({ letter, flipped, onFlipped }: RevealCardProps) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [hidden, setHidden] = useState(false);

  const handleInitialFlipDone = useCallback(() => {
    setRevealed(true);
    onFlipped?.();
  }, [onFlipped]);

  const toggleHide = useCallback(() => {
    if (revealed) setHidden((h) => !h);
  }, [revealed]);

  if (reduce) {
    const showing = flipped && letter && !hidden;
    return (
      <motion.div
        animate={{ opacity: showing ? 1 : 0, scale: showing ? 1 : 0.55 }}
        transition={{ duration: 0.4 }}
        onAnimationComplete={() => {
          if (flipped && letter && !revealed) handleInitialFlipDone();
        }}
        onClick={toggleHide}
        style={{ cursor: revealed ? "pointer" : undefined }}
      >
        {showing ? <Letter {...letter!} /> : <LetterBack />}
      </motion.div>
    );
  }

  // After the initial reveal, clicking hides (flips back + shrinks) or shows again.
  const showFront = flipped && letter && !hidden;

  return (
    <div className={styles.flipStage} onClick={toggleHide} style={{ cursor: revealed ? "pointer" : undefined }}>
      <motion.div
        className={styles.flipper}
        initial={false}
        animate={{
          rotateY: showFront ? 180 : 0,
          scale: hidden ? 0.55 : 1,
        }}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
        onAnimationComplete={() => {
          if (showFront && !revealed) handleInitialFlipDone();
        }}
      >
        <LetterBack className={styles.flipFace} />
        {letter && <Letter {...letter} className={`${styles.flipFace} ${styles.flipFront}`} />}
      </motion.div>
    </div>
  );
}
