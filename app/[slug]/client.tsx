"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Scene, Envelope, RevealCard, type LetterProps } from "@/components/santa";
import s from "@/components/santa/santa.module.css";
import { EVENT, LETTER_DETAILS } from "@/lib/config";

type Props = {
  name: string;
  slug: string;
  hasPin: boolean;
  isAuthenticated: boolean;
};

// sealed → opening (flap swings) → rising (card slides up) → ready → revealed (flip done).
// The flip waits for BOTH "card in place" and "API answered".
type Stage = "sealed" | "opening" | "rising" | "ready" | "revealed";

export function ParticipantClient({ name, slug, hasPin, isAuthenticated }: Props) {
  const [authed, setAuthed] = useState(isAuthenticated);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 6) return;

    setLoading(true);
    setError("");

    const endpoint = hasPin ? "/api/verify-pin" : "/api/set-pin";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, pin }),
    });

    if (res.ok) {
      setAuthed(true);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
    setLoading(false);
  }

  if (authed) {
    return (
      <Scene>
        <main className={s.stage}>
          <RevealFlow name={name} />
        </main>
      </Scene>
    );
  }

  return (
    <Scene>
      <main className={s.stage}>
        <div className={s.column}>
          <p className={s.kicker}>GrizzHacks Secret Santa</p>
          <h1 className={s.title}>Hey, {name}!</h1>
          <p className={s.subtitle}>
            {hasPin ? "Enter your 6-digit PIN" : "Set a 6-digit PIN to claim your name"}
          </p>
          {hasPin && (
            <p className={s.note}>If you didn&apos;t set a PIN for this name, message Kaeden.</p>
          )}

          <form onSubmit={handleSubmit} className={s.form}>
            <label htmlFor="pin" className={s.label}>
              {hasPin ? "Your PIN" : "Choose a PIN"}
            </label>
            <input
              id="pin"
              className={s.pinInput}
              type="password"
              inputMode="numeric"
              autoComplete={hasPin ? "current-password" : "new-password"}
              pattern="\d{6}"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              autoFocus
            />
            {error && (
              <p className={s.error} role="alert">
                {error}
              </p>
            )}
            <button type="submit" className={s.button} disabled={pin.length !== 6 || loading}>
              {loading ? "..." : hasPin ? "Enter" : "Set PIN"}
            </button>
          </form>
        </div>
      </main>
    </Scene>
  );
}

function RevealFlow({ name }: { name: string }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("sealed");
  // The recipient's name lives ONLY in this client state, from POST /api/reveal.
  const [recipient, setRecipient] = useState<string | null>(null);
  const [error, setError] = useState("");

  const showLetter = stage === "rising" || stage === "ready" || stage === "revealed";
  const letter: LetterProps | null = recipient
    ? {
        giverName: name,
        recipientName: recipient,
        message: EVENT.message,
        details: [...LETTER_DETAILS],
      }
    : null;

  async function handleOpen() {
    if (stage !== "sealed") return;
    setError("");
    // Reduced motion: no flap/slide, just go to the card and fade.
    setStage(reduce ? "ready" : "opening");

    // Start the request right away; the flap animation runs while it's in flight.
    try {
      const res = await fetch("/api/reveal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reveal");
      setRecipient(data.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reveal");
    }
  }

  return (
    <AnimatePresence mode="wait">
      {!showLetter ? (
        <motion.div key="envelope" className={s.column} exit={{ opacity: 0, y: reduce ? 0 : 60 }} transition={{ duration: 0.45 }}>
          <p className={s.kicker}>GrizzHacks Secret Santa</p>
          <h1 className={s.title}>A letter for {name}</h1>
          <p className={s.subtitle}>Someone’s name is sealed inside.</p>
          <Envelope open={stage !== "sealed"} onOpen={handleOpen} onFlapOpened={() => setStage("rising")} />
          <p className={s.caption}>Tap the seal to open</p>
          {stage === "opening" && (
            <button type="button" className={s.skip} onClick={() => setStage("ready")}>
              Skip animation
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="letter"
          className={s.column}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 160, scale: 0.55 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduce ? 0.4 : 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          onAnimationComplete={() => setStage("ready")}
        >
          <p className={s.whisper}>Shh — this stays between us.</p>
          {/* Flip only when the card is in place AND the API has answered. Never without data. */}
          <RevealCard
            letter={letter}
            flipped={(stage === "ready" || stage === "revealed") && letter !== null}
            onFlipped={() => setStage("revealed")}
          />
          {stage === "revealed" && (
            <p className={s.caption}>Tap the card to hide</p>
          )}
          {error && (
            <p className={s.error} role="alert">
              {error}
            </p>
          )}
          {stage === "rising" && (
            <button type="button" className={s.skip} onClick={() => setStage("ready")}>
              Skip animation
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
