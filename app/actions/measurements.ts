"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type { DBBodyMeasurement } from "@/types/db";

export interface MeasurementInput {
  date?: string;
  waist_cm?: number | null;
  chest_cm?: number | null;
  arm_cm?: number | null;
  neck_cm?: number | null;
  thigh_cm?: number | null;
  hip_cm?: number | null;
  notes?: string | null;
}

export async function logMeasurementAction(input: MeasurementInput) {
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const date = input.date ?? new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("body_measurements").upsert(
    {
      user_id: user.id,
      date,
      waist_cm: input.waist_cm ?? null,
      chest_cm: input.chest_cm ?? null,
      arm_cm: input.arm_cm ?? null,
      neck_cm: input.neck_cm ?? null,
      thigh_cm: input.thigh_cm ?? null,
      hip_cm: input.hip_cm ?? null,
      notes: input.notes ?? null,
    },
    { onConflict: "user_id,date" },
  );
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function fetchMeasurementsAction(): Promise<DBBodyMeasurement[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true })
    .limit(60);
  return (data as DBBodyMeasurement[]) ?? [];
}

export async function deleteMeasurementAction(id: string) {
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("body_measurements").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
