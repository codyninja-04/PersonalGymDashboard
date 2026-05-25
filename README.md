# FORGE — Personal Fitness Dashboard

> Cinematic hypertrophy dashboard. Monochrome aesthetic. AI-powered coaching.
>
> *Lift heavy. Eat clean. Earn the mirror.*

A full-stack, AI-powered fitness dashboard built for serious physique athletes. FORGE covers every pillar of training: workout tracking, nutrition management, body composition analysis, progress photography, and an AI coach — all in one dark-mode interface.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
  - [Authentication](#authentication)
  - [Main Dashboard](#main-dashboard)
  - [Workout](#workout)
  - [Fuel (Nutrition)](#fuel-nutrition)
  - [Body Tracking](#body-tracking)
  - [Analytics](#analytics)
  - [Settings](#settings)
  - [AI Coach](#ai-coach)
- [Training Phases](#training-phases)
- [Workout Split](#workout-split)
- [Calculations Engine](#calculations-engine)
- [Database Schema](#database-schema)
- [State Management](#state-management)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 (CSS-first `@theme`) |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Charts | Recharts 3 |
| State | Zustand 5 (with localStorage persistence) |
| Backend/Auth | Supabase (PostgreSQL + Auth + RLS + Storage) |
| AI | Gemini 2.0 Flash / Groq (Llama 3.3 70B) / OpenRouter (free-tier chain) |
| Hosting | Vercel |

---

## Features

### Authentication

- Email + password sign-up and login via Supabase Auth
- Email confirmation flow with redirect handling
- Server-side session middleware (`lib/supabase/middleware.ts`) that protects all `/dashboard/*` routes and refreshes tokens on every request
- Sign-out route handler at `/auth/signout`
- OAuth callback handler at `/auth/callback`
- Graceful **demo mode** — when Supabase env vars are absent, the app runs entirely on synthetic seed data with no auth gate

---

### Main Dashboard

Route: `/dashboard`

The command centre. Server components load data in parallel (`Promise.all`), then hydrate client-side Zustand stores via `SyncProvider`.

| Section | Description |
|---|---|
| **Hero Banner** | Personalised greeting with current phase label, goal, and the classical contrapposto sculpture silhouette as an SVG watermark |
| **Philosophy Ticker** | Scrolling marquee of stoic + bodybuilding principles from `lib/data/quotes.ts` |
| **Phase Checklist** | Daily phase-specific tasks tailored to the active training phase |
| **Deload Banner** | Auto-detects when a deload week is due based on `last_deload_at` and each phase's `deloadEveryWeeks` frequency |
| **Intent Setter** | Set a one-sentence focus/commitment for the day |
| **Daily Quote** | Rotating curated quotes seeded by date + streak |
| **Phase Card** | Current phase summary — label, stance (deficit/neutral/surplus), tagline, philosophy, priority, and watch-out |
| **Stall Diagnosis Card** | AI-powered plateau detection; fires when progress has stalled and prescribes one specific change |
| **KPI Grid** | Four key metric cards: Weight, Consistency, Macro Ring, Strength Index |
| **Weight + Lean Mass Chart** | 30-day dual-area trend chart (Recharts) |
| **Volume Load Bar Chart** | Weekly training tonnage (kg) across sessions |
| **Workout Split Module** | Today's exercises with sets, reps, rest timers, and live logging |
| **Spotify Player** | Embedded Spotify widget with 4 curated presets (Laid Mode, Beast Mode, Sculpt Mix, Cardio Lock-in) + paste-your-own URL |
| **Lifestyle Quick Log** | Log sleep (hours), steps, energy rating (1–5), and soreness rating (1–5) for today |
| **Quick Actions** | Shortcut buttons to navigate sub-pages |
| **AI Coach Terminal** | Terminal-style chat interface to the AI coach |
| **PR Feed** | Live feed of personal records from recent sessions |
| **Command Palette** | Cmd+K fuzzy search across the full exercise library, showing which split day each exercise belongs to |
| **Notification Bell** | In-app notifications; clears on open, seen-IDs persisted to localStorage |

---

### Workout

Route: `/dashboard/workout`

- **WorkoutSplitModule** — loads today's split from `ANAND_SPLITS`, renders every exercise as an `ExerciseRow`
  - Each `ExerciseRow` logs sets × reps × weight in real-time
  - **Progressive Overload Badge** — automatically highlights exercises where the last session hit the top of the rep range and suggests a +2.5 kg weight increase
  - **Exercise Swap Button** — AI suggests 3 alternative exercises targeting the same primary muscle group; response parsed from structured JSON
  - **Auto Scale Button** — AI adjusts the entire session's volume and intensity based on a stated fatigue reason
- **Weekly Plan Card** — displays all 7 days of the split with name, exercise count, and rest-day markers
- **Recent Lifts Card** — last 10 logged sessions with relative date, split name, and total tonnage displayed in tonnes

---

### Fuel (Nutrition)

Route: `/dashboard/fuel`

- **Phase-aware header** — shows current phase (e.g., "Moderate Cut"), gym vs. rest day status, and today's calorie target
- **Macro Cycling Chart** — 7-day bar chart of actual vs. target macros, colour-coded by gym/rest day (Recharts)
- **Meal Suggester** — AI suggests one complete meal fitting remaining macros; optional cuisine/preference input
- **Macro Ring Card** — animated donut chart showing protein / carbs / fats consumed vs. targets
- **Meal Logger** — 5-field inline form (name, category, kcal, protein g, carbs g, fats g)
  - Categories: breakfast, lunch, dinner, snack, pre-workout, post-workout
  - Logged meals listed below with per-entry delete
- **Macro Math Card** — real-time progress bars for calories, protein, carbs, and fats vs. phase targets
- **Supplements Card**
  - Creatine 5g daily toggle with "streak protected" indicator
  - Water intake tracker — +0.25L / +0.5L / +1L quick-add buttons, progress bar toward 3L daily target
- Macro targets are fully computed per-day: gym days get higher carbs than rest days (carb cycling). All values derived from `bodyweight × phase multipliers` via `lib/calculations/macros.ts`

---

### Body Tracking

Route: `/dashboard/body`

- **Body Hero** — headline card showing total measurement entries logged and a motivational tagline
- **Measurements Form** — log 6 circumference measurements per date:
  - Waist (cm), Chest (cm), Arm (cm), Neck (cm), Thigh (cm), Hip (cm) + optional notes
  - Supabase `upsert` on `(user_id, date)` — one entry per day, fully editable
  - Delete any historical entry
- **Measurements Chart** — multi-line Recharts chart showing all measurement sites over time (up to 60 records, ordered ascending)
- **Progress Photo Grid** — full photo management
  - Upload photos with pose tag and optional notes
  - Supported poses: front, side, back, double-bi
  - Stored in Supabase Storage bucket `progress-photos` (private)
  - File limit: 8 MB per photo
  - Signed URLs generated server-side with 1-hour expiry for secure private rendering
  - Delete individual photos (storage object + database row cleaned up atomically)

---

### Analytics

Route: `/dashboard/analytics`

- **Big 4 Stats** — four headline numbers: Weight Δ (30d), Lean Mass Δ, BF% Drop, and TDEE — computed live from stored history
- **Weight + Lean Mass Chart** — full-width dual-axis trend chart
- **Volume Load Bar Chart** — weekly training tonnage for volume periodisation review
- **Strength Curve Chart** — 1RM progression over time for the key compound lifts
- **Projected Trajectory Card** — shows current BF%, mid-cycle milestone, and target BF%, alongside estimated weeks remaining at the current deficit rate (0.4 kg/wk)

---

### Settings

Route: `/dashboard/settings`

- **Profile Form** — edit name, age, height (cm), current weight (kg), estimated body fat (0–1), target body fat (0–1), goal (cut/bulk/recomp), and phase label; saves to Supabase `profiles` table; optimistic local Zustand update
- **Caloric Math Card** — live-computed TDEE, cut deficit, projected weekly drop, and weeks to target BF
- **Phase Selector** — switch between all 6 training phases; updates profile and re-derives all macro targets
- **Mission Parameters** — three long-horizon objectives displayed as milestone cards:
  1. Reach target BF (cut phase complete, visible abs)
  2. Restore legs (reintroduce squat/RDL post-injury clearance)
  3. Lean bulk +4 kg (slow surplus, hold BF under 16%)

---

### AI Coach

The AI layer uses a **free-tier fallback chain** — no single paid API is required.

**Provider chain (tried in order):**
1. **Gemini 2.0 Flash** (Google AI Studio)
2. **Groq** — `llama-3.3-70b-versatile`
3. **OpenRouter** — `meta-llama/llama-3.3-70b-instruct:free`

Each provider supports up to 5 numbered API keys (`GEMINI_API_KEY_1` … `GEMINI_API_KEY_5`) plus an un-numbered fallback key, enabling key rotation across free-tier rate limits. The chain tries keys in sequence and returns the first successful response. If all providers fail, the UI degrades gracefully with an error state.

**AI actions (all server actions in `app/actions/ai.ts`):**

| Action | Prompt | Output |
|---|---|---|
| `dailyBriefingAction` | Full user context | Personalised day briefing (≤260 tokens) |
| `askCoachAction` | Full context + user question | Coach answer (≤500 tokens) |
| `autoScaleAction` | Full context + fatigue reason | Workout volume/intensity adjustments |
| `mealSuggestAction` | Full context + optional preference | Single meal suggestion fitting remaining macros |
| `exerciseSwapAction` | Exercise name + muscle + reason | 3 alternatives as structured JSON |
| `stallDiagnosisAction` | Full context | Plateau diagnosis + one prescribed change |

Context passed to every AI call (built in `lib/ai/buildContext.ts`) includes: current phase and stance, today's macro targets vs. actuals, weight and lean mass trend, recent session history, lifestyle metrics (sleep/steps/energy/soreness), and today's stated intent.

---

## Training Phases

Six phases are defined in `lib/data/phases.ts`, each with fully computed macro math and training prescriptions:

| Key | Label | Stance | Weekly Δ | Typical Duration |
|---|---|---|---|---|
| `cut-aggressive` | Aggressive Cut | Deficit | −0.7 kg/wk | 8 weeks |
| `cut-moderate` | Moderate Cut | Deficit | −0.4 kg/wk | 12 weeks |
| `recomp` | Body Recomp | Neutral | 0 kg/wk | 24 weeks |
| `lean-bulk` | Lean Bulk | Surplus | +0.25 kg/wk | 16 weeks |
| `bulk-aggressive` | Aggressive Bulk | Surplus | +0.5 kg/wk | 12 weeks |
| `maintenance` | Maintenance | Neutral | 0 kg/wk | Ongoing |

Each phase defines:
- `caloricMultiplier` — target calories as a fraction of TDEE
- `proteinPerKg`, `carbPerKgGym`, `carbPerKgRest`, `fatPerKg` — macros per kg bodyweight (gym/rest day split for carb cycling)
- `rpeBand` — recommended RPE on top sets
- `repBias` — strength / hypertrophy / balanced
- `cardioPerWeek` — suggested LISS/HIIT sessions
- `deloadEveryWeeks` — auto-deload frequency (0 = never)
- `philosophy`, `priority`, `watchOut` — shown in UI coach cards

---

## Workout Split

A fixed 4-day Push / Pull / Shoulders / Full-Body split (`lib/data/workoutSplits.ts`):

| Day | Session | Type | Exercises |
|---|---|---|---|
| Monday | Chest + Triceps | Push | 7 (Incline Press, Pec Deck, Cable Crossover, OH Cable Ext, Skull Crusher, Pushdown, Hanging Leg Raise) |
| Tuesday | Rest / Recovery | — | — |
| Wednesday | Back + Biceps | Pull | 7 (Weighted Pull-up, Seated Cable Row, Lat Pulldown, DB Curl, Preacher Curl, Incline DB Curl, Hanging Leg Raise) |
| Thursday | Boxing / Cardio | — | — |
| Friday | Shoulders + Forearms | Shoulders | 8 (Seated OHP, Lateral Raise DB, Lateral Raise Cable, Reverse Pec Deck, Face Pulls, Wrist Curl, Reverse Wrist Curl, Hanging Leg Raise) |
| Saturday | Full Body (No Legs) | Full Body | 6 (DB Flat Press, Pull-ups BW, Lateral Raise, DB Curl, Cable Pushdown, Hanging Leg Raise) |
| Sunday | Rest Day | — | — |

Each exercise references `EXERCISE_LIBRARY` for primary and secondary muscle data, used in strength index calculations and AI exercise swap suggestions.

---

## Calculations Engine

All domain logic lives in `lib/calculations/`:

| File | Function | Formula / Logic |
|---|---|---|
| `tdee.ts` | `calculateTDEE` | Mifflin-St Jeor BMR × activity multiplier |
| `macros.ts` | `computeMacros` | Phase caloric multiplier × TDEE → distribute across P/C/F per kg bodyweight; carb cycling for gym vs. rest days |
| `oneRepMax.ts` | `estimateOneRepMax` | Epley: `weight × (1 + reps / 30)` |
| `leanMassEstimator.ts` | `estimateLeanMass` | `bodyweight × (1 − estimatedBF)` |
| `progressiveOverload.ts` | `checkProgressiveOverload` | Compares last session reps to rep range max → suggests +2.5 kg if all sets hit ceiling |
| `strengthIndex.ts` | `computeStrengthIndex` | Sums estimated 1RMs for key lifts (bench/press/pull), normalises to bodyweight, maps to percentile label |

---

## Database Schema

Backed by Supabase (PostgreSQL). All tables are scoped to `auth.uid()` via row-level security.

| Table | Key Columns |
|---|---|
| `profiles` | `id`, `name`, `age`, `height_cm`, `current_weight_kg`, `estimated_bf`, `target_bf`, `goal`, `phase`, `last_deload_at`, `phase_started_at`, `onboarded`, `gender` |
| `body_measurements` | `id`, `user_id`, `date`, `waist_cm`, `chest_cm`, `arm_cm`, `neck_cm`, `thigh_cm`, `hip_cm`, `notes` — unique on `(user_id, date)` |
| `daily_fuel` | `id`, `user_id`, `date`, `sleep_hours`, `steps`, `energy_rating`, `soreness_rating`, `notes` — unique on `(user_id, date)` |
| `progress_photos` | `id`, `user_id`, `date`, `pose`, `storage_path`, `notes` |
| `weight_entries` | `id`, `user_id`, `date`, `weight_kg` — for weight trend charts |
| `bf_entries` | `id`, `user_id`, `date`, `bf` — body fat % history |
| `personal_records` | `id`, `user_id`, `exercise`, `weight`, `reps`, `logged_at` |
| `workout_sessions` | `id`, `user_id`, `split_name`, `date`, `total_volume_kg`, `set_logs` (JSONB) |

Progress photos are stored in a private Supabase Storage bucket named `progress-photos`. Signed URLs with 1-hour expiry are generated server-side on every `listPhotosAction` call.

---

## State Management

Three Zustand stores in `lib/store/`:

| Store | Responsibility |
|---|---|
| `useAppStore` | User profile, weight history, BF history, personal records, session log, week plan — hydrated from Supabase on mount |
| `useNutritionStore` | Today's meal log, macro targets (derived from active phase + bodyweight), creatine toggle, water intake — persisted to localStorage |
| `useWorkoutStore` | Active workout state (current sets, reps, weights per exercise) — persisted to localStorage |

**`SyncProvider`** (`components/providers/SyncProvider.tsx`) runs on mount, calls `fetchSyncBundle` (a single server action that batches all Supabase reads), and calls `useAppStore.hydrate()` to populate all client state in one pass.

---

## Project Structure

```
anand-fitness-dashboard/
├── app/
│   ├── actions/              # Next.js Server Actions (all DB writes + AI calls)
│   │   ├── ai.ts             # All 6 AI actions (briefing, coach, autoscale, meal, swap, stall)
│   │   ├── fetch.ts          # fetchSyncBundle — single batched data load
│   │   ├── fuel.ts           # Nutrition logging
│   │   ├── lifestyle.ts      # Sleep/steps/energy/soreness + markDeload
│   │   ├── measurements.ts   # Body measurements CRUD
│   │   ├── metrics.ts        # Weight + BF entry logging
│   │   ├── photos.ts         # Progress photo upload/list/delete
│   │   ├── profile.ts        # Profile save
│   │   └── workout.ts        # Session + PR logging
│   ├── auth/
│   │   ├── actions.ts        # Login / signup / signout server actions
│   │   ├── callback/         # OAuth callback route
│   │   └── signout/          # Sign-out route handler
│   ├── dashboard/
│   │   ├── page.tsx          # Main dashboard (server component)
│   │   ├── layout.tsx        # Sidebar + mobile nav shell
│   │   ├── analytics/page.tsx
│   │   ├── body/page.tsx
│   │   ├── fuel/page.tsx
│   │   ├── settings/page.tsx
│   │   └── workout/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── globals.css           # Tailwind v4 @theme design tokens
│   └── layout.tsx            # Root layout + SyncProvider
│
├── components/
│   ├── analytics/            # WeightLeanMassChart, VolumeLoadBarChart, StrengthCurveChart
│   ├── auth/                 # AuthForm (shared login/signup)
│   ├── body/                 # BodyHero, MeasurementsForm, MeasurementsChart, PhotoGrid
│   ├── coach/                # AICoachTerminal
│   ├── dashboard/            # HeroBanner, PhilosophyTicker, DailyQuote, IntentSetter,
│   │                         # SpotifyPlayer, SculptureSilhouette, StallDiagnosisCard,
│   │                         # PhaseCard, PhaseChecklist, DeloadBanner,
│   │                         # LifestyleQuickLog, QuickActions, PRFeed
│   ├── fuel/                 # MealSuggester, MacroCyclingChart
│   ├── kpi/                  # KPIGrid, WeightCard, ConsistencyCard, MacroRingCard, StrengthIndexCard
│   ├── layout/               # Sidebar, MobileNav, TopBar, CommandPalette, NotificationDropdown
│   ├── providers/            # SyncProvider
│   ├── settings/             # PhaseSelector
│   ├── ui/                   # Card, Badge, Sparkline, HydrationGate (primitives)
│   └── workout/              # WorkoutSplitModule, ExerciseRow, ProgressiveOverloadBadge,
│                             # AutoScaleButton, ExerciseSwapButton
│
├── lib/
│   ├── ai/
│   │   ├── buildContext.ts   # Assembles full user context string for AI prompts
│   │   ├── prompts.ts        # System prompts for each AI action
│   │   └── providers.ts      # Gemini / Groq / OpenRouter fallback chain
│   ├── calculations/
│   │   ├── leanMassEstimator.ts
│   │   ├── macros.ts
│   │   ├── oneRepMax.ts
│   │   ├── progressiveOverload.ts
│   │   ├── strengthIndex.ts
│   │   └── tdee.ts
│   ├── data/
│   │   ├── exerciseLibrary.ts  # Full exercise catalogue with muscle metadata
│   │   ├── phases.ts           # 6 training phases with full config
│   │   ├── quotes.ts           # Curated quote library
│   │   ├── seedData.ts         # Demo-mode synthetic data
│   │   └── workoutSplits.ts    # ANAND_SPLITS weekly programme
│   ├── store/
│   │   ├── useAppStore.ts
│   │   ├── useNutritionStore.ts
│   │   └── useWorkoutStore.ts
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── middleware.ts        # Session refresh middleware
│   │   └── server.ts           # Server-side Supabase client (cookies)
│   └── utils/
│       ├── coachMessages.ts    # Deterministic coach signal logic
│       └── formatting.ts       # Date, number, relative-time formatters
│
├── types/
│   ├── db.ts        # Supabase table row types
│   ├── user.ts      # UserProfile interface
│   └── workout.ts   # WorkoutDay, SetLog, PersonalRecord, etc.
│
├── hooks/
│   ├── useBodyMetrics.ts     # Derived TDEE, weeks-left, lean mass delta
│   ├── useCoachInsights.ts   # Deterministic signal generation
│   └── useWorkoutToday.ts    # Today's split + session state
│
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Environment Variables

Create a `.env.local` in the project root:

```env
# Supabase — required for auth and persistence
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI providers — add at least one; the chain falls back in order.
# Each provider supports up to 5 numbered keys for rotation (_1 … _5)
# or a single un-numbered key.

GEMINI_API_KEY=your-gemini-key
# GEMINI_API_KEY_1=key-a
# GEMINI_API_KEY_2=key-b

GROQ_API_KEY=your-groq-key
# GROQ_API_KEY_1=key-a

OPENROUTER_API_KEY=your-openrouter-key
# OPENROUTER_API_KEY_1=key-a
```

If Supabase vars are absent the app runs in **demo mode** — all data lives in Zustand only, nothing is persisted.  
If no AI keys are set, AI features are hidden and replaced with a "not configured" state; the rest of the dashboard works normally.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Sign up, complete your profile on the Settings page (name, weight, body fat, target BF, phase), and the dashboard automatically computes your TDEE, macro targets, carb-cycling schedule, deload timer, and cut horizon.

---

*Built for symmetry over size, tempo over ego, discipline over motivation.*
