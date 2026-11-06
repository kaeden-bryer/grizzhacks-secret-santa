import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { slug, pin } = await req.json();

  if (typeof slug !== "string" || typeof pin !== "string" || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const rows = await sql`
    SELECT id, pin_hash, failed_attempts, locked_until
    FROM participants WHERE slug = ${slug}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const participant = rows[0];

  // Check lock
  if (participant.locked_until && new Date(participant.locked_until as string) > new Date()) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const valid = await compare(pin, participant.pin_hash as string);

  if (!valid) {
    const attempts = (participant.failed_attempts as number) + 1;
    if (attempts >= 5) {
      await sql`
        UPDATE participants
        SET failed_attempts = ${attempts}, locked_until = now() + interval '15 minutes'
        WHERE id = ${participant.id}
      `;
    } else {
      await sql`
        UPDATE participants SET failed_attempts = ${attempts}
        WHERE id = ${participant.id}
      `;
    }
    return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
  }

  // Success: reset failed attempts, create session
  await sql`
    UPDATE participants SET failed_attempts = 0, locked_until = NULL
    WHERE id = ${participant.id}
  `;

  await createSession(participant.id as number);
  return NextResponse.json({ ok: true });
}
