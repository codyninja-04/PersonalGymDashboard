// Builds a compact metrics summary to inject into AI prompts.
// Keep it tight (~1KB) to save tokens and keep responses fast.

import type { SyncBundle } from "@/app/actions/fetch";
import type { UserProfile } from "@/types/user";
import type { WeightEntry, BFEntry } from "@/types/metrics";
import type { PersonalRecord, WorkoutSession } from "@/types/workout";
import type { MealEntry } from "@/types/nutrition";
import { getPhase } from "@/lib/data/phases";

export interface UserContextInput {
  user: UserProfile;
  weights: WeightEntry[];
  bfs: BFEntry[];
  prs: PersonalRecord[];
  sessions: WorkoutSession[];
  todayMacros?: { calories: number; protein: number; carbs: number; fats: number };
  targetMacros?: { calories: number; protein: number; carbs: number; fats: number };
  mealsToday?: MealEntry[];
  intent?: string | null;
}

function fmtNum(n: number, digits = 1) {
  return Number.isFinite(n) ? n.toFixed(digits) : "?";
}

export function buildUserContext(input: UserContextInput): string {
  const { user, weights, bfs, prs, sessions, todayMacros, targetMacros, mealsToday, intent } = input;

  const last7Weights = weights.slice(-7);
  const last30Weights = weights.slice(-30);
  const weekDelta =
    last7Weights.length >= 2
      ? last7Weights.at(-1)!.weight - last7Weights[0].weight
      : 0;
  const monthDelta =
    last30Weights.length >= 2
      ? last30Weights.at(-1)!.weight - last30Weights[0].weight
      : 0;

  const recentBF = bfs.at(-1)?.bf ?? user.estimatedBF;
  const startBF = bfs[0]?.bf ?? user.estimatedBF;
  const bfDelta = recentBF - startBF;

  const phase = getPhase(user.phase);

  const lines: string[] = [];
  lines.push(`# Athlete profile`);
  lines.push(`name: ${user.name}, age ${user.age}, ${user.gender}, ${user.heightCm}cm`);
  lines.push(`current: ${fmtNum(user.currentWeightKg)}kg @ ${fmtNum(user.estimatedBF * 100)}% BF`);
  lines.push(`goal: ${user.goal} · target ${fmtNum(user.targetBF * 100, 0)}% BF`);

  lines.push(`\n# Current phase: ${phase.label} (${phase.stance})`);
  lines.push(`philosophy: ${phase.philosophy}`);
  lines.push(`priority: ${phase.priority}`);
  lines.push(`caloric stance: ${Math.round((phase.caloricMultiplier - 1) * 100)}% vs TDEE`);
  lines.push(`weekly weight target: ${phase.weeklyWeightChangeKg >= 0 ? "+" : ""}${phase.weeklyWeightChangeKg}kg`);
  lines.push(`training RPE band: ${phase.rpeBand[0]}-${phase.rpeBand[1]}, ${phase.repBias} bias`);
  lines.push(`cardio: ${phase.cardioPerWeek}× / wk · deload every ${phase.deloadEveryWeeks || "n/a"} wks`);
  lines.push(`common pitfall: ${phase.watchOut}`);

  lines.push(`\n# Recent trends`);
  lines.push(`weight 7d: ${weekDelta >= 0 ? "+" : ""}${fmtNum(weekDelta)}kg`);
  lines.push(`weight 30d: ${monthDelta >= 0 ? "+" : ""}${fmtNum(monthDelta)}kg`);
  lines.push(`BF change: ${bfDelta >= 0 ? "+" : ""}${fmtNum(bfDelta * 100, 2)}%`);
  lines.push(`sessions logged: ${sessions.length}`);

  if (sessions.length > 0) {
    const recent = sessions.slice(-5);
    lines.push(`\n# Last sessions`);
    recent.forEach((s) => {
      lines.push(`- ${s.date} · ${s.splitName} · ${Math.round(s.totalVolumeKg)}kg volume`);
    });
  }

  if (prs.length > 0) {
    lines.push(`\n# Recent PRs (max ${Math.min(5, prs.length)})`);
    prs.slice(0, 5).forEach((p) => {
      lines.push(`- ${p.exercise}: ${p.weight}kg × ${p.reps} (est 1RM ${fmtNum(p.estimatedOneRM, 1)}kg) on ${p.date}`);
    });
  }

  if (targetMacros && todayMacros) {
    lines.push(`\n# Today's fuel`);
    lines.push(
      `kcal: ${todayMacros.calories}/${targetMacros.calories} · ` +
        `P ${todayMacros.protein}/${targetMacros.protein}g · ` +
        `C ${todayMacros.carbs}/${targetMacros.carbs}g · ` +
        `F ${todayMacros.fats}/${targetMacros.fats}g`,
    );
    const remaining = {
      calories: targetMacros.calories - todayMacros.calories,
      protein: targetMacros.protein - todayMacros.protein,
      carbs: targetMacros.carbs - todayMacros.carbs,
      fats: targetMacros.fats - todayMacros.fats,
    };
    lines.push(
      `remaining: ${remaining.calories} kcal · P ${remaining.protein}g · C ${remaining.carbs}g · F ${remaining.fats}g`,
    );
    if (mealsToday && mealsToday.length > 0) {
      lines.push(`meals today: ${mealsToday.map((m) => m.name).join(", ")}`);
    }
  }

  if (intent) {
    lines.push(`\n# Today's intent: ${intent}`);
  }

  return lines.join("\n");
}

export function bundleToContextInput(bundle: SyncBundle, extras?: { intent?: string }): UserContextInput {
  const profile = bundle.profile;
  const user: UserProfile = profile
    ? {
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        heightCm: Number(profile.height_cm),
        currentWeightKg: Number(profile.current_weight_kg),
        estimatedBF: Number(profile.estimated_bf),
        goal: profile.goal,
        phase: profile.phase,
        targetBF: Number(profile.target_bf),
      }
    : {
        name: "Athlete",
        age: 21,
        gender: "male",
        heightCm: 178,
        currentWeightKg: 72,
        estimatedBF: 0.21,
        goal: "recomp",
        phase: "Aggressive Cut",
        targetBF: 0.11,
      };

  return {
    user,
    weights: bundle.weights.map((w) => ({ date: w.date, weight: Number(w.weight_kg) })),
    bfs: bundle.bfs.map((b) => ({ date: b.date, bf: Number(b.bf) })),
    prs: bundle.prs.map((p) => ({
      exercise: p.exercise,
      weight: Number(p.weight),
      reps: p.reps,
      date: p.date,
      estimatedOneRM: Number(p.estimated_one_rm),
    })),
    sessions: bundle.sessions.map((s) => ({
      id: s.id,
      date: s.date,
      splitKey: s.split_key as WorkoutSession["splitKey"],
      splitName: s.split_name,
      startedAt: s.started_at,
      finishedAt: s.finished_at ?? undefined,
      totalVolumeKg: Number(s.total_volume_kg),
      sets: [],
    })),
    todayMacros: bundle.todayFuel
      ? {
          calories: bundle.todayFuel.calories,
          protein: bundle.todayFuel.protein,
          carbs: bundle.todayFuel.carbs,
          fats: bundle.todayFuel.fats,
        }
      : undefined,
    mealsToday: bundle.todayFuel ? ((bundle.todayFuel.meals as MealEntry[]) ?? []) : undefined,
    intent: extras?.intent,
  };
}
