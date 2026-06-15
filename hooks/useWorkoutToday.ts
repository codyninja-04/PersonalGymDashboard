"use client";

import { useMemo } from "react";
import { getDayKey } from "@/lib/utils/formatting";
import { useWorkoutStore } from "@/lib/store/useWorkoutStore";
import { useSplitStore } from "@/lib/store/useSplitStore";

export function useWorkoutToday() {
  const sets = useWorkoutStore((s) => s.sets);
  const days = useSplitStore((s) => s.days);
  return useMemo(() => {
    const key = getDayKey();
    const split = days[key];
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
  }, [sets, days]);
}
