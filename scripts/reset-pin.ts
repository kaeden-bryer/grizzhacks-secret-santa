import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function resetPin() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: npm run reset-pin -- <slug>");
    process.exit(1);
  }

  const lowerSlug = slug.toLowerCase();
  const rows = await sql`
    UPDATE participants
    SET pin_hash = NULL, failed_attempts = 0, locked_until = NULL
    WHERE slug = ${lowerSlug}
    RETURNING id
  `;

  if (rows.length === 0) {
    console.error(`No participant found with slug "${slug}".`);
    process.exit(1);
  }

  console.log(`PIN reset for "${slug}".`);
}

resetPin().catch((err) => {
  console.error("Reset-pin failed:", err);
  process.exit(1);
});
