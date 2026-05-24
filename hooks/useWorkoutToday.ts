"use client";

import { useMemo } from "react";
import { ANAND_SPLITS } from "@/lib/data/workoutSplits";
import { getDayKey } from "@/lib/utils/formatting";
import { useWorkoutStore } from "@/lib/store/useWorkoutStore";

export function useWorkoutToday() {
  const sets = useWorkoutStore((s) => s.sets);
  return useMemo(() => {
    const key = getDayKey();
    const split = ANAND_SPLITS[key];
    const completedExercises = Object.entries(sets).filter(([, logs]) =>
      logs.some((l) => l.status === "done" || l.status === "pr"),
    ).length;
    return {
      key,
      split,
      completedExercises,
      totalExercises: split.exercises.length,
      isRest: split.isRest ?? false,
    };
  }, [sets]);
}
