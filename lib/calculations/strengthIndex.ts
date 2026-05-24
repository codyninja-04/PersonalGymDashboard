import type { PersonalRecord } from "@/types/workout";
import { estimateOneRepMax } from "./oneRepMax";

const STRENGTH_KEY_EXERCISES = [
  /incline (db|barbell)? ?press|bench|db flat press/i,
  /lat pulldown|seated cable row|weighted pull-up|pull-up/i,
  /seated db ohp|seated overhead db press|overhead press/i,
];

export function computeStrengthIndex(
  prs: PersonalRecord[],
  bodyweightKg: number,
): { totalKg: number; relativeToBodyweight: number; perExercise: number[] } {
  const matched = STRENGTH_KEY_EXERCISES.map((rx) => {
    const candidates = prs.filter((p) => rx.test(p.exercise));
    if (candidates.length === 0) return 0;
    return Math.max(...candidates.map((p) => estimateOneRepMax(p.weight, p.reps)));
  });
  const totalKg = Math.round(matched.reduce((a, b) => a + b, 0) * 10) / 10;
  const relativeToBodyweight =
    bodyweightKg > 0 ? Math.round((totalKg / bodyweightKg) * 1000) / 1000 : 0;
  return { totalKg, relativeToBodyweight, perExercise: matched };
}

export function strengthPercentileLabel(relative: number): string {
  if (relative >= 2.8) return "Top 1% (Elite)";
  if (relative >= 2.4) return "Top 5%";
  if (relative >= 2.0) return "Top 15%";
  if (relative >= 1.6) return "Top 30%";
  if (relative >= 1.2) return "Above average";
  return "Building base";
}
