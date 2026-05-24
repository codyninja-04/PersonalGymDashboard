"use client";

import { create } from "zustand";
import type { UserProfile } from "@/types/user";
import type { PersonalRecord, WorkoutSession } from "@/types/workout";
import type { WeightEntry, BFEntry } from "@/types/metrics";
import type { SyncBundle } from "@/app/actions/fetch";
import { ANAND_USER, generateWeightHistory, generateBFHistory } from "@/lib/data/seedData";
import { estimateOneRepMax } from "@/lib/calculations/oneRepMax";
import { logWeightAction, logBFAction, logPRAction } from "@/app/actions/metrics";
import { saveSessionAction } from "@/app/actions/workout";

interface WeekPlan {
  planned: number;
  completed: number;
  sessions: WorkoutSession[];
}

interface AppState {
  user: UserProfile;
  weightHistory: WeightEntry[];
  bfHistory: BFEntry[];
  streak: number;
  lastWorkoutDate: string | null;
  personalRecords: PersonalRecord[];
  weekPlan: WeekPlan;
  hydrated: boolean;
  syntheticData: boolean;

  hydrate: (bundle: SyncBundle) => void;
  logWeight: (kg: number) => Promise<void>;
  updateBF: (bf: number) => Promise<void>;
  logWorkoutComplete: (session: WorkoutSession) => Promise<void>;
  logPR: (exercise: string, weight: number, reps: number) => Promise<void>;
}

function computeStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  const dates = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dates.has(key)) streak += 1;
    else if (i > 1) break;
  }
  return streak;
}

function countThisWeek(sessions: WorkoutSession[]): number {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - dow);
  start.setHours(0, 0, 0, 0);
  return sessions.filter((s) => new Date(s.date) >= start).length;
}

export const useAppStore = create<AppState>()((set) => ({
  user: ANAND_USER,
  weightHistory: [],
  bfHistory: [],
  streak: 0,
  lastWorkoutDate: null,
  personalRecords: [],
  weekPlan: { planned: 4, completed: 0, sessions: [] },
  hydrated: false,
  syntheticData: false,

  hydrate: (bundle) => {
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
      : ANAND_USER;

    const realWeights: WeightEntry[] = bundle.weights.map((w) => ({
      date: w.date,
      weight: Number(w.weight_kg),
    }));
    const realBFs: BFEntry[] = bundle.bfs.map((b) => ({
      date: b.date,
      bf: Number(b.bf),
    }));
    const realSessions: WorkoutSession[] = bundle.sessions.map((s) => ({
      id: s.id,
      date: s.date,
      splitKey: s.split_key as WorkoutSession["splitKey"],
      splitName: s.split_name,
      startedAt: s.started_at,
      finishedAt: s.finished_at ?? undefined,
      totalVolumeKg: Number(s.total_volume_kg),
      sets: (s.sets as WorkoutSession["sets"]) ?? [],
    }));
    const realPRs: PersonalRecord[] = bundle.prs.map((p) => ({
      exercise: p.exercise,
      weight: Number(p.weight),
      reps: p.reps,
      date: p.date,
      estimatedOneRM: Number(p.estimated_one_rm),
    }));

    const useFallback =
      realWeights.length === 0 &&
      realBFs.length === 0 &&
      realSessions.length === 0 &&
      realPRs.length === 0;

    const weightHistory = useFallback
      ? generateWeightHistory(user.currentWeightKg, 30)
      : realWeights;
    const bfHistory = useFallback
      ? generateBFHistory(user.estimatedBF, 30)
      : realBFs;

    set({
      user,
      weightHistory,
      bfHistory,
      personalRecords: realPRs,
      weekPlan: {
        planned: 4,
        completed: countThisWeek(realSessions),
        sessions: realSessions,
      },
      streak: computeStreak(realSessions),
      lastWorkoutDate: realSessions[0]?.date ?? null,
      hydrated: true,
      syntheticData: useFallback,
    });
  },

  logWeight: async (kg) => {
    const today = new Date().toISOString().slice(0, 10);
    set((s) => {
      const wasSynthetic = s.syntheticData;
      const baseHistory = wasSynthetic ? [] : s.weightHistory;
      const filtered = baseHistory.filter((w) => w.date !== today);
      return {
        weightHistory: [...filtered, { date: today, weight: kg }],
        user: { ...s.user, currentWeightKg: kg },
        syntheticData: false,
      };
    });
    await logWeightAction(kg);
  },

  updateBF: async (bf) => {
    const today = new Date().toISOString().slice(0, 10);
    set((s) => {
      const wasSynthetic = s.syntheticData;
      const baseHistory = wasSynthetic ? [] : s.bfHistory;
      const filtered = baseHistory.filter((e) => e.date !== today);
      return {
        bfHistory: [...filtered, { date: today, bf }],
        user: { ...s.user, estimatedBF: bf },
        syntheticData: false,
      };
    });
    await logBFAction(bf);
  },

  logWorkoutComplete: async (session) => {
    set((s) => {
      const exists = s.weekPlan.sessions.some((x) => x.id === session.id);
      const sessions = exists
        ? s.weekPlan.sessions.map((x) => (x.id === session.id ? session : x))
        : [session, ...s.weekPlan.sessions];
      return {
        weekPlan: {
          ...s.weekPlan,
          completed: Math.min(s.weekPlan.planned, s.weekPlan.completed + (exists ? 0 : 1)),
          sessions,
        },
        streak: computeStreak(sessions),
        lastWorkoutDate: session.date,
      };
    });
    await saveSessionAction(session);
  },

  logPR: async (exercise, weight, reps) => {
    const estimatedOneRM = estimateOneRepMax(weight, reps);
    set((s) => ({
      personalRecords: [
        ...s.personalRecords,
        {
          exercise,
          weight,
          reps,
          date: new Date().toISOString().slice(0, 10),
          estimatedOneRM,
        },
      ],
    }));
    await logPRAction({ exercise, weight, reps, estimatedOneRM });
  },
}));
