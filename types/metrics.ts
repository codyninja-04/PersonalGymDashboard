export interface WeightEntry {
  date: string;
  weight: number;
}

export interface BFEntry {
  date: string;
  bf: number;
}

export interface BodyMetric {
  date: string;
  weightKg: number;
  bf: number;
  leanMassKg: number;
}

export type CoachMessageType =
  | "SYSTEM"
  | "ACTION_REQUIRED"
  | "NUTRITION_OVERRIDE"
  | "DIRECTIVE"
  | "PR_ALERT"
  | "WARNING";

export interface CoachMessage {
  id: string;
  type: CoachMessageType;
  text: string;
  timestamp: string;
}
