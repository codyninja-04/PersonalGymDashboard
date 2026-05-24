"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export interface LifestyleInput {
  sleep_hours?: number | null;
  steps?: number | null;
  energy_rating?: number | null;
  soreness_rating?: number | null;
  notes?: string | null;
}

const today = () => new Date().toISOString().slice(0, 10);

export async function logLifestyleAction(input: LifestyleInput) {
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const date = today();
  const { error } = await supabase.from("daily_fuel").upsert(
    {
      user_id: user.id,
      date,
      sleep_hours: input.sleep_hours ?? null,
      steps: input.steps ?? null,
      energy_rating: input.energy_rating ?? null,
      soreness_rating: input.soreness_rating ?? null,
      notes: input.notes ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" },
  );
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function markDeloadAction() {
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase
    .from("profiles")
    .update({ last_deload_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
