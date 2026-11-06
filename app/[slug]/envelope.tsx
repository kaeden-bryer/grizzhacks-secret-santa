"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EVENT } from "@/lib/config";

type Props = {
  name: string;
};

export function Envelope({ name }: Props) {
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [phase, setPhase] = useState<"sealed" | "opening" | "revealed">("sealed");
  const [error, setError] = useState("");
  const [flapBehind, setFlapBehind] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  async function handleReveal() {
    if (phase !== "sealed") return;

    setPhase("opening");
    // The flap takes 0.6s to open, so it passes vertical at about 0.3s.
    // (Motion ignores `delay` on an instant zIndex change, so use a timer.)
    const flapTimer = setTimeout(() => setFlapBehind(true), 300);
    const res = await fetch("/api/reveal", { method: "POST" });

    if (!res.ok) {
      clearTimeout(flapTimer);
      setFlapBehind(false);
      const data = await res.json();
      setError(data.error || "Failed to reveal");
      setPhase("sealed");
      return;
    }

    const data = await res.json();
    setRecipientName(data.name);

    if (shouldReduceMotion) {
      setPhase("revealed");
    } else {
      // Wait for the animation to finish before showing revealed
      setTimeout(() => setPhase("revealed"), 2000);
    }
  }

  function handleSkip() {
    if (recipientName) setPhase("revealed");
  }

  if (phase === "revealed" && recipientName) {
    return (
      <motion.div
        className="flex flex-1 flex-col items-center justify-center px-6"
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {name}, you&apos;re buying a gift for...
          </p>
          <p className="mt-4 text-4xl font-bold text-red-600 dark:text-red-400"
             style={{ fontSize: recipientName.length > 10 ? "1.5rem" : undefined }}>
            {recipientName}
          </p>
          <div className="mt-6 space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <p>Budget: {EVENT.budget}</p>
            <p>{EVENT.exchangeDate} at {EVENT.exchangeTime}</p>
            <p>{EVENT.exchangeLocation}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="relative">
        {/* Envelope container */}
        <div
          className="cursor-pointer"
          onClick={handleReveal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleReveal()}
          aria-label="Open your Secret Santa envelope"
        >
          <div className="relative" style={{ perspective: "800px" }}>
            {/* Envelope body */}
            <div className="relative h-48 w-72 rounded-b-lg bg-red-600 shadow-lg sm:h-56 sm:w-80">
              {/* Envelope front */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-red-700/50 flex items-center justify-center">
                  <span className="text-3xl"></span>
                </div>
              </div>

              {/* Letter that slides up during animation */}
              {phase === "opening" && !shouldReduceMotion && (
                <motion.div
                  className="absolute inset-x-4 bottom-4 top-4 z-[1] rounded bg-white dark:bg-zinc-100"
                  initial={{ y: 0 }}
                  animate={{ y: -120, scale: 1.05 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                />
              )}

              {/* Flap */}
              <motion.div
                className="absolute -top-[1px] left-0 right-0"
                style={{
                  // On top of the letter (z-index 1) while closed; behind it
                  // once past vertical so the letter slides up in front.
                  zIndex: flapBehind ? 0 : 2,
                  transformStyle: "preserve-3d",
                  // `perspective` on an ancestor only applies to its direct
                  // children, so put it in the flap's own transform.
                  transformPerspective: 800,
                  // Hinge along the top edge of the envelope.
                  originY: 0,
                }}
                initial={{ rotateX: 0 }}
                animate={
                  phase === "opening" && !shouldReduceMotion
                    ? { rotateX: 180 }
                    : { rotateX: 0 }
                }
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {/* Flap front */}
                <div
                  className="h-24 w-full sm:h-28"
                  style={{
                    clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                    background: "#b91c1c",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                />
                {/* Flap back */}
                <div
                  className="absolute inset-0 h-24 w-full sm:h-28"
                  style={{
                    // This face is pre-flipped with rotateX(180deg) around its
                    // own center, which turns it upside down. Draw the triangle
                    // point-up so that flip cancels out, and when the flap opens
                    // the back shows as a point-up triangle hinged on the top edge.
                    clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                    background: "#991b1b",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-500">{error}</p>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {phase === "sealed"
            ? "Tap the envelope to reveal your match"
            : "Opening..."}
        </p>

        {phase === "opening" && (
          <button
            onClick={handleSkip}
            className="mt-2 block w-full text-center text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Skip animation
          </button>
        )}
      </div>
    </div>
  );
}
