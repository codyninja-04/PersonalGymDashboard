import type { SetLog, WorkoutSession } from "@/types/workout";
import { estimateOneRepMax } from "./oneRepMax";

export interface ExerciseTopSet {
  date: string;
  weight: number;
  reps: number;
  estOneRM: number;
  volume: number;
}

function isLogged(s: SetLog): boolean {
  return (s.status === "done" || s.status === "pr") && s.weight > 0 && s.reps > 0;
}

/** The hardest single set (by estimated 1RM) in a list. */
function topSetOf(sets: SetLog[]): { weight: number; reps: number } | null {
  const valid = sets.filter(isLogged);
  if (valid.length === 0) return null;
  let best = valid[0];
  let bestRM = estimateOneRepMax(best.weight, best.reps);
  for (const s of valid) {
    const rm = estimateOneRepMax(s.weight, s.reps);
    if (rm > bestRM) {
      best = s;
      bestRM = rm;
    }
  }
  return { weight: best.weight, reps: best.reps };
}

/** One top-set row per session that contains this exercise, oldest first. */
export function exerciseTopSetSeries(
  exerciseId: string,
  sessions: WorkoutSession[],
): ExerciseTopSet[] {
  const sorted = [...sessions].sort((a, b) => (a.date < b.date ? -1 : 1));
  const rows: ExerciseTopSet[] = [];
  for (const sess of sorted) {
    const sets = (sess.sets ?? []).filter((s) => s.exerciseId === exerciseId);
    const top = topSetOf(sets);
    if (!top) continue;
    rows.push({
      date: sess.date,
      weight: top.weight,
      reps: top.reps,
      estOneRM: estimateOneRepMax(top.weight, top.reps),
      volume: sets.filter(isLogged).reduce((a, s) => a + s.weight * s.reps, 0),
    });
  }
  return rows;
}

/** The most recent logged top set for an exercise, or null if never logged. */
export function lastExercisePerformance(
  exerciseId: string,
  sessions: WorkoutSession[],
): ExerciseTopSet | null {
  const series = exerciseTopSetSeries(exerciseId, sessions);
  return series.length ? series[series.length - 1] : null;
}
