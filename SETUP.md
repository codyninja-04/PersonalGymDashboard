# ANAND.OS — Setup

Full-stack dashboard: **Next.js 16 (Vercel) + Supabase (Postgres + Auth)**.

You need to do **3 things** before the app works end-to-end:
1. Create a free Supabase project.
2. Paste the SQL schema into Supabase's SQL editor.
3. Add the two env vars to `.env.local` (locally) and Vercel (in prod).

---

## 1. Create Supabase project

1. Go to https://supabase.com → sign up (free).
2. Click **New project** → name it (e.g. `anand-os`) → pick a region close to you → set a DB password (save it somewhere) → **Create new project**. Takes ~2 min.
3. Once provisioned, go to **Project Settings → API**. Copy:
   - **Project URL** (looks like `https://abcdefg.supabase.co`)
   - **anon / public key** (long JWT-looking string)

## 2. Run the schema

1. In Supabase dashboard, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `supabase/schema.sql` in this repo, copy everything, paste into the editor.
4. Hit **Run**. You should see "Success. No rows returned."

This creates:
- `profiles`, `weight_logs`, `bf_logs`, `personal_records`, `workout_sessions`, `daily_fuel` tables
- Row-level security policies (every row scoped to its owner via `auth.uid()`)
- A trigger that auto-creates a profile row when someone signs up

## 3. Wire env vars

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill it in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...long-string...
```

Then run:

```bash
npm run dev
```

Open http://localhost:3000 → you'll be redirected to `/login` → click **enlist** → create an account → land in the dashboard.

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. Go to https://vercel.com → **Add New Project** → import the repo.
3. Vercel auto-detects Next.js. Before deploying, in **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://YOUR-PROJECT.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. **Deploy**. Takes ~90s. You get a `*.vercel.app` URL.

### One last Supabase tweak after Vercel deploy

Once you have the Vercel URL, go back to Supabase:
- **Authentication → URL Configuration**
- Set **Site URL** to your Vercel URL (e.g. `https://anand-os.vercel.app`)
- Add it to **Redirect URLs** too (e.g. `https://anand-os.vercel.app/**`)

This makes email confirmations / password resets point to your deployed app.

---

## How auth works

- Email + password, no email confirmation by default (Supabase config — you can turn confirmation on in **Authentication → Providers → Email**).
- A `proxy.ts` middleware refreshes the session on every request and redirects:
  - `/dashboard/*` without a session → `/login`
  - `/login` or `/signup` with a session → `/dashboard`
- Sign-out is a POST to `/auth/signout`. The sidebar user menu wires it for you.

## How data sync works

- On every dashboard load, the layout (server component) fetches the user's full data bundle via `fetchSyncBundle()` and passes it to `<SyncProvider>` which hydrates the Zustand stores client-side.
- Every mutation (log weight, log meal, finish workout, set PR) is **optimistic**: the store updates instantly, then fires a server action that writes to Supabase.
- The fuel store batches writes — every change to today's macros/water/creatine saves the whole `daily_fuel` row.
- The workout store keeps live session state in `localStorage` so a refresh mid-workout doesn't lose your set log. When you hit **finish**, the full session is `insert`-ed to `workout_sessions`.

## Demo data

Until you log your first weight or session, the dashboard shows synthetic 30-day weight/BF history so cards aren't blank. The moment you log anything real, synthetic data is dropped.

## Where to edit profile

Settings page → fill in name / age / height / weight / BF / goal → hit **save**. This writes to `profiles` and all metrics (TDEE, weeks-to-target, lean mass) recompute from your real numbers.

## Troubleshooting

- **"Not authenticated" errors**: env vars wrong. Double-check `.env.local` matches the values from Supabase **Project Settings → API**.
- **Redirect loop on login**: clear cookies for localhost and retry. Usually means a stale session cookie from a different project.
- **Schema errors when running SQL**: make sure you ran the *full* `supabase/schema.sql`, not just the table creates — the RLS policies and trigger are critical.
