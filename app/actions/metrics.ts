"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

const today = () => new Date().toISOString().slice(0, 10);

export async function logWeightAction(weightKg: number) {
  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 250) {
    return { error: "Invalid weight" };
  }
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const date = today();
  const { error } = await supabase
    .from("weight_logs")
    .upsert({ user_id: user.id, date, weight_kg: weightKg }, { onConflict: "user_id,date" });
  if (error) return { error: error.message };

  await supabase
    .from("profiles")
    .update({ current_weight_kg: weightKg, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function logBFAction(bf: number) {
  if (!Number.isFinite(bf) || bf <= 0 || bf > 1) {
    return { error: "BF must be a fraction between 0 and 1" };
  }
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("bf_logs")
    .upsert({ user_id: user.id, date: today(), bf }, { onConflict: "user_id,date" });
  if (error) return { error: error.message };

  await supabase
    .from("profiles")
    .update({ estimated_bf: bf, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function logPRAction(input: {
  exercise: string;
  weight: number;
  reps: number;
  estimatedOneRM: number;
}) {
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("personal_records").insert({
    user_id: user.id,
    exercise: input.exercise,
    weight: input.weight,
    reps: input.reps,
    date: today(),
    estimated_one_rm: input.estimatedOneRM,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
