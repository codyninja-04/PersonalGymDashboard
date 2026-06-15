import type { MuscleGroup } from "@/types/workout";

export interface ExerciseMeta {
  id: string;
  name: string;
  primary: MuscleGroup;
  secondary?: MuscleGroup[];
  category: "compound" | "isolation";
}

export const EXERCISE_LIBRARY: Record<string, ExerciseMeta> = {
  // ── Chest ──────────────────────────────────────────────────────────────
  "incline-press": { id: "incline-press", name: "Incline Barbell/DB Press", primary: "Chest", secondary: ["Triceps", "Shoulders"], category: "compound" },
  "flat-barbell-bench": { id: "flat-barbell-bench", name: "Flat Barbell Bench Press", primary: "Chest", secondary: ["Triceps", "Shoulders"], category: "compound" },
  "db-flat-press": { id: "db-flat-press", name: "DB Flat Press", primary: "Chest", secondary: ["Triceps", "Shoulders"], category: "compound" },
  "machine-chest-press": { id: "machine-chest-press", name: "Machine Chest Press", primary: "Chest", secondary: ["Triceps"], category: "compound" },
  "dips-chest": { id: "dips-chest", name: "Chest Dips", primary: "Chest", secondary: ["Triceps"], category: "compound" },
  "pec-deck": { id: "pec-deck", name: "Pec Deck Fly", primary: "Chest", category: "isolation" },
  "cable-crossover": { id: "cable-crossover", name: "Cable Crossover (low-to-high)", primary: "Chest", category: "isolation" },
  "push-up": { id: "push-up", name: "Push-ups", primary: "Chest", secondary: ["Triceps"], category: "compound" },

  // ── Back ───────────────────────────────────────────────────────────────
  "deadlift": { id: "deadlift", name: "Conventional Deadlift", primary: "Back", secondary: ["Legs", "Forearms"], category: "compound" },
  "weighted-pullup": { id: "weighted-pullup", name: "Weighted Pull-ups", primary: "Back", secondary: ["Biceps"], category: "compound" },
  "pullups-bw": { id: "pullups-bw", name: "Pull-ups (bodyweight)", primary: "Back", secondary: ["Biceps"], category: "compound" },
  "chin-up": { id: "chin-up", name: "Chin-ups", primary: "Back", secondary: ["Biceps"], category: "compound" },
  "barbell-row": { id: "barbell-row", name: "Barbell Row", primary: "Back", secondary: ["Biceps"], category: "compound" },
  "t-bar-row": { id: "t-bar-row", name: "T-Bar Row", primary: "Back", secondary: ["Biceps"], category: "compound" },
  "single-arm-db-row": { id: "single-arm-db-row", name: "Single-arm DB Row", primary: "Back", secondary: ["Biceps"], category: "compound" },
  "seated-cable-row": { id: "seated-cable-row", name: "Seated Cable Row", primary: "Back", secondary: ["Biceps"], category: "compound" },
  "lat-pulldown": { id: "lat-pulldown", name: "Lat Pulldown (wide grip)", primary: "Back", secondary: ["Biceps"], category: "compound" },
  "straight-arm-pulldown": { id: "straight-arm-pulldown", name: "Straight-arm Pulldown", primary: "Back", category: "isolation" },

  // ── Legs ───────────────────────────────────────────────────────────────
  "back-squat": { id: "back-squat", name: "Back Squat", primary: "Legs", secondary: ["Core"], category: "compound" },
  "front-squat": { id: "front-squat", name: "Front Squat", primary: "Legs", secondary: ["Core"], category: "compound" },
  "leg-press": { id: "leg-press", name: "Leg Press", primary: "Legs", category: "compound" },
  "romanian-deadlift": { id: "romanian-deadlift", name: "Romanian Deadlift", primary: "Legs", secondary: ["Back"], category: "compound" },
  "bulgarian-split-squat": { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", primary: "Legs", secondary: ["Core"], category: "compound" },
  "walking-lunge": { id: "walking-lunge", name: "Walking Lunges", primary: "Legs", category: "compound" },
  "hip-thrust": { id: "hip-thrust", name: "Hip Thrust", primary: "Legs", category: "compound" },
  "leg-curl": { id: "leg-curl", name: "Lying Leg Curl", primary: "Legs", category: "isolation" },
  "leg-extension": { id: "leg-extension", name: "Leg Extension", primary: "Legs", category: "isolation" },
  "standing-calf-raise": { id: "standing-calf-raise", name: "Standing Calf Raise", primary: "Legs", category: "isolation" },
  "seated-calf-raise": { id: "seated-calf-raise", name: "Seated Calf Raise", primary: "Legs", category: "isolation" },

  // ── Shoulders ──────────────────────────────────────────────────────────
  "seated-ohp": { id: "seated-ohp", name: "Seated Overhead DB Press", primary: "Shoulders", secondary: ["Triceps"], category: "compound" },
  "barbell-ohp": { id: "barbell-ohp", name: "Standing Barbell OHP", primary: "Shoulders", secondary: ["Triceps"], category: "compound" },
  "arnold-press": { id: "arnold-press", name: "Arnold Press", primary: "Shoulders", secondary: ["Triceps"], category: "compound" },
  "lateral-raise-db": { id: "lateral-raise-db", name: "Lateral Raises (DB)", primary: "Shoulders", category: "isolation" },
  "lateral-raise-cable": { id: "lateral-raise-cable", name: "Cable Lateral Raise", primary: "Shoulders", category: "isolation" },
  "upright-row": { id: "upright-row", name: "Upright Row", primary: "Shoulders", secondary: ["Forearms"], category: "compound" },
  "reverse-pec-deck": { id: "reverse-pec-deck", name: "Reverse Pec Deck", primary: "Shoulders", category: "isolation" },
  "rear-delt-fly-cable": { id: "rear-delt-fly-cable", name: "Cable Rear Delt Fly", primary: "Shoulders", category: "isolation" },
  "face-pulls": { id: "face-pulls", name: "Face Pulls (rope)", primary: "Shoulders", category: "isolation" },

  // ── Triceps ────────────────────────────────────────────────────────────
  "close-grip-bench": { id: "close-grip-bench", name: "Close-grip Bench Press", primary: "Triceps", secondary: ["Chest"], category: "compound" },
  "dips-triceps": { id: "dips-triceps", name: "Triceps Dips", primary: "Triceps", category: "compound" },
  "overhead-cable-ext": { id: "overhead-cable-ext", name: "Overhead Cable Extension", primary: "Triceps", category: "isolation" },
  "overhead-db-ext": { id: "overhead-db-ext", name: "Overhead DB Extension", primary: "Triceps", category: "isolation" },
  "skull-crusher": { id: "skull-crusher", name: "Skull Crusher EZ Bar", primary: "Triceps", category: "isolation" },
  "cable-pushdown": { id: "cable-pushdown", name: "Cable Pushdown (rope)", primary: "Triceps", category: "isolation" },

  // ── Biceps ─────────────────────────────────────────────────────────────
  "barbell-curl": { id: "barbell-curl", name: "Barbell Curl", primary: "Biceps", category: "isolation" },
  "db-curl": { id: "db-curl", name: "DB Curl (supinating)", primary: "Biceps", category: "isolation" },
  "hammer-curl": { id: "hammer-curl", name: "Hammer Curl", primary: "Biceps", secondary: ["Forearms"], category: "isolation" },
  "preacher-curl": { id: "preacher-curl", name: "Preacher Curl", primary: "Biceps", category: "isolation" },
  "incline-db-curl": { id: "incline-db-curl", name: "Incline DB Curl", primary: "Biceps", category: "isolation" },
  "cable-curl": { id: "cable-curl", name: "Cable Curl", primary: "Biceps", category: "isolation" },
  "concentration-curl": { id: "concentration-curl", name: "Concentration Curl", primary: "Biceps", category: "isolation" },

  // ── Core ───────────────────────────────────────────────────────────────
  "hanging-leg-raise": { id: "hanging-leg-raise", name: "Hanging Leg Raises", primary: "Core", category: "isolation" },
  "cable-crunch": { id: "cable-crunch", name: "Cable Crunch", primary: "Core", category: "isolation" },
  "plank": { id: "plank", name: "Plank", primary: "Core", category: "isolation" },
  "ab-wheel": { id: "ab-wheel", name: "Ab Wheel Rollout", primary: "Core", category: "isolation" },
  "russian-twist": { id: "russian-twist", name: "Russian Twist", primary: "Core", category: "isolation" },

  // ── Forearms ───────────────────────────────────────────────────────────
  "wrist-curl": { id: "wrist-curl", name: "Wrist Curl", primary: "Forearms", category: "isolation" },
  "reverse-wrist-curl": { id: "reverse-wrist-curl", name: "Reverse Wrist Curl", primary: "Forearms", category: "isolation" },
  "farmers-carry": { id: "farmers-carry", name: "Farmer's Carry", primary: "Forearms", secondary: ["Core"], category: "compound" },

  // ── Legacy aliases (kept so historical splits keep resolving) ───────────
  "lateral-raise-sat": { id: "lateral-raise-sat", name: "Lateral Raises (2nd dose)", primary: "Shoulders", category: "isolation" },
  "db-curl-sat": { id: "db-curl-sat", name: "DB Curl", primary: "Biceps", category: "isolation" },
  "cable-pushdown-sat": { id: "cable-pushdown-sat", name: "Cable Pushdown", primary: "Triceps", category: "isolation" },
};

export function getExerciseMeta(id: string): ExerciseMeta | undefined {
  return EXERCISE_LIBRARY[id];
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Triceps",
  "Biceps",
  "Core",
  "Forearms",
];

/** Exercises grouped by their primary muscle, for pickers and the split builder. */
export function exercisesByMuscle(): Record<MuscleGroup, ExerciseMeta[]> {
  const out = {} as Record<MuscleGroup, ExerciseMeta[]>;
  for (const g of MUSCLE_GROUPS) out[g] = [];
  out.Legs = out.Legs ?? [];
  for (const meta of Object.values(EXERCISE_LIBRARY)) {
    (out[meta.primary] = out[meta.primary] ?? []).push(meta);
  }
  return out;
}
