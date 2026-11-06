import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function status() {
  const [{ total }] = await sql`SELECT count(*)::int AS total FROM participants`;
  const [{ pins }] = await sql`SELECT count(*)::int AS pins FROM participants WHERE pin_hash IS NOT NULL`;
  const [{ reveals }] = await sql`SELECT count(*)::int AS reveals FROM participants WHERE revealed_at IS NOT NULL`;
  const [{ assignments }] = await sql`SELECT count(*)::int AS assignments FROM assignments`;

  console.log(`Participants: ${total}`);
  console.log(`PINs set:     ${pins}`);
  console.log(`Revealed:     ${reveals}`);
  console.log(`Assignments:  ${assignments}`);
}

status().catch((err) => {
  console.error("Status failed:", err);
  process.exit(1);
});
