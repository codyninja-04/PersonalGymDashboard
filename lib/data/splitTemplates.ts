import type { WorkoutDay } from "@/types/workout";
import type { DayKey } from "@/lib/data/workoutSplits";
import { ANAND_SPLITS, DAY_KEYS } from "@/lib/data/workoutSplits";
import { EXERCISE_LIBRARY } from "@/lib/data/exerciseLibrary";

type RepRange = [number, number];

function ex(id: string, sets: number, repRange: RepRange, restSec: number) {
  const meta = EXERCISE_LIBRARY[id];
  if (!meta) throw new Error(`Unknown exercise ${id}`);
  return {
    id,
    name: meta.name,
    sets,
    repRange,
    restSec,
    primary: meta.primary,
    secondary: meta.secondary,
  };
}

function rest(key: DayKey, name = "Rest / Recovery"): WorkoutDay {
  return { key, name, type: "Rest", exercises: [], isRest: true };
}

/** Build a full week from a partial map, filling the gaps with rest days. */
function week(partial: Partial<Record<DayKey, WorkoutDay>>): Record<DayKey, WorkoutDay> {
  const out = {} as Record<DayKey, WorkoutDay>;
  for (const k of DAY_KEYS) out[k] = partial[k] ?? rest(k);
  return out;
}

export interface SplitTemplate {
  id: string;
  name: string;
  tagline: string;
  daysPerWeek: number;
  bestFor: string;
  days: Record<DayKey, WorkoutDay>;
}

// ── Push / Pull / Legs (6 day) ────────────────────────────────────────────
const PUSH = (key: DayKey): WorkoutDay => ({
  key,
  name: "Push",
  type: "Push",
  exercises: [
    ex("flat-barbell-bench", 4, [6, 10], 150),
    ex("seated-ohp", 3, [8, 12], 120),
    ex("incline-press", 3, [8, 12], 120),
    ex("lateral-raise-db", 3, [12, 20], 60),
    ex("cable-pushdown", 3, [10, 15], 60),
    ex("overhead-cable-ext", 3, [10, 15], 60),
  ],
});
const PULL = (key: DayKey): WorkoutDay => ({
  key,
  name: "Pull",
  type: "Pull",
  exercises: [
    ex("weighted-pullup", 4, [6, 10], 150),
    ex("barbell-row", 3, [8, 12], 120),
    ex("lat-pulldown", 3, [10, 12], 90),
    ex("face-pulls", 3, [15, 20], 45),
    ex("barbell-curl", 3, [8, 12], 60),
    ex("hammer-curl", 3, [10, 15], 60),
  ],
});
const LEGS = (key: DayKey): WorkoutDay => ({
  key,
  name: "Legs",
  type: "Full Body",
  exercises: [
    ex("back-squat", 4, [5, 8], 180),
    ex("romanian-deadlift", 3, [8, 12], 150),
    ex("leg-press", 3, [10, 15], 120),
    ex("leg-curl", 3, [10, 15], 75),
    ex("standing-calf-raise", 4, [10, 15], 60),
    ex("hanging-leg-raise", 3, [10, 20], 60),
  ],
});

// ── Upper / Lower (4 day) ─────────────────────────────────────────────────
const UPPER = (key: DayKey): WorkoutDay => ({
  key,
  name: "Upper Body",
  type: "Full Body",
  exercises: [
    ex("flat-barbell-bench", 4, [6, 10], 150),
    ex("barbell-row", 4, [6, 10], 150),
    ex("seated-ohp", 3, [8, 12], 120),
    ex("lat-pulldown", 3, [10, 12], 90),
    ex("barbell-curl", 3, [10, 12], 60),
    ex("cable-pushdown", 3, [10, 15], 60),
  ],
});
const LOWER = (key: DayKey): WorkoutDay => ({
  key,
  name: "Lower Body",
  type: "Full Body",
  exercises: [
    ex("back-squat", 4, [5, 8], 180),
    ex("romanian-deadlift", 3, [8, 12], 150),
    ex("leg-press", 3, [10, 15], 120),
    ex("leg-extension", 3, [12, 15], 60),
    ex("standing-calf-raise", 4, [10, 15], 60),
    ex("cable-crunch", 3, [12, 20], 60),
  ],
});

// ── Full Body (3 day) ─────────────────────────────────────────────────────
const FULL = (key: DayKey, label: string): WorkoutDay => ({
  key,
  name: label,
  type: "Full Body",
  exercises: [
    ex("back-squat", 3, [6, 10], 150),
    ex("flat-barbell-bench", 3, [6, 10], 150),
    ex("barbell-row", 3, [8, 12], 120),
    ex("seated-ohp", 3, [10, 12], 90),
    ex("db-curl", 2, [10, 15], 60),
    ex("hanging-leg-raise", 3, [10, 20], 60),
  ],
});

