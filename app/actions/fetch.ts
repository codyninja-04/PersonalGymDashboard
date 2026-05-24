"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import type {
  DBBFLog,
  DBBodyMeasurement,
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
  recentFuel: DBDailyFuel[];
  measurements: DBBodyMeasurement[];
}

const EMPTY: SyncBundle = {
  profile: null,
  weights: [],
  bfs: [],
  prs: [],
  sessions: [],
  todayFuel: null,
  recentFuel: [],
  measurements: [],
};

async function safeSelect<T>(
  promise: PromiseLike<{ data: T | null; error: unknown }>,
  fallback: T,
): Promise<T> {
  try {
    const { data, error } = await promise;
    if (error) return fallback;
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export async function fetchSyncBundle(): Promise<SyncBundle> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return EMPTY;
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY;

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);

  const [
    profileRes,
    weightsRes,
    bfsRes,
    prsRes,
    sessionsRes,
    fuelRes,
    recentFuelRes,
    measurementsRes,
  ] = await Promise.all([
    safeSelect<DBProfile | null>(
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      null,
    ),
    safeSelect<DBWeightLog[]>(
      supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .limit(60),
      [],
    ),
    safeSelect<DBBFLog[]>(
      supabase
        .from("bf_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .limit(60),
      [],
    ),
    safeSelect<DBPersonalRecord[]>(
      supabase
        .from("personal_records")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(20),
      [],
    ),
    safeSelect<DBWorkoutSession[]>(
      supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30),
      [],
    ),
    safeSelect<DBDailyFuel | null>(
      supabase
        .from("daily_fuel")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle(),
      null,
    ),
    safeSelect<DBDailyFuel[]>(
      supabase
        .from("daily_fuel")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", sevenDaysAgo)
        .order("date", { ascending: true }),
      [],
    ),
    safeSelect<DBBodyMeasurement[]>(
      supabase
        .from("body_measurements")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .limit(60),
      [],
    ),
  ]);

  return {
    profile: profileRes,
    weights: weightsRes,
    bfs: bfsRes,
    prs: prsRes,
    sessions: sessionsRes,
    todayFuel: fuelRes,
    recentFuel: recentFuelRes,
    measurements: measurementsRes,
  };
}
