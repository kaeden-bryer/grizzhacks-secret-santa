import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  const schema = readFileSync("db/schema.sql", "utf-8");
  // Neon HTTP driver can't run multiple statements in one call,
  // so split on semicolons and run each separately in a transaction.
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  await sql.transaction((txn) => statements.map((stmt) => txn.query(stmt)));
  console.log("Migration applied successfully.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
