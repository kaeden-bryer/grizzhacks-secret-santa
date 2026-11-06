import { neon } from "@neondatabase/serverless";
import { generateAssignments } from "../lib/assign";

const sql = neon(process.env.DATABASE_URL!);
const force = process.argv.includes("--force");

async function regenerate() {
  // Check for reveals unless --force
  if (!force) {
    const [{ count }] = await sql`
      SELECT count(*)::int AS count FROM participants WHERE revealed_at IS NOT NULL
    `;
    if (count > 0) {
      console.error(
        `${count} participant(s) have already revealed. Use --force to override.`
      );
      process.exit(1);
    }
  }

  const participants = await sql`SELECT id FROM participants ORDER BY id`;
  if (participants.length < 3) {
    console.error(`Need at least 3 participants, got ${participants.length}.`);
    process.exit(1);
  }

  const ids = participants.map((r) => r.id as number);
  const pairs = generateAssignments(ids);

  // Use neon's transaction support
  await sql.transaction((txn) => {
    const queries = [txn`DELETE FROM assignments`];
    for (const [giverId, recipientId] of pairs) {
      queries.push(
        txn`INSERT INTO assignments (giver_id, recipient_id) VALUES (${giverId}, ${recipientId})`
      );
    }
    return queries;
  });

  // Print only checks — never print pairings
  const [{ count: pairCount }] = await sql`
    SELECT count(*)::int AS count FROM assignments
  `;
  const [{ ok: noSelf }] = await sql`
    SELECT NOT EXISTS (SELECT 1 FROM assignments WHERE giver_id = recipient_id) AS ok
  `;

  console.log(
    `Assignments generated. ${pairCount} pairs | no self-assignments: ${noSelf}`
  );
}

regenerate().catch((err) => {
  console.error("Regenerate failed:", err);
  process.exit(1);
});
