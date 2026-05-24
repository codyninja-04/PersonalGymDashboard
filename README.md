# FORGE

> Cinematic hypertrophy dashboard. Monochrome David-Laid aesthetic. Multi-device sync.
>
> *Lift heavy. Eat clean. Earn the mirror.*

A personal gym + fitness command center built for serious training. Live weight & body-composition tracking, interactive workout split with progressive overload detection, macro tracking with rest/gym-day automation, a curated David-Laid Spotify embed, daily quote engine, AI coach signals, and a classical sculpture silhouette in the hero.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind v4 (CSS-first `@theme`) |
| State | Zustand (with localStorage persistence on workout state) |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | Lucide React |
| Auth + DB | Supabase (Postgres + Auth + RLS) |
| Hosting | Vercel |

---

## Features

- **Hero with sculpture silhouette** — classical contrapposto figure (Michelangelo-David / David-Laid hybrid) as SVG watermark
- **Intent Setter** — one-word commitment for the day
- **Daily Quote** — rotating David Laid + adjacent quotes seeded by date + streak
- **Philosophy Ticker** — marquee of grounded principles
- **KPI Grid** — weight, weekly consistency, macro ring, strength index
- **Composition charts** — 30-day weight vs lean mass dual-area, volume by muscle group, radial strength curve
- **Workout module** — day picker (preview any day), live set logging, progressive overload badge, auto-PR detection
- **Spotify** — 4 curated presets (Laid Mode, Beast Mode, Sculpt Mix, Cardio Lock-in) + paste-your-own
- **Coach terminal** — typewriter-streamed signals based on weight stalls, macro deltas, PRs, streak
- **Notification bell** — clears on open, persists seen-IDs to localStorage
- **Cmd+K palette** — fuzzy search across full exercise library + which split day each belongs to
- **Auth** — email + password via Supabase, with `proxy.ts` (Next 16 middleware) refreshing the session
- **Per-user data** — every row in every table scoped by `auth.uid()` via row-level security

---

## Quick start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Without Supabase env vars, the app runs in **demo mode** (synthetic data, no auth gate).

To wire the real backend:

1. Create a Supabase project at https://supabase.com
2. Open `supabase/schema.sql`, paste it into the Supabase SQL Editor, run it
3. Copy `Project URL` and `anon key` from Project Settings → API
4. Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
5. Restart `npm run dev`

Full step-by-step in [`SETUP.md`](./SETUP.md).

---

## Project layout

```
app/
  dashboard/         # protected app — today, workout, analytics, fuel, settings
  login/  signup/    # auth pages
  auth/              # callback + signout route handlers
  actions/           # server actions (Supabase writes)
components/
  dashboard/         # hero, intent setter, daily quote, philosophy ticker, spotify, sculpture
  kpi/               # 4 KPI cards
  analytics/         # recharts components
  workout/           # split module, exercise row, overload badge
  coach/             # AI coach terminal
  layout/            # sidebar, topbar, mobile nav, command palette, notifications
  auth/              # shared auth form
  providers/         # SyncProvider hydrates Zustand from Supabase bundle
  ui/                # primitives (Card, Badge, Sparkline, HydrationGate)
hooks/               # useBodyMetrics, useCoachInsights, useWorkoutToday
lib/
  store/             # Zustand stores: app, workout, nutrition
  data/              # seed data, splits, exercise library, quotes
  calculations/      # tdee, 1RM, lean mass, progressive overload, strength index
  supabase/          # browser + server clients, middleware
  utils/             # formatters, coach messages
supabase/
  schema.sql         # tables + RLS + signup trigger
proxy.ts             # Next 16 middleware for session refresh
```

---

## Deploy

See [`SETUP.md`](./SETUP.md). TL;DR: push to GitHub → import on Vercel → set env vars → deploy → update Supabase redirect URLs.

---

*Built for symmetry over size, tempo over ego, discipline over motivation.*
