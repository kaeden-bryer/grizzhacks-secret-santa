# GrizzHacks Secret Santa

A small Secret Santa site for GrizzHacks at `secret-santa.grizzhacks.org`. Each participant goes to `/{their-name}`, sets a 6-digit PIN on first visit, and then sees an envelope animation that opens to show the person they're buying for.

## The most important rule: never reveal assignments

The maintainer (Kaeden) is a participant, so **he must never see who is assigned to whom.** That includes output from you.

- **Never** run a query, script, or log statement that prints giver→recipient pairs, by name or by ID. That covers `SELECT * FROM assignments`, joins with `participants`, `console.log` of the cycle, and debugging output in tests.
- If you need to check assignments, print **only checks** (counts, booleans), e.g. `✓ 14 pairs | no self-assignments: true | single cycle: true`.
- Tests that cover the cycle algorithm should use made-up names (`["a","b","c"]`), never the real participant list.
- If a task seems to require looking at real assignments, stop and ask instead.

## Stack

- **Next.js** (App Router, TypeScript) deployed on **Vercel**
- **Neon** Postgres, connected through the Vercel Marketplace integration. Connection string is in `DATABASE_URL`.
- `@neondatabase/serverless`: Postgres driver that works over HTTP, suited to serverless functions
- `bcryptjs`: PIN hashing (pure JS, so no native-build problems on Vercel)
- `jose`: signs the session cookie (JWT) after a correct PIN
- `motion` (Framer Motion, `import { motion, animate } from "motion/react"`): envelope animation
- `tsx`: runs the TypeScript admin scripts locally

## Data model (`db/schema.sql`)

```sql
participants (id, name, slug UNIQUE, pin_hash NULL,
              failed_attempts, locked_until, revealed_at)
assignments  (giver_id PK → participants.id,
              recipient_id UNIQUE → participants.id,
              CHECK giver_id <> recipient_id)
```

- PINs and assignments are in **separate tables** on purpose. Regenerating assignments must never touch `participants.pin_hash`.
- `assignments` stores **IDs only**, never names, so accidentally opening the table viewer shows nothing useful.
- The `UNIQUE` on `recipient_id`, together with `giver_id` as the primary key, means the database itself guarantees each person gives once and receives once.

## Key decisions

### URLs / slugs
- Slug = lowercase name, e.g. `/kaeden`. No two participants share a name.
- Every name must match `/^[a-z-]+$/` after lowercasing. The seed script fails loudly if one doesn't.
- `/Kaeden` → redirect to `/kaeden`. An unknown slug, or any other unmatched URL → redirect to `/` (`redirect("/")` in `app/[slug]/page.tsx`, plus `app/not-found.tsx` for multi-segment paths).

### Assignment algorithm (`lib/assign.ts`)
- Fisher–Yates shuffle, then a single cycle: `shuffled[i]` gives to `shuffled[(i + 1) % n]`.
- This guarantees no self-assignments and no two-person swaps, in one pass with no retries.
- Never use `array.sort(() => Math.random() - 0.5)`. It's biased.
- Use `crypto.randomInt` for the shuffle, not `Math.random`.

### Regeneration (`scripts/regenerate.ts`)
- Runs in one transaction: `DELETE FROM assignments`, shuffle, insert the cycle.
- **Refuses to run if any `participants.revealed_at IS NOT NULL`**, unless `--force` is passed. Reshuffling after people have seen their match is bad.
- Prints only the check line (see the rule above).

### PIN flow (trust on first use)
- First visit with `pin_hash IS NULL`: "Set your PIN" screen.
- Claiming must be atomic:
  `UPDATE participants SET pin_hash = $1 WHERE slug = $2 AND pin_hash IS NULL RETURNING id`.
  If no row comes back, someone already claimed the name.
- If a PIN is already set, show the "Enter your PIN" screen with the message:
  *"If you didn't set a PIN for this name, message Kaeden."*
- PINs are exactly 6 digits, hashed with bcrypt (cost 10). Never log or store plaintext PINs.
- Rate limit: 5 wrong tries → `locked_until = now() + 15 min`. Reset `failed_attempts` on success. This uses the DB columns, with no separate rate-limit service.
- On success, set an `httpOnly`, `secure`, `sameSite=lax` cookie containing a JWT signed with `SESSION_SECRET`, holding `{ participantId }`, valid for 60 days.

### Reveal
- The recipient's name is **only** sent from `POST /api/reveal`, after the PIN or cookie is verified, and only when the user clicks.
- Never put the recipient's name in server-rendered HTML, page `<title>`, OG/meta tags, or anything in the client bundle. Discord/iMessage link previews would show it.
- Set `revealed_at` the first time someone reveals.
- Add `<meta name="robots" content="noindex">` to every page.

### Animation
- Envelope: the flap rotates open (`rotateX`), the letter slides up and toward the viewer, and the card flips (`rotateY(180deg)`) to show the name.
- Use `backface-visibility: hidden` **and** `-webkit-backface-visibility: hidden` (needed for iOS Safari).
- Respect `prefers-reduced-motion` (use `useReducedMotion()` from motion and show the name with a simple fade). Include a "skip" button.
- Long names must fit: shrink the font or wrap.
- Mobile-first. Most people will open the link on a phone.

### Event details
- Budget, exchange date, and similar details live in `lib/config.ts` and appear on the revealed letter.

## Admin scripts

All scripts run locally against `.env.local` (pull it with `vercel env pull .env.local`).

| Command | What it does |
| --- | --- |
| `npm run db:migrate` | Applies `db/schema.sql` (idempotent) |
| `npm run seed` | Adds new names from `participants.txt` (one per line). Existing rows and PINs are kept. |
| `npm run regenerate` | Rebuilds assignments. Prints only the checks. `--force` to override the reveal lock. |
| `npm run reset-pin -- <slug>` | Clears `pin_hash`, `failed_attempts`, and `locked_until` for one person |
| `npm run status` | Count of participants, PINs set, and reveals. **No pairings.** |

`participants.txt` is gitignored.

## Conventions

- TypeScript strict mode. Server-only DB code lives in `lib/db.ts` and imports `"server-only"` so it can never end up in the client bundle.
- Use parameterized SQL only (tagged template from `@neondatabase/serverless`). Never build SQL with string concatenation.
- The maintainer is learning. When making changes, explain the *why* behind non-obvious decisions.
