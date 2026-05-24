import type { MuscleGroup } from "@/types/workout";

export interface ExerciseMeta {
  id: string;
  name: string;
  primary: MuscleGroup;
  secondary?: MuscleGroup[];
  category: "compound" | "isolation";
}

export const EXERCISE_LIBRARY: Record<string, ExerciseMeta> = {
  "incline-press": { id: "incline-press", name: "Incline Barbell/DB Press", primary: "Chest", secondary: ["Triceps", "Shoulders"], category: "compound" },
  "pec-deck": { id: "pec-deck", name: "Pec Deck Fly", primary: "Chest", category: "isolation" },
  "cable-crossover": { id: "cable-crossover", name: "Cable Crossover (low-to-high)", primary: "Chest", category: "isolation" },
  "overhead-cable-ext": { id: "overhead-cable-ext", name: "Overhead Cable Extension", primary: "Triceps", category: "isolation" },
  "skull-crusher": { id: "skull-crusher", name: "Skull Crusher EZ Bar", primary: "Triceps", category: "isolation" },
  "cable-pushdown": { id: "cable-pushdown", name: "Cable Pushdown (rope)", primary: "Triceps", category: "isolation" },
  "hanging-leg-raise": { id: "hanging-leg-raise", name: "Hanging Leg Raises", primary: "Core", category: "isolation" },
  "weighted-pullup": { id: "weighted-pullup", name: "Weighted Pull-ups", primary: "Back", secondary: ["Biceps"], category: "compound" },
  "seated-cable-row": { id: "seated-cable-row", name: "Seated Cable Row", primary: "Back", secondary: ["Biceps"], category: "compound" },
  "lat-pulldown": { id: "lat-pulldown", name: "Lat Pulldown (wide grip)", primary: "Back", secondary: ["Biceps"], category: "compound" },
  "db-curl": { id: "db-curl", name: "DB Curl (supinating)", primary: "Biceps", category: "isolation" },
  "preacher-curl": { id: "preacher-curl", name: "Preacher Curl", primary: "Biceps", category: "isolation" },
  "incline-db-curl": { id: "incline-db-curl", name: "Incline DB Curl", primary: "Biceps", category: "isolation" },
  "seated-ohp": { id: "seated-ohp", name: "Seated Overhead DB Press", primary: "Shoulders", secondary: ["Triceps"], category: "compound" },
  "lateral-raise-db": { id: "lateral-raise-db", name: "Lateral Raises (DB)", primary: "Shoulders", category: "isolation" },
  "lateral-raise-cable": { id: "lateral-raise-cable", name: "Cable Lateral Raise", primary: "Shoulders", category: "isolation" },
  "reverse-pec-deck": { id: "reverse-pec-deck", name: "Reverse Pec Deck", primary: "Shoulders", category: "isolation" },
  "face-pulls": { id: "face-pulls", name: "Face Pulls (rope)", primary: "Shoulders", category: "isolation" },
  "wrist-curl": { id: "wrist-curl", name: "Wrist Curl", primary: "Forearms", category: "isolation" },
  "reverse-wrist-curl": { id: "reverse-wrist-curl", name: "Reverse Wrist Curl", primary: "Forearms", category: "isolation" },
  "db-flat-press": { id: "db-flat-press", name: "DB Flat Press", primary: "Chest", secondary: ["Triceps", "Shoulders"], category: "compound" },
  "pullups-bw": { id: "pullups-bw", name: "Pull-ups (bodyweight)", primary: "Back", secondary: ["Biceps"], category: "compound" },
  "lateral-raise-sat": { id: "lateral-raise-sat", name: "Lateral Raises (2nd dose)", primary: "Shoulders", category: "isolation" },
  "db-curl-sat": { id: "db-curl-sat", name: "DB Curl", primary: "Biceps", category: "isolation" },
  "cable-pushdown-sat": { id: "cable-pushdown-sat", name: "Cable Pushdown", primary: "Triceps", category: "isolation" },
};

export function getExerciseMeta(id: string): ExerciseMeta | undefined {
  return EXERCISE_LIBRARY[id];
}
