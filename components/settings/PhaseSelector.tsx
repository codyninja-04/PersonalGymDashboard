"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ChevronRight,
  Loader2,
  Minus,
  Scale,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { PHASE_KEYS, PHASES, phaseToGoal, type PhaseKey } from "@/lib/data/phases";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/lib/store/useAppStore";
import { updateProfileAction } from "@/app/actions/profile";
import { computeMacros } from "@/lib/calculations/macros";
import { cn } from "@/lib/utils/formatting";

const STANCE_ICON: Record<string, LucideIcon> = {
  deficit: TrendingDown,
  surplus: TrendingUp,
  neutral: Minus,
};

export function PhaseSelector() {
  const user = useAppStore((s) => s.user);
  const hydrate = useAppStore((s) => s.hydrate);
  const [selected, setSelected] = useState<PhaseKey>(user.phase as PhaseKey);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const phase = PHASES[selected];
  const macros = computeMacros(user, selected);

  function commit() {
    startTransition(async () => {
      const goal = phaseToGoal(selected);
      await updateProfileAction({
        phase: selected,
        goal,
        onboarded: true,
      });
      // Optimistic local update
      hydrate({
        profile: {
          id: "local",
          name: user.name,
          age: user.age,
          gender: user.gender,
          height_cm: user.heightCm,
          current_weight_kg: user.currentWeightKg,
          estimated_bf: user.estimatedBF,
          goal,
          phase: selected,
          target_bf: user.targetBF,
          onboarded: true,
          created_at: "",
          updated_at: new Date().toISOString(),
        },
        weights: [],
        bfs: [],
        prs: [],
        sessions: [],
        todayFuel: null,
        recentFuel: [],
        measurements: [],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    });
  }

  return (
    <Card>
      <CardHeader
        eyebrow="phase · cycle config"
        action={
          <button
            onClick={commit}
            disabled={pending || selected === user.phase}
            className="inline-flex h-9 items-center gap-1.5 bg-[var(--color-bone)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-bg-base)] transition hover:opacity-90 disabled:opacity-40"
          >
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : selected === user.phase ? (
              saved ? "saved" : "active"
            ) : (
              <>commit phase <ChevronRight className="h-3 w-3" /></>
            )}
          </button>
        }
      >
        <span className="inline-flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-[var(--color-cream)]" />
          Choose your phase
        </span>
      </CardHeader>
      <CardBody>
        <p className="mb-4 text-[13px] text-text-secondary">
          Phase rewrites every macro target, training intensity, and projection. Switch when you finish a cycle, not when you get bored.
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PHASE_KEYS.map((key) => {
            const p = PHASES[key];
            const isActive = key === user.phase;
            const isSelected = key === selected;
            const Icon = STANCE_ICON[p.stance];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={cn(
                  "group relative flex flex-col gap-2 border p-3 text-left transition",
                  isSelected
                    ? "border-[var(--color-bone)] bg-[var(--color-bg-elevated)]"
                    : "border-border-subtle bg-[var(--color-bg-elevated)]/40 hover:border-border-strong",
                )}
              >
                {isActive && (
                  <span className="absolute right-2 top-2 font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[var(--color-cream)]">
                    active
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center border",
                      isSelected
                        ? "border-[var(--color-bone)] bg-[var(--color-bone)] text-[var(--color-bg-base)]"
                        : "border-border bg-[var(--color-bg-base)] text-text-secondary",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-display text-[14px] font-bold tracking-tight">{p.label}</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                      {p.stance} · {(p.caloricMultiplier * 100 - 100 >= 0 ? "+" : "")}{Math.round((p.caloricMultiplier - 1) * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-[11px] leading-snug text-text-secondary">{p.tagline}</p>
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">
                  <span>
                    {p.weeklyWeightChangeKg >= 0 ? "+" : ""}
                    {p.weeklyWeightChangeKg.toFixed(2)}kg / wk
                  </span>
                  <span>·</span>
                  <span>RPE {p.rpeBand[0]}-{p.rpeBand[1]}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="mt-5 border border-border-strong bg-[var(--color-bg-base)] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted">
                preview · {phase.label}
              </div>
              <h3 className="font-display text-xl font-extrabold tracking-tight mt-1">
                {phase.philosophy}
              </h3>
            </div>
            <Badge variant={phase.stance === "deficit" ? "primary" : phase.stance === "surplus" ? "secondary" : "tertiary"} glow>
              <Scale className="h-3 w-3" /> {phase.stance}
            </Badge>
          </div>

          <p className="mt-3 text-[13px] text-text-secondary">{phase.description}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Gym day kcal" value={`${macros.gym.calories}`} />
            <Stat label="Rest day kcal" value={`${macros.rest.calories}`} />
            <Stat label="Protein" value={`${macros.gym.protein}g`} />
            <Stat label="Cardio / wk" value={`${phase.cardioPerWeek}×`} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailRow label="Priority" value={phase.priority} />
            <DetailRow label="Cycle length" value={phase.typicalDurationWeeks === 999 ? "ongoing" : `~${phase.typicalDurationWeeks} weeks`} />
            <DetailRow label="Rep bias" value={phase.repBias} />
            <DetailRow label="Deload" value={phase.deloadEveryWeeks ? `every ${phase.deloadEveryWeeks} weeks` : "as needed"} />
          </div>

          <div className="mt-4 border-t border-border-subtle pt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            watch out — <span className="text-[var(--color-cream)]">{phase.watchOut}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border-subtle bg-[var(--color-bg-elevated)] p-2.5">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">{label}</div>
      <div className="mt-0.5 font-display text-lg font-extrabold num">{value}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle/40 pb-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">{label}</span>
      <span className="text-[12px] font-semibold text-text-primary capitalize">{value}</span>
    </div>
  );
}
