CREATE TABLE IF NOT EXISTS participants (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  pin_hash      TEXT,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until  TIMESTAMPTZ,
  revealed_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS assignments (
  giver_id      INTEGER PRIMARY KEY REFERENCES participants(id),
  recipient_id  INTEGER NOT NULL UNIQUE REFERENCES participants(id),
  CHECK (giver_id <> recipient_id)
);
