"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { useNutritionStore } from "@/lib/store/useNutritionStore";
import { buildMessage, COACH_BOOT_SEQUENCE } from "@/lib/utils/coachMessages";
import type { CoachMessage } from "@/types/metrics";
import { getPhase } from "@/lib/data/phases";

export function useCoachInsights(): CoachMessage[] {
  const weightHistory = useAppStore((s) => s.weightHistory);
  const personalRecords = useAppStore((s) => s.personalRecords);
  const streak = useAppStore((s) => s.streak);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const user = useAppStore((s) => s.user);
  const todayCals = useNutritionStore((s) => s.today.calories);
  const targetCals = useNutritionStore((s) => s.targets.calories);

  return useMemo<CoachMessage[]>(() => {
    const messages: CoachMessage[] = [...COACH_BOOT_SEQUENCE];
    const phase = getPhase(user.phase);

    messages.push(
      buildMessage(
        "DIRECTIVE",
        `Phase locked: ${phase.label}. ${phase.philosophy} Target ${phase.weeklyWeightChangeKg >= 0 ? "+" : ""}${phase.weeklyWeightChangeKg}kg/wk.`,
      ),
    );

    const last7 = weightHistory.slice(-7);
    if (last7.length >= 7) {
      const startAvg = last7.slice(0, 3).reduce((a, b) => a + b.weight, 0) / 3;
      const endAvg = last7.slice(-3).reduce((a, b) => a + b.weight, 0) / 3;
      const actualChange = endAvg - startAvg;
      const expectedChange = phase.weeklyWeightChangeKg;
      const stalled = Math.abs(actualChange) < 0.2;

      if (stalled && phase.stance !== "neutral") {
        const verb = phase.stance === "deficit" ? "loss" : "gain";
        messages.push(
          buildMessage(
            "ACTION_REQUIRED",
            `Weight flat 7d during a ${phase.stance}. Expected ${verb}. Bump ${phase.stance === "deficit" ? "steps before cutting cals" : "carbs by 30g/day"} — protect the long arc.`,
          ),
        );
      } else if (phase.stance === "deficit" && actualChange < expectedChange - 0.3) {
        messages.push(
          buildMessage(
            "WARNING",
            `Dropping faster than the ${Math.abs(expectedChange)}kg/wk target. Add 100 kcal back — protect lean mass.`,
          ),
        );
      } else if (phase.stance === "surplus" && actualChange > expectedChange + 0.3) {
        messages.push(
          buildMessage(
            "WARNING",
            `Gaining faster than ${expectedChange}kg/wk. Trim 200 kcal — that's water + fat, not just muscle.`,
          ),
        );
      } else if (Math.abs(actualChange - expectedChange) < 0.2) {
        messages.push(
          buildMessage(
            "DIRECTIVE",
            `On rails: ${actualChange >= 0 ? "+" : ""}${actualChange.toFixed(1)}kg vs target ${expectedChange >= 0 ? "+" : ""}${expectedChange}kg. Hold everything.`,
          ),
        );
      }
    }

    const calsUnder = targetCals - todayCals;
    if (calsUnder > 200) {
      const cue = phase.stance === "deficit"
        ? "Hit protein. Cardio's ok. Don't add carbs just to fill kcal."
        : "Eat. The surplus only works if you actually hit it.";
      messages.push(
        buildMessage(
          "NUTRITION_OVERRIDE",
          `${calsUnder} kcal short of target. ${cue}`,
        ),
      );
    } else if (calsUnder < -150) {
      const cue = phase.stance === "deficit"
        ? "Trim carbs at next meal — preserve the deficit."
        : phase.stance === "surplus"
          ? "Slight overshoot is fine on bulk — but watch the trend."
          : "Pull it back tomorrow. Maintenance is precision.";
      messages.push(
        buildMessage("WARNING", `${Math.abs(calsUnder)} kcal over. ${cue}`),
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
