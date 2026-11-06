import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await sql`
    SELECT p.name
    FROM assignments a
    JOIN participants p ON p.id = a.recipient_id
    WHERE a.giver_id = ${session.participantId}
  `;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No assignment found" },
      { status: 404 }
    );
  }

  // Set revealed_at on first reveal
  await sql`
    UPDATE participants SET revealed_at = now()
    WHERE id = ${session.participantId} AND revealed_at IS NULL
  `;

  return NextResponse.json({ name: rows[0].name });
}
