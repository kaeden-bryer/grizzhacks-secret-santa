import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Fail loudly if the secret is missing or weak. Otherwise jose gets an empty
// key and WebCrypto throws a DOMException that Next.js surfaces as the
// confusing "Cannot set property message ... which has only a getter".
const rawSecret = process.env.SESSION_SECRET;
if (!rawSecret || rawSecret.length < 32) {
  throw new Error(
    "SESSION_SECRET is missing or shorter than 32 chars. Generate one with `openssl rand -base64 32`."
  );
}
const SECRET = new TextEncoder().encode(rawSecret);
const COOKIE_NAME = "ss_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 60; // 60 days

export async function createSession(participantId: number): Promise<void> {
  const token = await new SignJWT({ participantId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(SECRET);

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function getSession(): Promise<{ participantId: number } | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { participantId: payload.participantId as number };
  } catch {
    return null;
  }
}
