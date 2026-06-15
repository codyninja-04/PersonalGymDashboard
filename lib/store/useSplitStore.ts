"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Exercise, WorkoutDay } from "@/types/workout";
import {
  ANAND_SPLITS,
  DAY_KEYS,
  gymDaysOf,
  type DayKey,
} from "@/lib/data/workoutSplits";
import { EXERCISE_LIBRARY } from "@/lib/data/exerciseLibrary";
import { getTemplate } from "@/lib/data/splitTemplates";
import { saveSplitAction } from "@/app/actions/split";

type WeekMap = Record<DayKey, WorkoutDay>;

// Debounced push to Supabase so the split follows the user across devices.
let pushTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePush(days: WeekMap, templateId: string) {
  if (typeof window === "undefined") return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void saveSplitAction({ days, template_id: templateId }).catch(() => {});
  }, 800);
}

function clone(days: WeekMap): WeekMap {
  return JSON.parse(JSON.stringify(days)) as WeekMap;
}

function makeExercise(id: string): Exercise | null {
  const meta = EXERCISE_LIBRARY[id];
  if (!meta) return null;
  return {
    id: meta.id,
    name: meta.name,
    sets: 3,
    repRange: [8, 12],
    restSec: 90,
    primary: meta.primary,
    secondary: meta.secondary,
  };
}

interface SplitState {
  days: WeekMap;
  templateId: string; // active template id, or "custom" once edited
  hydrated: boolean;

  applyTemplate: (id: string) => void;
  resetToDefault: () => void;
  hydrateFromServer: (days: WeekMap, templateId: string) => void;
  renameDay: (key: DayKey, name: string) => void;
  setDayType: (key: DayKey, type: WorkoutDay["type"]) => void;
  toggleRest: (key: DayKey) => void;
  addExercise: (key: DayKey, exerciseId: string) => void;
  removeExercise: (key: DayKey, index: number) => void;
  moveExercise: (key: DayKey, index: number, dir: -1 | 1) => void;
  setExerciseSets: (key: DayKey, index: number, sets: number) => void;
  setExerciseReps: (key: DayKey, index: number, reps: [number, number]) => void;
}

function markCustom(set: (partial: Partial<SplitState>) => void, days: WeekMap) {
  set({ days, templateId: "custom" });
  schedulePush(days, "custom");
}

export const useSplitStore = create<SplitState>()(
  persist(
    (set, get) => ({
      days: clone(ANAND_SPLITS),
      templateId: "carve",
      hydrated: false,

      applyTemplate: (id) => {
        const template = getTemplate(id);
        if (!template) return;
        const days = clone(template.days);
        set({ days, templateId: id });
        schedulePush(days, id);
      },

      resetToDefault: () => {
        const days = clone(ANAND_SPLITS);
        set({ days, templateId: "carve" });
        schedulePush(days, "carve");
      },

      // Server is the source of truth on load — apply it without echoing a push.
      hydrateFromServer: (days, templateId) => set({ days, templateId }),

      renameDay: (key, name) => {
        const days = clone(get().days);
        days[key].name = name;
        markCustom(set, days);
      },

      setDayType: (key, type) => {
        const days = clone(get().days);
        days[key].type = type;
        markCustom(set, days);
      },

      toggleRest: (key) => {
        const days = clone(get().days);
        const day = days[key];
        if (day.isRest) {
          day.isRest = false;
          day.type = "Full Body";
          if (day.name.toLowerCase().includes("rest")) day.name = "Training Day";
        } else {
          day.isRest = true;
          day.type = "Rest";
          day.name = "Rest / Recovery";
          day.exercises = [];
        }
        markCustom(set, days);
      },

      addExercise: (key, exerciseId) => {
        const exercise = makeExercise(exerciseId);
        if (!exercise) return;
        const days = clone(get().days);
        const day = days[key];
        if (day.isRest) {
          day.isRest = false;
          day.type = "Full Body";
          if (day.name.toLowerCase().includes("rest")) day.name = "Training Day";
        }
        day.exercises.push(exercise);
        markCustom(set, days);
      },

      removeExercise: (key, index) => {
        const days = clone(get().days);
        days[key].exercises.splice(index, 1);
        markCustom(set, days);
      },

      moveExercise: (key, index, dir) => {
        const days = clone(get().days);
        const list = days[key].exercises;
        const target = index + dir;
        if (target < 0 || target >= list.length) return;
        [list[index], list[target]] = [list[target], list[index]];
        markCustom(set, days);
      },

      setExerciseSets: (key, index, sets) => {
        const days = clone(get().days);
        const ex = days[key].exercises[index];
        if (!ex) return;
        ex.sets = Math.max(1, Math.min(10, Math.round(sets)));
        markCustom(set, days);
      },

      setExerciseReps: (key, index, reps) => {
        const days = clone(get().days);
        const ex = days[key].exercises[index];
        if (!ex) return;
        ex.repRange = reps;
        markCustom(set, days);
      },
    }),
    {
      name: "forge-split-v1",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

/** Non-reactive read of the active week (for use inside other stores). */
export function getSplitDays(): WeekMap {
  return useSplitStore.getState().days;
}

/** Non-reactive read of the active training-day keys. */
export function getActiveGymDays(): DayKey[] {
  return gymDaysOf(useSplitStore.getState().days);
}

export { DAY_KEYS };
export type { DayKey, WeekMap };
