"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { computeLeanMassSeries, leanMassDelta } from "@/lib/calculations/leanMassEstimator";
import { computeStrengthIndex, strengthPercentileLabel } from "@/lib/calculations/strengthIndex";
import { weeksToTargetBF, calculateTDEE } from "@/lib/calculations/tdee";

export function useBodyMetrics() {
  const user = useAppStore((s) => s.user);
  const weightHistory = useAppStore((s) => s.weightHistory);
  const bfHistory = useAppStore((s) => s.bfHistory);
  const personalRecords = useAppStore((s) => s.personalRecords);

  return useMemo(() => {
    const series = computeLeanMassSeries(weightHistory, bfHistory);
    const last7 = weightHistory.slice(-7);
    const last30 = weightHistory.slice(-30);
    const weekDelta =
      last7.length >= 2
        ? Math.round((last7[last7.length - 1].weight - last7[0].weight) * 10) / 10
        : 0;
    const monthDelta =
      last30.length >= 2
        ? Math.round((last30[last30.length - 1].weight - last30[0].weight) * 10) / 10
        : 0;
    const lmDelta = leanMassDelta(series);
    const strength = computeStrengthIndex(personalRecords, user.currentWeightKg);
    const percentile = strengthPercentileLabel(strength.relativeToBodyweight);
    const weeksLeft = weeksToTargetBF(user.currentWeightKg, user.estimatedBF, user.targetBF, 0.4);
    const tdee = calculateTDEE(user);

    return {
      series,
      weekDelta,
      monthDelta,
      leanMassDelta: lmDelta,
      currentLeanMass: series.at(-1)?.leanMassKg ?? 0,
      strength,
      percentile,
      weeksLeft,
      tdee,
    };
  }, [user, weightHistory, bfHistory, personalRecords]);
}

// Tier system — grounded names, no cringe.
// Mirrors the David Laid "carved, not just inflated" philosophy.
export function useTierStatus(streak: number) {
  if (streak >= 60)
    return { key: "carved" as const, label: "Carved", color: "var(--color-bone)" };
  if (streak >= 30)
    return { key: "forged" as const, label: "Forged", color: "var(--color-cream)" };
  if (streak >= 14)
    return { key: "locked" as const, label: "Locked in", color: "var(--color-chrome)" };
  if (streak >= 7)
    return { key: "dialed" as const, label: "Dialed", color: "var(--color-text-secondary)" };
  return { key: "initiate" as const, label: "Initiate", color: "var(--color-text-muted)" };
}
