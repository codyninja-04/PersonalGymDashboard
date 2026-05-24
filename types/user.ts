export type Gender = "male" | "female";
export type Goal = "recomp" | "cut" | "bulk";

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  currentWeightKg: number;
  estimatedBF: number;
  goal: Goal;
  phase: string;
  targetBF: number;
}

export type TierKey = "novice" | "consistent" | "aesthetics-god" | "elite" | "goat";

export interface TierStatus {
  key: TierKey;
  label: string;
  threshold: number;
  color: string;
}
