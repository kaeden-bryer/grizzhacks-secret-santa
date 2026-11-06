import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { slug, pin } = await req.json();

  if (typeof slug !== "string" || typeof pin !== "string" || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const pinHash = await hash(pin, 10);

  // Atomic claim: only succeeds if pin_hash is still NULL
  const rows = await sql`
    UPDATE participants SET pin_hash = ${pinHash}
    WHERE slug = ${slug} AND pin_hash IS NULL
    RETURNING id
  `;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "This name has already been claimed." },
      { status: 409 }
    );
  }

  await createSession(rows[0].id as number);
  return NextResponse.json({ ok: true });
}
