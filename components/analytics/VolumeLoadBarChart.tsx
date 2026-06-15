"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useAppStore } from "@/lib/store/useAppStore";
import { useSplitStore, type WeekMap } from "@/lib/store/useSplitStore";
import { EXERCISE_LIBRARY } from "@/lib/data/exerciseLibrary";
import type { MuscleGroup, WorkoutSession } from "@/types/workout";

const TARGET_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Triceps",
  "Biceps",
  "Core",
  "Forearms",
];

interface RowDatum {
  muscle: MuscleGroup;
  volume: number;
}

function emptyAcc(): Record<MuscleGroup, number> {
  return { Chest: 0, Back: 0, Shoulders: 0, Triceps: 0, Biceps: 0, Core: 0, Forearms: 0, Legs: 0 };
}

function attribute(acc: Record<MuscleGroup, number>, primary: MuscleGroup, secondary: MuscleGroup[] | undefined, volume: number) {
  if (secondary && secondary.length > 0) {
    acc[primary] += volume * 0.7;
    secondary.forEach((m) => {
      acc[m] += (volume * 0.3) / secondary.length;
    });
  } else {
    acc[primary] += volume;
  }
}

function volumeFromSessions(sessions: WorkoutSession[], days: WeekMap): RowDatum[] {
  const acc = emptyAcc();
  for (const s of sessions) {
    const logged = (s.sets ?? []).filter(
      (set) => (set.status === "done" || set.status === "pr") && set.weight > 0 && set.reps > 0,
    );
    if (logged.length > 0) {
      // Real logged sets — exact tonnage per movement.
      for (const set of logged) {
        const meta = EXERCISE_LIBRARY[set.exerciseId];
        if (!meta) continue;
        attribute(acc, meta.primary, meta.secondary, set.weight * set.reps);
      }
    } else {
      // No set detail (seed/legacy) — estimate from the planned split.
      const split = days[s.splitKey];
      if (!split) continue;
      const totalSetsBase = split.exercises.reduce((a, e) => a + e.sets, 0) || 1;
      for (const ex of split.exercises) {
        attribute(acc, ex.primary, ex.secondary, (ex.sets / totalSetsBase) * s.totalVolumeKg);
      }
    }
  }
  return TARGET_GROUPS.map((m) => ({ muscle: m, volume: Math.round(acc[m]) })).sort(
    (a, b) => b.volume - a.volume,
  );
}

export function VolumeLoadBarChart() {
  const sessions = useAppStore((s) => s.weekPlan.sessions);
  const days = useSplitStore((s) => s.days);
  const data = useMemo(
    () => volumeFromSessions(sessions.slice(-7), days),
    [sessions, days],
  );
  const max = Math.max(...data.map((d) => d.volume), 1);
  const total = data.reduce((a, b) => a + b.volume, 0);
  const trained = data.filter((d) => d.volume > 0);

  return (
    <Card className="h-full">
      <CardHeader
        eyebrow="last 7 days · volume load"
        action={
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-bg-elevated)]">
            <Layers className="h-4 w-4 text-[var(--color-accent-tertiary)]" />
          </div>
        }
      >
        Volume by Muscle Group
      </CardHeader>
      <CardBody>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="font-display text-2xl font-bold tracking-tight num">
              {(total / 1000).toFixed(1)}
              <span className="ml-1 text-sm text-text-muted">t · tonnage</span>
            </div>
            <div className="mt-1 text-[11px] text-text-muted">
              Across {data.filter((d) => d.volume > 0).length} muscle groups
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            sets × reps × weight
          </div>
        </div>

        <div className="space-y-2.5">
          {data.map((d, idx) => {
            const pct = (d.volume / max) * 100;
            return (
              <div key={d.muscle}>
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em]">
                  <span className="text-text-secondary">{d.muscle}</span>
                  <span className="text-text-muted num">{d.volume.toLocaleString()} kg</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: idx * 0.07, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--color-accent-tertiary), var(--color-accent-primary))",
                      boxShadow: "0 0 12px rgba(255,51,102,0.35)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border-subtle/50 pt-3 font-mono text-[10px] uppercase tracking-[0.14em]">
          <span className="text-text-muted">Top mover: <span className="text-[var(--color-accent-primary)]">{data[0]?.muscle ?? "—"}</span></span>
          <span className="text-text-muted">{trained.length} groups hit this week</span>
        </div>
      </CardBody>
    </Card>
  );
}
