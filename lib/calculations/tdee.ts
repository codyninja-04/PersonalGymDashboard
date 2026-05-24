import type { UserProfile } from "@/types/user";

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

// Estimate weeks remaining to hit target BF based on 0.5kg/wk drop
export function weeksToTargetBF(
  currentWeightKg: number,
  currentBF: number,
  targetBF: number,
  weeklyDropKg = 0.5,
): number {
  const leanMass = currentWeightKg * (1 - currentBF);
  // Target weight at target BF = leanMass / (1 - targetBF)
  const targetWeight = leanMass / (1 - targetBF);
  const weightToLose = Math.max(0, currentWeightKg - targetWeight);
  return Math.ceil(weightToLose / weeklyDropKg);
}
