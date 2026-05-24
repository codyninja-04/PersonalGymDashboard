"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Clock, Skull, Loader2 } from "lucide-react";
import type { Exercise, SetLog, SetStatus } from "@/types/workout";
import { Badge } from "@/components/ui/Badge";
import { ProgressiveOverloadBadge } from "./ProgressiveOverloadBadge";
import { ExerciseSwapButton } from "./ExerciseSwapButton";
import { useWorkoutStore } from "@/lib/store/useWorkoutStore";
import { cn } from "@/lib/utils/formatting";

interface ExerciseRowProps {
  exercise: Exercise;
  suggestedWeight?: number;
  showOverload?: boolean;
}

// Module-level constant so the selector returns a stable reference
const EMPTY_SETS: SetLog[] = [];

export function ExerciseRow({ exercise, suggestedWeight = 0, showOverload = false }: ExerciseRowProps) {
  const [expanded, setExpanded] = useState(false);
  // Stable reference: select the map, then index into it. Never returns a fresh array.
  const setsMap = useWorkoutStore((s) => s.sets);
  const sets = setsMap[exercise.id] ?? EMPTY_SETS;
  const logSet = useWorkoutStore((s) => s.logSet);
  const markSetStatus = useWorkoutStore((s) => s.markSetStatus);

  const status: SetStatus = (() => {
    if (sets.length === 0) return "pending";
    const done = sets.filter((s) => s.status === "done" || s.status === "pr").length;
    if (done >= exercise.sets) {
      return sets.some((s) => s.status === "pr") ? "pr" : "done";
    }
    return "in-progress";
  })();

  const statusBadge =
    status === "done" ? (
      <Badge variant="secondary"><Check className="h-3 w-3" /> done</Badge>
    ) : status === "pr" ? (
      <Badge variant="primary" glow><Skull className="h-3 w-3" /> PR</Badge>
    ) : status === "in-progress" ? (
      <Badge variant="amber"><Loader2 className="h-3 w-3 animate-spin" /> live</Badge>
    ) : (
      <Badge variant="muted">pending</Badge>
    );

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.22 } }}
      className={cn(
        "group border bg-[var(--color-bg-elevated)]/50 transition-all",
        status === "done" || status === "pr"
          ? "border-[var(--color-cream)]/30"
          : "border-border-subtle hover:border-border-strong",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((s) => !s)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate font-display text-[13px] font-semibold tracking-tight text-text-primary">
              {exercise.name}
            </span>
            {showOverload && <ProgressiveOverloadBadge />}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            <span>{exercise.sets} × {exercise.repRange[0]}-{exercise.repRange[1]}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" /> {exercise.restSec}s
            </span>
            {suggestedWeight > 0 && (
              <span className="text-[var(--color-cream)]">target {suggestedWeight}kg</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {statusBadge}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-text-muted transition-transform",
              expanded && "rotate-180",
            )}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border-subtle px-4 py-4">
              <div className="mb-3 flex items-center justify-end">
                <ExerciseSwapButton
                  exerciseName={exercise.name}
                  primaryMuscle={exercise.primary}
                />
              </div>
              <div className="mb-2 hidden grid-cols-[32px_1fr_1fr_1fr_84px] gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim sm:grid">
                <span>#</span>
                <span>weight kg</span>
                <span>reps</span>
                <span>rpe</span>
                <span className="text-right">action</span>
              </div>
              <div className="space-y-2">
                {Array.from({ length: exercise.sets }).map((_, i) => (
                  <SetInput
                    key={i}
                    exerciseId={exercise.id}
                    setIndex={i}
                    existing={sets.find((s) => s.setIndex === i)}
                    suggestedWeight={suggestedWeight}
                    repTarget={exercise.repRange[1]}
                    onLog={logSet}
                    onMark={markSetStatus}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SetInput({
  exerciseId,
  setIndex,
  existing,
  suggestedWeight,
  repTarget,
  onLog,
  onMark,
}: {
  exerciseId: string;
  setIndex: number;
  existing?: SetLog;
  suggestedWeight: number;
  repTarget: number;
  onLog: (id: string, idx: number, reps: number, weight: number, rpe: number) => void;
  onMark: (id: string, idx: number, status: SetStatus) => void;
}) {
  const [weight, setWeight] = useState(existing?.weight?.toString() ?? (suggestedWeight ? String(suggestedWeight) : ""));
  const [reps, setReps] = useState(existing?.reps?.toString() ?? "");
  const [rpe, setRpe] = useState(existing?.rpe?.toString() ?? "");
  const isDone = existing?.status === "done" || existing?.status === "pr";

  function commit() {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 0;
    const p = parseFloat(rpe) || 8;
    if (w === 0 || r === 0) return;
    onLog(exerciseId, setIndex, r, w, p);
    if (r >= repTarget) onMark(exerciseId, setIndex, "pr");
  }

  return (
    <div className="grid grid-cols-[28px_1fr_1fr_1fr_84px] items-center gap-2">
      <span className="font-mono text-[12px] font-semibold text-text-secondary">{setIndex + 1}</span>
      <input
        inputMode="decimal"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        placeholder={suggestedWeight ? `${suggestedWeight}` : "kg"}
        className="h-10 border border-border bg-[var(--color-bg-base)] px-2.5 font-mono text-[13px] text-text-primary outline-none transition placeholder:text-text-dim focus:border-[var(--color-bone)] focus:ring-1 focus:ring-[var(--color-bone)]/30"
      />
      <input
        inputMode="numeric"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        placeholder={`${repTarget}`}
        className="h-10 border border-border bg-[var(--color-bg-base)] px-2.5 font-mono text-[13px] text-text-primary outline-none transition placeholder:text-text-dim focus:border-[var(--color-cream)] focus:ring-1 focus:ring-[var(--color-cream)]/30"
      />
      <input
        inputMode="decimal"
        value={rpe}
        onChange={(e) => setRpe(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        placeholder="8"
        className="h-10 border border-border bg-[var(--color-bg-base)] px-2.5 font-mono text-[13px] text-text-primary outline-none transition placeholder:text-text-dim focus:border-[var(--color-chrome)] focus:ring-1 focus:ring-[var(--color-chrome)]/30"
      />
      <button
        type="button"
        onClick={commit}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition",
          isDone
            ? "border border-[var(--color-cream)]/40 bg-[var(--color-cream)]/10 text-[var(--color-cream)]"
            : "bg-[var(--color-bone)] text-[var(--color-bg-base)] hover:opacity-90",
        )}
      >
        {isDone ? <><Check className="h-3.5 w-3.5" /> done</> : "log set"}
      </button>
    </div>
  );
}
