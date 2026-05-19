# Pulse Supabase Setup

## Order of operations

1. **`schema.sql`** — tables, RLS policies, triggers, RPC functions. Run first.
2. **`seed.sql`** — seed Pulses + comments (the Oshkosh + Wisconsin demo data). Run after the schema. Optional but recommended so live mode isn't empty.

Both files are idempotent — safe to re-run.

## Applying the schema

`schema.sql` is safe to run on a fresh project or on top of an existing one. Every `CREATE TABLE` uses `IF NOT EXISTS`, every `ALTER TABLE` checks for existing columns/constraints, and every policy/trigger is dropped-and-recreated so changes pick up cleanly.

**To apply:**

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the contents of `schema.sql`.
3. Click **Run**.

You should see a stream of `Success. No rows returned` results.

## Seeding demo data

After the schema runs cleanly, paste `seed.sql` into a new SQL Editor query and run it.

`seed.sql` is auto-generated from `src/constants.js` — re-generate any time the seed data in the app changes:

```bash
npm run seed:sql
```

It inserts 58 posts (38 Oshkosh local + 20 Wisconsin state) plus their comments using `seed_key` markers, so re-running the file does nothing on rows that already exist.

## What the schema gives you

- `profiles` — extends `auth.users`, auto-populated on signup via trigger
- `posts` — with new `type` (`statement` | `question`) and `scope` (`local` | `state`) columns
- `votes` — post-level voting, counter-style triggers preserve seed counts
- `comments` — used for both Statement-Pulse comments and Question-Pulse answers
- `comment_votes` — answer voting for Question Pulses
- `watched` — one row per `(user, post)` carrying the snapshot for delta display
- Full Row-Level Security so users can only see/modify their own private state (votes, comment votes, watched)

## Enabling auth providers

In your Supabase dashboard:

### Email magic link
- **Authentication → Providers → Email** → enable
- **Email Templates → Magic Link** → optionally customize the email copy

### Google OAuth
- **Authentication → Providers → Google** → enable
- You'll need a Google Cloud project with OAuth credentials. Supabase docs walk you through it: https://supabase.com/docs/guides/auth/social-login/auth-google
- Add `https://<your-project>.supabase.co/auth/v1/callback` to the authorized redirect URIs in Google Cloud Console

## Phase 1 verification stance

The `handle_new_user` trigger sets `is_verified = true` for every new signup. This is intentional for Phase 1 — it lets us move fast without building a verification flow yet.

**Before App Store submission**, replace this with a real verification gate (phone + ZIP code → reverse-geocoded city). When that happens, change the trigger default to `false` and add a separate verification endpoint that flips the flag.
