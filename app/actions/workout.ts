"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type { WorkoutSession } from "@/types/workout";

export async function saveSessionAction(session: WorkoutSession) {
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("workout_sessions").insert({
    user_id: user.id,
    date: session.date,
    split_key: session.splitKey,
    split_name: session.splitName,
    started_at: session.startedAt,
    finished_at: session.finishedAt ?? new Date().toISOString(),
    total_volume_kg: session.totalVolumeKg,
    sets: session.sets,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
