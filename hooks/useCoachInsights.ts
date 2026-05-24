"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { useNutritionStore } from "@/lib/store/useNutritionStore";
import { buildMessage, COACH_BOOT_SEQUENCE } from "@/lib/utils/coachMessages";
import type { CoachMessage } from "@/types/metrics";

export function useCoachInsights(): CoachMessage[] {
  const weightHistory = useAppStore((s) => s.weightHistory);
  const personalRecords = useAppStore((s) => s.personalRecords);
  const streak = useAppStore((s) => s.streak);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const todayCals = useNutritionStore((s) => s.today.calories);
  const targetCals = useNutritionStore((s) => s.targets.calories);

  return useMemo<CoachMessage[]>(() => {
    const messages: CoachMessage[] = [...COACH_BOOT_SEQUENCE];

    const last7 = weightHistory.slice(-7);
    if (last7.length >= 7) {
      const startAvg = last7.slice(0, 3).reduce((a, b) => a + b.weight, 0) / 3;
      const endAvg = last7.slice(-3).reduce((a, b) => a + b.weight, 0) / 3;
      if (Math.abs(endAvg - startAvg) < 0.2) {
        messages.push(
          buildMessage(
            "ACTION_REQUIRED",
            "Weight has been flat 7d. Add 1,500 steps daily before touching calories — protect the muscle first.",
          ),
        );
      } else if (endAvg < startAvg) {
        const dropped = Math.round((startAvg - endAvg) * 10) / 10;
        messages.push(
          buildMessage("DIRECTIVE", `Down ${dropped}kg this week. Steady. Hold the line.`),
        );
      }
    }

    const calsUnder = targetCals - todayCals;
    if (calsUnder > 200) {
      messages.push(
        buildMessage(
          "NUTRITION_OVERRIDE",
          `${calsUnder} kcal short. Hit a protein + carb meal before lifting — don't train empty.`,
        ),
      );
    } else if (calsUnder < -150) {
      messages.push(
        buildMessage(
          "WARNING",
          `${Math.abs(calsUnder)} kcal over target. Trim carbs at the next meal — preserve the deficit.`,
        ),
      );
    }

    const recent = personalRecords[personalRecords.length - 1];
    if (recent) {
      messages.push(
        buildMessage(
          "PR_ALERT",
          `${recent.exercise} PR — ${recent.weight}kg × ${recent.reps}. +2.5kg engaged next session.`,
        ),
      );
    }

    if (streak >= 14) {
      messages.push(
        buildMessage(
          "DIRECTIVE",
          `${streak}-day streak. The compound interest of consistency is showing.`,
        ),
      );
    }

    if (weekPlan.completed >= weekPlan.planned) {
      messages.push(
        buildMessage("DIRECTIVE", "Week complete. Sleep 8h. Recovery is the next rep."),
      );
    } else {
      messages.push(
        buildMessage(
          "SYSTEM",
          `Week status: ${weekPlan.completed}/${weekPlan.planned} sessions logged.`,
        ),
      );
    }

    return messages;
  }, [weightHistory, personalRecords, streak, weekPlan, todayCals, targetCals]);
}
