"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import type {
  DBBFLog,
  DBDailyFuel,
  DBPersonalRecord,
  DBProfile,
  DBWeightLog,
  DBWorkoutSession,
} from "@/types/db";

export interface SyncBundle {
  profile: DBProfile | null;
  weights: DBWeightLog[];
  bfs: DBBFLog[];
  prs: DBPersonalRecord[];
  sessions: DBWorkoutSession[];
  todayFuel: DBDailyFuel | null;
}

export async function fetchSyncBundle(): Promise<SyncBundle> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { profile: null, weights: [], bfs: [], prs: [], sessions: [], todayFuel: null };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { profile: null, weights: [], bfs: [], prs: [], sessions: [], todayFuel: null };
  }

  const today = new Date().toISOString().slice(0, 10);

  const [profileRes, weightsRes, bfsRes, prsRes, sessionsRes, fuelRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
      .limit(60),
    supabase
      .from("bf_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
      .limit(60),
    supabase
      .from("personal_records")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(20),
    supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(30),
    supabase
      .from("daily_fuel")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle(),
  ]);

  return {
    profile: (profileRes.data as DBProfile | null) ?? null,
    weights: (weightsRes.data as DBWeightLog[] | null) ?? [],
    bfs: (bfsRes.data as DBBFLog[] | null) ?? [],
    prs: (prsRes.data as DBPersonalRecord[] | null) ?? [],
    sessions: (sessionsRes.data as DBWorkoutSession[] | null) ?? [],
    todayFuel: (fuelRes.data as DBDailyFuel | null) ?? null,
  };
}
