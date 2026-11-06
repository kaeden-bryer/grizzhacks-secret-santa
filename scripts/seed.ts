import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
const SLUG_RE = /^[a-z-]+$/;

async function seed() {
  const raw = readFileSync("participants.txt", "utf-8");
  const names = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (names.length === 0) {
    console.error("participants.txt is empty.");
    process.exit(1);
  }

  for (const name of names) {
    const slug = name.toLowerCase();
    if (!SLUG_RE.test(slug)) {
      console.error(`Invalid name "${name}" — slug "${slug}" must match /^[a-z-]+$/`);
      process.exit(1);
    }
  }

  let added = 0;
  for (const name of names) {
    const slug = name.toLowerCase();
    const rows = await sql`
      INSERT INTO participants (name, slug)
      VALUES (${name}, ${slug})
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `;
    if (rows.length > 0) added++;
  }

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM participants`;
  console.log(`Seeded. ${added} new, ${count} total participants.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
