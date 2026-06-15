"use server";

import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type { WorkoutDay } from "@/types/workout";

export async function saveSplitAction(input: {
  days: Record<string, WorkoutDay>;
  template_id: string;
}) {
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      split: input.days,
      split_template: input.template_id,
      updated_at: new Date().toISOString(),
    });

  if (error) return { error: error.message };
  return { ok: true };
}
