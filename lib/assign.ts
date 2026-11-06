import { randomInt } from "crypto";

/**
 * Fisher-Yates shuffle using crypto.randomInt for unbiased randomness.
 * Returns a new shuffled array (does not mutate the input).
 */
function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Generates a single-cycle assignment: shuffled[i] → shuffled[(i+1) % n].
 * Guarantees no self-assignments and no two-person swaps.
 * Returns an array of [giverId, recipientId] pairs.
 */
export function generateAssignments(
  ids: number[]
): [giverId: number, recipientId: number][] {
  if (ids.length < 3) {
    throw new Error("Need at least 3 participants for Secret Santa");
  }
  const shuffled = shuffle(ids);
  return shuffled.map((id, i) => [id, shuffled[(i + 1) % shuffled.length]]);
}
