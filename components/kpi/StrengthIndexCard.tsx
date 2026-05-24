"use client";

import { Dumbbell, TrendingUp } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/ui/Sparkline";
import { useAppStore } from "@/lib/store/useAppStore";
import { useBodyMetrics } from "@/hooks/useBodyMetrics";

const SPARK_LABELS = ["Bench", "Pulldown", "OHP"];

export function StrengthIndexCard() {
  const prs = useAppStore((s) => s.personalRecords);
  const { strength, percentile } = useBodyMetrics();
  const recentPR = prs.at(-1);

  // Build a synthetic 30-day index trend
  const trend = Array.from({ length: 20 }, (_, i) => {
    const base = strength.totalKg - 18;
    return Math.round(base + (i / 19) * 18 + Math.sin(i * 0.9) * 2);
  });

  return (
    <Card glow="tertiary">
      <CardHeader
        eyebrow="strength index"
        action={
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-bg-elevated)]">
            <Dumbbell className="h-4 w-4 text-[var(--color-accent-tertiary)]" />
          </div>
        }
      >
        SI · Aggregate 1RM
      </CardHeader>
      <CardBody>
        <div className="flex items-end justify-between">
          <div>
            <div className="font-display text-[40px] font-bold leading-none tracking-tight num">
              {strength.totalKg.toFixed(0)}
              <span className="ml-1 text-base font-medium text-text-muted">kg</span>
            </div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge variant="tertiary">
                <TrendingUp className="h-3 w-3" />
                {strength.relativeToBodyweight.toFixed(2)}× BW
              </Badge>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                {percentile}
              </span>
            </div>
          </div>
          <Sparkline
            data={trend}
            width={120}
            height={48}
            stroke="var(--color-accent-tertiary)"
            fill="var(--color-accent-tertiary)"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border-subtle/50 pt-3">
          {strength.perExercise.map((kg, i) => (
            <div key={SPARK_LABELS[i]}>
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-dim">
                {SPARK_LABELS[i]}
              </div>
              <div className="mt-0.5 font-mono text-[12px] font-semibold num text-text-primary">
                {kg.toFixed(1)} kg
              </div>
            </div>
          ))}
        </div>

        {recentPR && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-accent-tertiary-soft)] px-3 py-2 ring-1 ring-inset ring-[var(--color-accent-tertiary)]/30">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-accent-tertiary)]">
              latest pr
            </span>
            <span className="truncate text-[11px] text-text-secondary">
              {recentPR.exercise} · {recentPR.weight}kg × {recentPR.reps}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
