"use client";

import { PlayCircle } from "lucide-react";
import { useTutorialStore } from "@/lib/store/useTutorialStore";

export function TutorialReplayButton() {
  const start = useTutorialStore((s) => s.start);
  return (
    <button
      type="button"
      onClick={start}
      className="inline-flex h-10 items-center gap-2 bg-[var(--color-bone)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] transition hover:opacity-90"
    >
      <PlayCircle className="h-3.5 w-3.5" />
      Replay walkthrough
    </button>
  );
}
