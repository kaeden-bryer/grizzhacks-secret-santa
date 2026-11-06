"use client";

import { useState } from "react";
import { Envelope } from "./envelope";

type Props = {
  name: string;
  slug: string;
  hasPin: boolean;
  isAuthenticated: boolean;
};

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
    return <Envelope name={name} />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Hey, {name}!
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {hasPin ? "Enter your 6-digit PIN" : "Set a 6-digit PIN to claim your name"}
          </p>
          {hasPin && (
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              If you didn&apos;t set a PIN for this name, message Kaeden.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-center text-2xl tracking-[0.3em] text-foreground placeholder:text-zinc-300 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-600"
            autoFocus
          />

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={pin.length !== 6 || loading}
            className="w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "..." : hasPin ? "Enter" : "Set PIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
