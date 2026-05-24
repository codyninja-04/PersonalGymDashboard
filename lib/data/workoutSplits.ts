import type { WorkoutDay } from "@/types/workout";
import { EXERCISE_LIBRARY } from "./exerciseLibrary";

function ex(id: string, sets: number, repRange: [number, number], restSec: number) {
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

export const ANAND_SPLITS: Record<WorkoutDay["key"], WorkoutDay> = {
  monday: {
    key: "monday",
    name: "Chest + Triceps",
    type: "Push",
    exercises: [
      ex("incline-press", 3, [6, 12], 120),
      ex("pec-deck", 3, [10, 15], 75),
      ex("cable-crossover", 3, [10, 15], 60),
      ex("overhead-cable-ext", 3, [10, 12], 60),
      ex("skull-crusher", 3, [8, 12], 90),
      ex("cable-pushdown", 3, [12, 15], 60),
      ex("hanging-leg-raise", 3, [10, 20], 60),
    ],
  },
  tuesday: { key: "tuesday", name: "Rest / Recovery", type: "Rest", exercises: [], isRest: true },
  wednesday: {
    key: "wednesday",
    name: "Back + Biceps",
    type: "Pull",
    exercises: [
      ex("weighted-pullup", 3, [5, 8], 120),
      ex("seated-cable-row", 3, [8, 12], 90),
      ex("lat-pulldown", 3, [8, 12], 75),
      ex("db-curl", 3, [8, 12], 75),
      ex("preacher-curl", 3, [8, 12], 75),
      ex("incline-db-curl", 3, [8, 12], 60),
      ex("hanging-leg-raise", 3, [10, 20], 60),
    ],
  },
  thursday: { key: "thursday", name: "Boxing / Cardio", type: "Rest", exercises: [], isRest: true },
  friday: {
    key: "friday",
    name: "Shoulders + Forearms",
    type: "Shoulders",
    exercises: [
      ex("seated-ohp", 3, [6, 10], 120),
      ex("lateral-raise-db", 3, [12, 15], 60),
      ex("lateral-raise-cable", 3, [15, 15], 45),
      ex("reverse-pec-deck", 3, [12, 15], 60),
      ex("face-pulls", 2, [15, 20], 45),
      ex("wrist-curl", 2, [15, 20], 45),
      ex("reverse-wrist-curl", 2, [15, 20], 45),
      ex("hanging-leg-raise", 3, [10, 20], 60),
    ],
  },
  saturday: {
    key: "saturday",
    name: "Full Body (No Legs)",
    type: "Full Body",
    exercises: [
      ex("db-flat-press", 3, [10, 12], 75),
      ex("pullups-bw", 3, [5, 12], 90),
      ex("lateral-raise-sat", 3, [15, 20], 45),
      ex("db-curl-sat", 3, [12, 15], 60),
      ex("cable-pushdown-sat", 3, [12, 15], 60),
      ex("hanging-leg-raise", 3, [10, 20], 60),
    ],
  },
  sunday: { key: "sunday", name: "Rest Day", type: "Rest", exercises: [], isRest: true },
};

export const GYM_DAYS: Array<WorkoutDay["key"]> = ["monday", "wednesday", "friday", "saturday"];
