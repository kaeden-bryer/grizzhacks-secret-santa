"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Scene, Envelope, RevealCard, type LetterProps } from "@/components/santa";
import s from "@/components/santa/santa.module.css";

/** Made-up names only. Never real participants (see CLAUDE.md). */
const DEMO: LetterProps = {
  giverName: "Alice",
  recipientName: "Ebenezer",
  message:
    "Keep it secret until the exchange! Wrap your gift, tag it with their name only, and bring it to HQ. Not sure what they’d like? Ask around — quietly.",
  details: [
    { label: "Budget", value: "$15" },
    { label: "When", value: "Friday, December 11 · 6:00 PM" },
    { label: "Where", value: "GrizzHacks HQ" },
  ],
};

/**
 * sealed → opening (flap swings) → rising (card slides up + scales) → revealed (card flips)
 * The real page does the same, but fetches POST /api/reveal on tap and
 * only sets `letter` (and lets the card flip) once that has resolved.
 */
type Stage = "sealed" | "opening" | "rising" | "revealed";

export function PreviewClient() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("sealed");
  const showLetter = stage === "rising" || stage === "revealed";

  return (
    <Scene>
      <main className={s.stage}>
        <AnimatePresence mode="wait">
          {!showLetter ? (
            <motion.div key="envelope" className={s.column} exit={{ opacity: 0, y: 60 }} transition={{ duration: 0.45 }}>
              <p className={s.kicker}>GrizzHacks Secret Santa</p>
              <h1 className={s.title}>A letter for {DEMO.giverName}</h1>
              <p className={s.subtitle}>Someone’s name is sealed inside.</p>
              <Envelope
                open={stage !== "sealed"}
                onOpen={() => setStage(reduce ? "revealed" : "opening")}
                onFlapOpened={() => setStage("rising")}
              />
              <p className={s.caption}>Tap the seal to open</p>
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              className={s.column}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 160, scale: 0.55 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reduce ? 0.4 : 0.9, ease: [0.2, 0.8, 0.2, 1] }}
              onAnimationComplete={() => setStage("revealed")}
            >
              <p className={s.whisper}>Shh — this stays between us.</p>
              <RevealCard letter={DEMO} flipped={stage === "revealed"} />
            </motion.div>
          )}
        </AnimatePresence>

        {(stage === "opening" || stage === "rising") && (
          <button type="button" className={s.skip} onClick={() => setStage("revealed")}>
            Skip animation
          </button>
        )}
        {stage === "revealed" && (
          <button type="button" className={s.skip} onClick={() => setStage("sealed")}>
            Replay (preview only)
          </button>
        )}
      </main>
    </Scene>
  );
}
