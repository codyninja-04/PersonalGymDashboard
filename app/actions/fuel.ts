"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type { MealEntry } from "@/types/nutrition";

const today = () => new Date().toISOString().slice(0, 10);

interface FuelInput {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water_liters: number;
  creatine_taken: boolean;
  meals: MealEntry[];
}

export async function saveFuelAction(input: FuelInput) {
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("daily_fuel")
    .upsert(
      {
        user_id: user.id,
        date: today(),
        calories: Math.round(input.calories),
        protein: Math.round(input.protein),
        carbs: Math.round(input.carbs),
        fats: Math.round(input.fats),
        water_liters: input.water_liters,
        creatine_taken: input.creatine_taken,
        meals: input.meals,
      },
      { onConflict: "user_id,date" },
    );

  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