export const SPLIT_TEMPLATES: SplitTemplate[] = [
  {
    id: "carve",
    name: "The Carve",
    tagline: "Upper-focus, four lifting days, no legs. The original Forge split.",
    daysPerWeek: 4,
    bestFor: "Aesthetics-first lifters protecting a leg injury",
    days: ANAND_SPLITS,
  },
  {
    id: "ppl",
    name: "Push / Pull / Legs",
    tagline: "Six days, hits every muscle twice a week. The hypertrophy gold standard.",
    daysPerWeek: 6,
    bestFor: "Intermediate to advanced lifters with time to train",
    days: week({
      monday: PUSH("monday"),
      tuesday: PULL("tuesday"),
      wednesday: LEGS("wednesday"),
      thursday: PUSH("thursday"),
      friday: PULL("friday"),
      saturday: LEGS("saturday"),
    }),
  },
  {
    id: "upper-lower",
    name: "Upper / Lower",
    tagline: "Four balanced days. Strength and size without living in the gym.",
    daysPerWeek: 4,
    bestFor: "Busy lifters who still want full-body coverage",
    days: week({
      monday: UPPER("monday"),
      tuesday: LOWER("tuesday"),
      thursday: UPPER("thursday"),
      friday: LOWER("friday"),
    }),
  },
  {
    id: "full-body",
    name: "Full Body 3x",
    tagline: "Three sessions, whole body each time. Perfect on-ramp for beginners.",
    daysPerWeek: 3,
    bestFor: "Beginners or anyone short on days",
    days: week({
      monday: FULL("monday", "Full Body A"),
      wednesday: FULL("wednesday", "Full Body B"),
      friday: FULL("friday", "Full Body C"),
    }),
  },
  {
    id: "bro-split",
    name: "Bro Split",
    tagline: "One muscle a day, five days a week. Maximum pump, maximum focus.",
    daysPerWeek: 5,
    bestFor: "Lifters chasing detail work and a daily focus",
    days: week({
      monday: { key: "monday", name: "Chest", type: "Push", exercises: [
        ex("flat-barbell-bench", 4, [6, 10], 150),
        ex("incline-press", 3, [8, 12], 120),
        ex("machine-chest-press", 3, [10, 12], 90),
        ex("pec-deck", 3, [12, 15], 60),
        ex("cable-crossover", 3, [12, 20], 60),
      ] },
      tuesday: { key: "tuesday", name: "Back", type: "Pull", exercises: [
        ex("deadlift", 3, [5, 8], 180),
        ex("weighted-pullup", 3, [6, 10], 120),
        ex("barbell-row", 3, [8, 12], 120),
        ex("seated-cable-row", 3, [10, 12], 90),
        ex("straight-arm-pulldown", 3, [12, 15], 60),
      ] },
      wednesday: { key: "wednesday", name: "Shoulders", type: "Shoulders", exercises: [
        ex("barbell-ohp", 4, [6, 10], 120),
        ex("lateral-raise-db", 4, [12, 20], 60),
        ex("reverse-pec-deck", 3, [12, 15], 60),
        ex("upright-row", 3, [10, 12], 75),
        ex("face-pulls", 3, [15, 20], 45),
      ] },
      thursday: { key: "thursday", name: "Arms", type: "Pull", exercises: [
        ex("barbell-curl", 4, [8, 12], 75),
        ex("close-grip-bench", 4, [8, 12], 90),
        ex("incline-db-curl", 3, [10, 12], 60),
        ex("cable-pushdown", 3, [10, 15], 60),
        ex("hammer-curl", 3, [10, 15], 60),
      ] },
      friday: { key: "friday", name: "Legs", type: "Full Body", exercises: [
        ex("back-squat", 4, [6, 10], 180),
        ex("romanian-deadlift", 3, [8, 12], 150),
        ex("leg-press", 3, [10, 15], 120),
        ex("leg-curl", 3, [10, 15], 75),
        ex("standing-calf-raise", 4, [12, 20], 60),
      ] },
    }),
  },
  {
    id: "arnold",
    name: "Arnold Split",
    tagline: "Chest+Back, Shoulders+Arms, Legs. Six days of old-school volume.",
    daysPerWeek: 6,
    bestFor: "Advanced lifters who recover fast and love volume",
    days: week({
      monday: { key: "monday", name: "Chest + Back", type: "Push", exercises: [
        ex("flat-barbell-bench", 4, [6, 10], 150),
        ex("barbell-row", 4, [6, 10], 150),
        ex("incline-press", 3, [8, 12], 120),
        ex("lat-pulldown", 3, [10, 12], 90),
        ex("pec-deck", 3, [12, 15], 60),
      ] },
      tuesday: { key: "tuesday", name: "Shoulders + Arms", type: "Shoulders", exercises: [
        ex("barbell-ohp", 4, [6, 10], 120),
        ex("lateral-raise-db", 3, [12, 20], 60),
        ex("barbell-curl", 3, [8, 12], 75),
        ex("close-grip-bench", 3, [8, 12], 90),
        ex("hammer-curl", 3, [10, 15], 60),
      ] },
      wednesday: LEGS("wednesday"),
      thursday: { key: "thursday", name: "Chest + Back", type: "Push", exercises: [
        ex("incline-press", 4, [6, 10], 150),
        ex("weighted-pullup", 4, [6, 10], 150),
        ex("machine-chest-press", 3, [10, 12], 90),
        ex("seated-cable-row", 3, [10, 12], 90),
        ex("cable-crossover", 3, [12, 20], 60),
      ] },
      friday: { key: "friday", name: "Shoulders + Arms", type: "Shoulders", exercises: [
        ex("arnold-press", 4, [8, 12], 120),
        ex("lateral-raise-cable", 3, [15, 20], 45),
        ex("preacher-curl", 3, [8, 12], 75),
        ex("skull-crusher", 3, [8, 12], 90),
        ex("cable-pushdown", 3, [12, 15], 60),
      ] },
      saturday: LEGS("saturday"),
    }),
  },
];

export function getTemplate(id: string): SplitTemplate | undefined {
  return SPLIT_TEMPLATES.find((t) => t.id === id);
}
