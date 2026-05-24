"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export async function updateProfileAction(input: {
  name?: string;
  age?: number;
  gender?: "male" | "female";
  height_cm?: number;
  current_weight_kg?: number;
  estimated_bf?: number;
  goal?: "recomp" | "cut" | "bulk";
  phase?: string;
  target_bf?: number;
  onboarded?: boolean;
}) {
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...input, updated_at: new Date().toISOString() });

  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
