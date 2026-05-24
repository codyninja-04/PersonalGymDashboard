import type { SetLog } from "@/types/workout";

export interface OverloadSuggestion {
  shouldIncrease: boolean;
  currentWeight: number;
  newWeight: number;
  increment: number;
}

export function checkProgressiveOverload(
  exerciseId: string,
  lastSession: SetLog[],
  repRangeMax: number,
  increment = 2.5,
): OverloadSuggestion {
  const lastSets = lastSession.filter((s) => s.exerciseId === exerciseId);
  if (lastSets.length === 0) {
    return { shouldIncrease: false, currentWeight: 0, newWeight: 0, increment };
  }
  const allHitMax = lastSets.every((s) => s.reps >= repRangeMax);
  const currentWeight = lastSets[0]?.weight ?? 0;
  return {
    shouldIncrease: allHitMax,
    currentWeight,
    newWeight: allHitMax ? currentWeight + increment : currentWeight,
    increment,
  };
}
