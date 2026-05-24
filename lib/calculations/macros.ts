// Compute macro targets from phase + user weight + day type.
// Replaces the hardcoded ANAND_NUTRITION constants.

import type { UserProfile } from "@/types/user";
import { getPhase, type PhaseKey } from "@/lib/data/phases";
import { calculateTDEE } from "./tdee";

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface PhaseMacroTargets {
  gym: MacroTargets;
  rest: MacroTargets;
}

const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_CARB = 4;
const KCAL_PER_G_FAT = 9;

export function computeMacros(user: UserProfile, phaseKey?: PhaseKey | string): PhaseMacroTargets {
  const phase = getPhase(phaseKey ?? user.phase);
  const tdee = calculateTDEE(user);
  const targetCals = Math.round(tdee * phase.caloricMultiplier);
  const bw = user.currentWeightKg;

  function build(carbPerKg: number): MacroTargets {
    const protein = Math.round(bw * phase.proteinPerKg);
    let carbs = Math.round(bw * carbPerKg);
    let fats = Math.round(bw * phase.fatPerKg);

    // Reconcile to target calories. Adjust carbs first, fats second.
    const kcalFromPF = protein * KCAL_PER_G_PROTEIN + fats * KCAL_PER_G_FAT;
    const kcalBudgetForCarbs = targetCals - kcalFromPF;
    if (kcalBudgetForCarbs > 0) {
      carbs = Math.max(40, Math.round(kcalBudgetForCarbs / KCAL_PER_G_CARB));
    } else {
      // Cut fats if carbs would go negative
      const minCarbs = 50;
      const carbKcal = minCarbs * KCAL_PER_G_CARB;
      const allowedFatKcal = targetCals - protein * KCAL_PER_G_PROTEIN - carbKcal;
      fats = Math.max(30, Math.round(allowedFatKcal / KCAL_PER_G_FAT));
      carbs = minCarbs;
    }

    return {
      calories: targetCals,
      protein,
      carbs,
      fats,
    };
  }

  return {
    gym: build(phase.carbPerKgGym),
    rest: build(phase.carbPerKgRest),
  };
}

export function macrosForToday(
  user: UserProfile,
  isGymDay: boolean,
  phaseKey?: PhaseKey | string,
): MacroTargets {
  const both = computeMacros(user, phaseKey);
  return isGymDay ? both.gym : both.rest;
}
