"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SetLog, SetStatus, WorkoutSession } from "@/types/workout";
import type { DayKey } from "@/lib/data/workoutSplits";
import { getDayKey } from "@/lib/utils/formatting";
import { getSplitDays } from "@/lib/store/useSplitStore";

interface WorkoutState {
  todaysSplitKey: DayKey;
  sets: Record<string, SetLog[]>;
  sessionStartedAt: string | null;
  sessionDate: string | null;

  logSet: (exerciseId: string, setIndex: number, reps: number, weight: number, rpe: number) => void;
  markSetStatus: (exerciseId: string, setIndex: number, status: SetStatus) => void;
  startSession: () => void;
  resetSession: () => void;
  finishSession: () => WorkoutSession;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      todaysSplitKey: getDayKey(),
      sets: {},
      sessionStartedAt: null,
      sessionDate: null,

      logSet: (exerciseId, setIndex, reps, weight, rpe) => {
        const log: SetLog = {
          exerciseId,
          setIndex,
          reps,
          weight,
          rpe,
          timestamp: new Date().toISOString(),
          status: "done",
        };
        set((s) => {
          const ex = s.sets[exerciseId] ?? [];
          const filtered = ex.filter((x) => x.setIndex !== setIndex);
          return {
            sets: {
              ...s.sets,
              [exerciseId]: [...filtered, log].sort((a, b) => a.setIndex - b.setIndex),
            },
            sessionStartedAt: s.sessionStartedAt ?? new Date().toISOString(),
            sessionDate: s.sessionDate ?? todayKey(),
          };
        });
      },

      markSetStatus: (exerciseId, setIndex, status) =>
        set((s) => {
          const ex = s.sets[exerciseId] ?? [];
          const existing = ex.find((x) => x.setIndex === setIndex);
          const next: SetLog = existing
            ? { ...existing, status }
            : {
                exerciseId,
                setIndex,
                reps: 0,
                weight: 0,
                rpe: 0,
                timestamp: new Date().toISOString(),
                status,
              };
          const filtered = ex.filter((x) => x.setIndex !== setIndex);
          return {
            sets: {
              ...s.sets,
              [exerciseId]: [...filtered, next].sort((a, b) => a.setIndex - b.setIndex),
            },
          };
        }),

      startSession: () =>
        set((s) => ({
          sessionStartedAt: s.sessionStartedAt ?? new Date().toISOString(),
          sessionDate: s.sessionDate ?? todayKey(),
          todaysSplitKey: getDayKey(),
        })),

      resetSession: () => set({ sets: {}, sessionStartedAt: null, sessionDate: null }),

      finishSession: () => {
        const s = get();
        const key = s.todaysSplitKey;
        const split = getSplitDays()[key];
        const allSets = Object.values(s.sets).flat();
        const volume = allSets.reduce((acc, log) => acc + log.weight * log.reps, 0);
        const session: WorkoutSession = {
          id: `live-${Date.now()}`,
          date: s.sessionDate ?? todayKey(),
          splitKey: key,
          splitName: split.name,
          startedAt: s.sessionStartedAt ?? new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          sets: allSets,
          totalVolumeKg: Math.round(volume),
        };
        set({ sets: {}, sessionStartedAt: null, sessionDate: null });
        return session;
      },
    }),
    { name: "anand-workout-active" },
  ),
);
