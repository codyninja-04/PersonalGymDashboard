// Supabase row shapes — mirror schema.sql

export interface DBProfile {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  height_cm: number;
  current_weight_kg: number;
  estimated_bf: number;
  goal: "recomp" | "cut" | "bulk";
  phase: string;
  target_bf: number;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBWeightLog {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
}

export interface DBBFLog {
  id: string;
  user_id: string;
  date: string;
  bf: number;
}

export interface DBPersonalRecord {
  id: string;
  user_id: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string;
  estimated_one_rm: number;
}

export interface DBWorkoutSession {
  id: string;
  user_id: string;
  date: string;
  split_key: string;
  split_name: string;
  started_at: string;
  finished_at: string | null;
  total_volume_kg: number;
  sets: unknown[];
}

export interface DBDailyFuel {
  id: string;
  user_id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water_liters: number;
  creatine_taken: boolean;
  meals: unknown[];
}
