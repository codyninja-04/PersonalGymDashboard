"use client";

import { create } from "zustand";

interface RestTimerState {
  active: boolean;
  exerciseName: string;
  totalSec: number;
  endsAt: number | null;
  start: (sec: number, name: string) => void;
  addTime: (delta: number) => void;
  stop: () => void;
}

export const useRestTimerStore = create<RestTimerState>()((set) => ({
  active: false,
  exerciseName: "",
  totalSec: 0,
  endsAt: null,
  start: (sec, name) => {
    if (sec <= 0) return;
    set({ active: true, exerciseName: name, totalSec: sec, endsAt: Date.now() + sec * 1000 });
  },
  addTime: (delta) =>
    set((s) =>
      s.endsAt
        ? { endsAt: s.endsAt + delta * 1000, totalSec: Math.max(0, s.totalSec + delta) }
        : s,
    ),
  stop: () => set({ active: false, endsAt: null }),
}));
