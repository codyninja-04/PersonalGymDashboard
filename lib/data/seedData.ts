import type { UserProfile } from "@/types/user";
import type { PersonalRecord, WorkoutSession } from "@/types/workout";
import type { WeightEntry, BFEntry } from "@/types/metrics";

export const ANAND_USER: UserProfile = {
  name: "Anand",
  age: 21,
  gender: "male",
  heightCm: 178,
  currentWeightKg: 72,
  estimatedBF: 0.21,
  goal: "cut",
  phase: "cut-aggressive",
  targetBF: 0.11,
};

// Legacy hardcoded macros — kept as a fallback only.
// Real targets are now computed dynamically via lib/calculations/macros.ts
// based on the user's current phase + weight.
export const ANAND_NUTRITION = {
  gymDays: { calories: 2050, protein: 148, carbs: 195, fats: 57 },
  restDays: { calories: 1750, protein: 145, carbs: 110, fats: 50 },
  creatineDaily: 5,
  waterTargetLiters: 3.0,
};

function dateNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function generateWeightHistory(currentKg: number, days: number): WeightEntry[] {
  const entries: WeightEntry[] = [];
  const totalDrop = 1.3;
  for (let i = days - 1; i >= 0; i--) {
    const t = (days - 1 - i) / (days - 1);
    const trend = currentKg + totalDrop - totalDrop * t;
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.7)) * 0.18;
    entries.push({
      date: dateNDaysAgo(i),
      weight: Math.round((trend + noise) * 10) / 10,
    });
  }
  entries[entries.length - 1].weight = currentKg;
  return entries;
}

export function generateBFHistory(currentBF: number, days: number): BFEntry[] {
  const entries: BFEntry[] = [];
  const totalDrop = 0.012;
  for (let i = days - 1; i >= 0; i--) {
    const t = (days - 1 - i) / (days - 1);
    const trend = currentBF + totalDrop - totalDrop * t;
    const noise = (Math.sin(i * 0.9)) * 0.0015;
    entries.push({
      date: dateNDaysAgo(i),
      bf: Math.round((trend + noise) * 10000) / 10000,
    });
  }
  entries[entries.length - 1].bf = currentBF;
  return entries;
}

export const ANAND_PRS: PersonalRecord[] = [
  { exercise: "Incline DB Press", weight: 35, reps: 10, date: dateNDaysAgo(7), estimatedOneRM: 46.7 },
  { exercise: "Weighted Pull-up", weight: 10, reps: 6, date: dateNDaysAgo(5), estimatedOneRM: 84.7 },
  { exercise: "Seated DB OHP", weight: 22, reps: 10, date: dateNDaysAgo(1), estimatedOneRM: 29.3 },
  { exercise: "Lat Pulldown", weight: 65, reps: 8, date: dateNDaysAgo(12), estimatedOneRM: 80.3 },
  { exercise: "Seated Cable Row", weight: 70, reps: 10, date: dateNDaysAgo(9), estimatedOneRM: 93.3 },
];

export function generateRecentSessions(days = 14): WorkoutSession[] {
  const sessions: WorkoutSession[] = [];
  const muscleVolumeSamples = [
    { key: "monday", splitName: "Chest + Triceps", volume: 6420 },
    { key: "wednesday", splitName: "Back + Biceps", volume: 7850 },
    { key: "friday", splitName: "Shoulders + Forearms", volume: 4980 },
    { key: "saturday", splitName: "Full Body (No Legs)", volume: 5640 },
  ] as const;
  for (let i = days; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const map: Record<number, (typeof muscleVolumeSamples)[number] | null> = {
      1: muscleVolumeSamples[0],
      3: muscleVolumeSamples[1],
      5: muscleVolumeSamples[2],
      6: muscleVolumeSamples[3],
      0: null,
      2: null,
      4: null,
    };
    const slot = map[dayOfWeek];
    if (!slot) continue;
    const isoDate = date.toISOString().slice(0, 10);
    sessions.push({
      id: `seed-${isoDate}`,
      date: isoDate,
      splitKey: slot.key,
      splitName: slot.splitName,
      startedAt: `${isoDate}T18:00:00.000Z`,
      finishedAt: `${isoDate}T19:15:00.000Z`,
      sets: [],
      totalVolumeKg: slot.volume + Math.round((Math.random() - 0.5) * 600),
    });
  }
  return sessions;
}

export function computeSeedStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  const sorted = [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1));
  const dates = new Set(sorted.map((s) => s.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dates.has(key)) streak += 1;
    else if (i > 1) break;
  }
  return Math.max(streak, sessions.length);
}
