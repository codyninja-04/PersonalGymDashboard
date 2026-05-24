import type { UserProfile } from "@/types/user";
import { getPhase } from "@/lib/data/phases";

// Mifflin-St Jeor BMR
export function calculateBMR(user: UserProfile): number {
  const male = user.gender === "male" ? 5 : -161;
  return Math.round(
    10 * user.currentWeightKg + 6.25 * user.heightCm - 5 * user.age + male,
  );
}

export function calculateTDEE(user: UserProfile, activity = 1.55): number {
  return Math.round(calculateBMR(user) * activity);
}

export function calculateDeficit(user: UserProfile, targetCals: number, activity = 1.55) {
  const tdee = calculateTDEE(user, activity);
  return tdee - targetCals;
}

// Estimate weeks remaining to hit target BF/weight using phase's prescribed
// weekly weight change.
export function weeksToTargetBF(
  currentWeightKg: number,
  currentBF: number,
  targetBF: number,
  weeklyDropKg = 0.5,
): number {
  const leanMass = currentWeightKg * (1 - currentBF);
  const targetWeight = leanMass / (1 - targetBF);
  const weightToLose = Math.max(0, currentWeightKg - targetWeight);
  const drop = Math.max(0.05, Math.abs(weeklyDropKg));
  return Math.ceil(weightToLose / drop);
}

// Phase-aware horizon. For bulks, projects weeks to add target lean mass.
// For cuts, projects weeks to hit target BF. For recomp/maintenance, returns 0.
export function weeksHorizonForPhase(user: UserProfile): {
  weeks: number;
  label: string;
  target: string;
} {
  const phase = getPhase(user.phase);
  if (phase.stance === "deficit") {
    const weeks = weeksToTargetBF(
      user.currentWeightKg,
      user.estimatedBF,
      user.targetBF,
      Math.abs(phase.weeklyWeightChangeKg) || 0.4,
    );
    return { weeks, label: "to target BF", target: `${(user.targetBF * 100).toFixed(0)}% BF` };
  }
  if (phase.stance === "surplus") {
    const weeks = phase.typicalDurationWeeks === 999 ? 0 : phase.typicalDurationWeeks;
    const gain = Math.round((phase.weeklyWeightChangeKg * weeks) * 10) / 10;
    return { weeks, label: "to end of cycle", target: `+${gain}kg target` };
  }
  if (phase.key === "recomp") {
    return {
      weeks: phase.typicalDurationWeeks,
      label: "patience window",
      target: "composition shift",
    };
  }
  return { weeks: 0, label: "ongoing", target: "performance hold" };
}
