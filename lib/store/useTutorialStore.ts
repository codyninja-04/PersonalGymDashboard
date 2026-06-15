"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TutorialState {
  seen: boolean;
  open: boolean;
  hydrated: boolean;
  start: () => void;
  finish: () => void;
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set) => ({
      seen: false,
      open: false,
      hydrated: false,
      start: () => set({ open: true }),
      finish: () => set({ open: false, seen: true }),
    }),
    {
      name: "forge-tutorial-v1",
      partialize: (s) => ({ seen: s.seen }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
