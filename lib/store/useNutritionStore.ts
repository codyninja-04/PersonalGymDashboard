"use client";

import { create } from "zustand";
import type { MealEntry } from "@/types/nutrition";
import type { DBDailyFuel } from "@/types/db";
import type { UserProfile } from "@/types/user";
import { getActiveGymDays } from "@/lib/store/useSplitStore";
import { getDayKey } from "@/lib/utils/formatting";
import { saveFuelAction } from "@/app/actions/fuel";
import { macrosForToday, type MacroTargets } from "@/lib/calculations/macros";
import { ANAND_USER } from "@/lib/data/seedData";

interface NutritionState {
  targets: MacroTargets;
  today: MacroTargets;
  mealLog: MealEntry[];
  creatineTaken: boolean;
  waterLiters: number;
  todayKey: string;
  hydrated: boolean;

  hydrate: (fuel: DBDailyFuel | null, user?: UserProfile) => void;
  recomputeTargets: (user: UserProfile) => void;
  logMeal: (meal: Omit<MealEntry, "id" | "timestamp">) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  toggleCreatine: () => Promise<void>;
  setWater: (liters: number) => Promise<void>;
}

function isGymDay(): boolean {
  return getActiveGymDays().includes(getDayKey());
}

function emptyMacros(): MacroTargets {
  return { calories: 0, protein: 0, carbs: 0, fats: 0 };
}

export const useNutritionStore = create<NutritionState>()((set, get) => ({
  targets: macrosForToday(ANAND_USER, isGymDay()),
  today: emptyMacros(),
  mealLog: [],
  creatineTaken: false,
  waterLiters: 0,
  todayKey: new Date().toISOString().slice(0, 10),
  hydrated: false,

  hydrate: (fuel, user) => {
    const today = new Date().toISOString().slice(0, 10);
    const profile = user ?? ANAND_USER;
    const targets = macrosForToday(profile, isGymDay());
    if (!fuel) {
      set({
        targets,
        today: emptyMacros(),
        mealLog: [],
        creatineTaken: false,
        waterLiters: 0,
        todayKey: today,
        hydrated: true,
      });
      return;
    }
    set({
      targets,
      today: {
        calories: fuel.calories,
        protein: fuel.protein,
        carbs: fuel.carbs,
        fats: fuel.fats,
      },
      mealLog: (fuel.meals as MealEntry[]) ?? [],
      creatineTaken: fuel.creatine_taken,
      waterLiters: Number(fuel.water_liters),
      todayKey: today,
      hydrated: true,
    });
  },

  recomputeTargets: (user) => {
    set({ targets: macrosForToday(user, isGymDay()) });
  },

  logMeal: async (meal) => {
    const entry: MealEntry = {
      ...meal,
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      mealLog: [...s.mealLog, entry],
      today: {
        calories: s.today.calories + meal.calories,
        protein: s.today.protein + meal.protein,
        carbs: s.today.carbs + meal.carbs,
        fats: s.today.fats + meal.fats,
      },
    }));
    await persistFuel(get);
  },

  deleteMeal: async (id) => {
    set((s) => {
      const meal = s.mealLog.find((m) => m.id === id);
      if (!meal) return s;
      return {
        mealLog: s.mealLog.filter((m) => m.id !== id),
        today: {
          calories: Math.max(0, s.today.calories - meal.calories),
          protein: Math.max(0, s.today.protein - meal.protein),
          carbs: Math.max(0, s.today.carbs - meal.carbs),
          fats: Math.max(0, s.today.fats - meal.fats),
        },
      };
    });
    await persistFuel(get);
  },

  toggleCreatine: async () => {
    set((s) => ({ creatineTaken: !s.creatineTaken }));
    await persistFuel(get);
  },

  setWater: async (liters) => {
    set({ waterLiters: Math.max(0, Math.min(6, liters)) });
    await persistFuel(get);
  },
}));

async function persistFuel(get: () => NutritionState) {
  const s = get();
  await saveFuelAction({
    calories: s.today.calories,
    protein: s.today.protein,
    carbs: s.today.carbs,
    fats: s.today.fats,
    water_liters: s.waterLiters,
    creatine_taken: s.creatineTaken,
    meals: s.mealLog,
  });
}
