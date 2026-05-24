"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Coffee, Dumbbell, Sparkles, Eye } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ExerciseRow } from "./ExerciseRow";
import { ANAND_SPLITS } from "@/lib/data/workoutSplits";
import { getDayKey } from "@/lib/utils/formatting";
import { useWorkoutStore } from "@/lib/store/useWorkoutStore";
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils/formatting";

const SUGGESTED_WEIGHTS: Record<string, number> = {
  "incline-press": 32.5,
  "pec-deck": 50,
  "cable-crossover": 12.5,
  "overhead-cable-ext": 22.5,
  "skull-crusher": 25,
  "cable-pushdown": 27.5,
  "weighted-pullup": 12.5,
  "seated-cable-row": 65,
  "lat-pulldown": 65,
  "db-curl": 14,
  "preacher-curl": 25,
  "incline-db-curl": 12,
  "seated-ohp": 22.5,
  "lateral-raise-db": 10,
  "lateral-raise-cable": 5,
  "reverse-pec-deck": 35,
  "face-pulls": 22.5,
  "wrist-curl": 12,
  "reverse-wrist-curl": 8,
  "db-flat-press": 25,
  "pullups-bw": 0,
  "lateral-raise-sat": 8,
  "db-curl-sat": 12,
  "cable-pushdown-sat": 22.5,
  "hanging-leg-raise": 0,
};

const OVERLOAD_EXERCISES = new Set(["incline-press", "weighted-pullup", "seated-ohp"]);

const DAY_LABELS: Array<{ key: keyof typeof ANAND_SPLITS; short: string }> = [
  { key: "monday", short: "M" },
  { key: "tuesday", short: "T" },
  { key: "wednesday", short: "W" },
  { key: "thursday", short: "T" },
  { key: "friday", short: "F" },
  { key: "saturday", short: "S" },
  { key: "sunday", short: "S" },
];

export function WorkoutSplitModule() {
  const today = getDayKey();
  const [previewKey, setPreviewKey] = useState<keyof typeof ANAND_SPLITS>(today);
  const isPreview = previewKey !== today;
  const split = ANAND_SPLITS[previewKey];

  const sets = useWorkoutStore((s) => s.sets);
  const sessionStarted = useWorkoutStore((s) => !!s.sessionStartedAt);
  const startSession = useWorkoutStore((s) => s.startSession);
  const finishSession = useWorkoutStore((s) => s.finishSession);
  const logWorkoutComplete = useAppStore((s) => s.logWorkoutComplete);

  const completedExercises = useMemo(() => {
    return Object.entries(sets).filter(([, logs]) =>
      logs.some((l) => l.status === "done" || l.status === "pr"),
    ).length;
  }, [sets]);

  const totalExercises = split.exercises.length;
  const progress = totalExercises === 0 ? 0 : Math.round((completedExercises / totalExercises) * 100);

  return (
    <Card glow={isPreview ? "tertiary" : "primary"}>
      <CardHeader
        eyebrow={isPreview ? `preview · ${previewKey}` : `today · ${split.type}`}
        action={
          !split.isRest && !isPreview ? (
            <div className="flex items-center gap-2">
              <Badge variant="primary" glow>
                <Sparkles className="h-3 w-3" />
                {completedExercises}/{totalExercises}
              </Badge>
              <button
                type="button"
                onClick={() => {
                  if (sessionStarted) {
                    const session = finishSession();
                    logWorkoutComplete(session);
                  } else {
                    startSession();
                  }
                }}
                className="inline-flex h-8 items-center gap-1.5 bg-[var(--color-bone)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-bg-base)] transition hover:opacity-90"
              >
                {sessionStarted ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {sessionStarted ? "finish" : "start"}
              </button>
            </div>
          ) : isPreview ? (
            <Badge variant="tertiary">
              <Eye className="h-3 w-3" />
              preview
            </Badge>
          ) : null
        }
      >
        <span className="inline-flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-[var(--color-bone)]" />
          {split.name}
        </span>
      </CardHeader>

      {/* Day picker chip row */}
      <div className="hairline-bottom flex flex-wrap gap-1 px-5 pb-3">
        {DAY_LABELS.map(({ key, short }) => {
          const s = ANAND_SPLITS[key];
          const isToday = key === today;
          const isActive = key === previewKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setPreviewKey(key)}
              className={cn(
                "group flex min-w-[44px] flex-col items-center gap-0 border px-2 py-1.5 transition",
                isActive
                  ? "border-[var(--color-bone)] bg-[var(--color-bone)] text-[var(--color-bg-base)]"
                  : "border-border-subtle bg-transparent text-text-secondary hover:border-border-strong",
              )}
              title={s.name}
            >
              <span className="font-mono text-[10px] font-bold uppercase">
                {short}
              </span>
              <span
                className={cn(
                  "font-mono text-[8px] uppercase tracking-[0.12em]",
                  isActive ? "text-[var(--color-bg-base)]/60" : "text-text-dim",
                )}
              >
                {s.isRest ? "rest" : s.type.slice(0, 4)}
              </span>
              {isToday && (
                <span
                  className={cn(
                    "mt-0.5 h-0.5 w-3 rounded-full",
                    isActive ? "bg-[var(--color-bg-base)]" : "bg-[var(--color-cream)]",
                  )}
                />
              )}
            </button>
          );
        })}
        {isPreview && (
          <button
            type="button"
            onClick={() => setPreviewKey(today)}
            className="ml-auto inline-flex h-8 items-center gap-1 self-center px-2 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted hover:text-text-primary"
          >
            ← back to today
          </button>
        )}
      </div>

      <CardBody>
        {split.isRest ? (
          <div>
            <div className="flex items-center gap-4 border border-border-subtle bg-[var(--color-bg-elevated)] p-4">
              <div className="grid h-12 w-12 place-items-center border border-border-strong bg-[var(--color-bg-base)]">
                <Coffee className="h-6 w-6 text-[var(--color-cream)]" />
              </div>
              <div>
                <div className="font-display text-lg font-semibold">{split.name}</div>
                <div className="text-[12px] text-text-muted">
                  Recovery is the next rep. Walk 8k. Hit protein. Sleep eight.
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <RestStat label="Sleep" value="8h" />
              <RestStat label="Steps" value="8k" />
              <RestStat label="Protein" value="145g" />
            </div>
          </div>
        ) : (
          <>
            {!isPreview && (
              <div className="mb-3 h-px bg-[var(--color-border-subtle)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-[var(--color-bone)]"
                />
              </div>
            )}

            {isPreview && (
              <div className="mb-3 border border-border-subtle bg-[var(--color-bg-elevated)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                <span className="text-[var(--color-cream)]">preview</span> · logging disabled · come back on {previewKey}
              </div>
            )}

            <div className={cn("space-y-2", isPreview && "pointer-events-none opacity-70")}>
              {split.exercises.map((ex) => (
                <ExerciseRow
                  key={ex.id}
                  exercise={ex}
                  suggestedWeight={SUGGESTED_WEIGHTS[ex.id] ?? 0}
                  showOverload={OVERLOAD_EXERCISES.has(ex.id)}
                />
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function RestStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border-subtle bg-[var(--color-bg-elevated)] p-2.5">
      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-dim">{label}</div>
      <div className="mt-0.5 font-display text-lg font-semibold num">{value}</div>
    </div>
  );
}
