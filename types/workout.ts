export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Triceps"
  | "Biceps"
  | "Core"
  | "Forearms"
  | "Legs";

export type SplitType = "Push" | "Pull" | "Shoulders" | "Full Body" | "Rest";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  repRange: [number, number];
  restSec: number;
  primary: MuscleGroup;
  secondary?: MuscleGroup[];
}

export interface WorkoutDay {
  key: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  name: string;
  type: SplitType;
  exercises: Exercise[];
  isRest?: boolean;
}

export type SetStatus = "pending" | "in-progress" | "done" | "pr";

export interface SetLog {
  exerciseId: string;
  setIndex: number;
  reps: number;
  weight: number;
  rpe: number;
  timestamp: string;
  status: SetStatus;
}

export interface WorkoutSession {
  id: string;
  date: string;
  splitKey: WorkoutDay["key"];
  splitName: string;
  startedAt: string;
  finishedAt?: string;
  sets: SetLog[];
  totalVolumeKg: number;
}

export interface PersonalRecord {
  exercise: string;
  weight: number;
  reps: number;
  date: string;
  estimatedOneRM: number;
}
