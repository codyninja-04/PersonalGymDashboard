"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/layout/TopBar";
import { WeightLeanMassChart } from "@/components/analytics/WeightLeanMassChart";
import { VolumeLoadBarChart } from "@/components/analytics/VolumeLoadBarChart";
import { StrengthCurveChart } from "@/components/analytics/StrengthCurveChart";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useAppStore } from "@/lib/store/useAppStore";
import { useBodyMetrics } from "@/hooks/useBodyMetrics";
import { Badge } from "@/components/ui/Badge";

export default function AnalyticsPage() {
  const user = useAppStore((s) => s.user);
  const bfHistory = useAppStore((s) => s.bfHistory);
  const { tdee, weeksLeft, leanMassDelta, monthDelta } = useBodyMetrics();

  const bfStart = bfHistory[0]?.bf ?? user.estimatedBF;
  const bfNow = bfHistory.at(-1)?.bf ?? user.estimatedBF;
  const bfDrop = bfStart - bfNow;
  const bfSeries = useMemo(() => bfHistory.map((b, i) => ({ x: i, bf: b.bf * 100 })), [bfHistory]);
  void bfSeries;

  return (
    <div className="space-y-6">
      <TopBar />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[22px] border border-border-strong bg-gradient-to-br from-[#11111c] to-[#0a0a14] p-6"
      >
        <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-[var(--color-accent-tertiary)] opacity-20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-accent-tertiary)]">
              gains analytics · 30d
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            The numbers don't lie.
          </h1>
          <p className="mt-2 max-w-xl text-[13px] text-text-secondary">
            Composition, volume, and strength — cross-referenced against your aesthetic cut target.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <BigStat label="Weight Δ 30d" value={`${monthDelta >= 0 ? "+" : ""}${monthDelta}`} unit="kg" accent="var(--color-accent-primary)" />
        <BigStat label="Lean Mass Δ" value={`${leanMassDelta >= 0 ? "+" : ""}${leanMassDelta}`} unit="kg" accent="var(--color-accent-secondary)" />
        <BigStat label="BF Drop" value={`-${(bfDrop * 100).toFixed(2)}`} unit="%" accent="var(--color-accent-tertiary)" />
        <BigStat label="TDEE" value={`${tdee}`} unit="kcal" accent="var(--color-accent-amber)" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <WeightLeanMassChart />
        </div>
        <VolumeLoadBarChart />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <StrengthCurveChart />
        <Card className="xl:col-span-2">
          <CardHeader
            eyebrow="cut horizon"
            action={<Badge variant="primary" glow>{weeksLeft}w · {(user.targetBF * 100).toFixed(0)}% target</Badge>}
          >
            Projected Trajectory
          </CardHeader>
          <CardBody>
            <p className="text-[13px] leading-relaxed text-text-secondary">
              At a sustained <span className="text-text-primary font-semibold">0.4 kg/week</span> deficit, you reach
              <span className="text-[var(--color-accent-primary)] font-semibold"> {(user.targetBF * 100).toFixed(0)}% body fat</span> in approximately
              <span className="text-[var(--color-accent-secondary)] font-semibold"> {weeksLeft} weeks</span> while preserving lean tissue.
              Hold protein at 145g and walk 8k+ daily.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border-subtle/50 pt-4">
              <Milestone label="Now" bf={(bfNow * 100).toFixed(1)} accent="var(--color-text-muted)" />
              <Milestone label="Mid-cycle" bf={((bfNow + user.targetBF) / 2 * 100).toFixed(1)} accent="var(--color-accent-tertiary)" />
              <Milestone label="Target" bf={(user.targetBF * 100).toFixed(0)} accent="var(--color-accent-primary)" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function BigStat({ label, value, unit, accent }: { label: string; value: string; unit: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-[var(--color-bg-surface)] px-4 py-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-2xl font-bold num" style={{ color: accent }}>{value}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">{unit}</span>
      </div>
    </div>
  );
}

function Milestone({ label, bf, accent }: { label: string; bf: string; accent: string }) {
  return (
    <div className="rounded-lg border border-border-subtle/60 bg-[var(--color-bg-elevated)] p-3 text-center">
      <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">{label}</div>
      <div className="mt-1 font-display text-xl font-bold num" style={{ color: accent }}>{bf}%</div>
    </div>
  );
}
