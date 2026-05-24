"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ChevronRight, Settings2 } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { getPhase } from "@/lib/data/phases";
import { weeksHorizonForPhase, calculateTDEE } from "@/lib/calculations/tdee";

export function PhaseCard() {
  const user = useAppStore((s) => s.user);
  const phase = getPhase(user.phase);
  const horizon = weeksHorizonForPhase(user);
  const tdee = calculateTDEE(user);
  const targetCals = Math.round(tdee * phase.caloricMultiplier);
  const delta = targetCals - tdee;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border border-border-subtle bg-[var(--color-bg-surface)]"
    >
      <div className="absolute inset-y-0 left-0 w-[2px] bg-[var(--color-cream)] opacity-50" />
      <div className="grid gap-0 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
        {/* Phase identity */}
        <div className="border-b border-border-subtle px-5 py-4 sm:border-b-0 sm:border-r">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted">
            <Activity className="h-3 w-3 text-[var(--color-cream)]" />
            active phase
          </div>
          <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight">
            {phase.label}
          </h3>
          <p className="mt-1 serif text-[14px] italic text-text-secondary">
            &ldquo;{phase.philosophy}&rdquo;
          </p>
        </div>

        {/* Caloric stance */}
        <Stat
          label="kcal / day"
          value={`${targetCals}`}
          hint={`${delta >= 0 ? "+" : ""}${delta} vs TDEE`}
        />
        {/* Weekly target */}
        <Stat
          label="weekly change"
          value={`${phase.weeklyWeightChangeKg >= 0 ? "+" : ""}${phase.weeklyWeightChangeKg.toFixed(2)}kg`}
          hint={`RPE ${phase.rpeBand[0]}–${phase.rpeBand[1]}`}
        />

        {/* Switch link */}
        <div className="flex items-center justify-end border-t border-border-subtle px-5 py-3 sm:border-l sm:border-t-0">
          <Link
            href="/dashboard/settings"
            className="inline-flex h-9 items-center gap-1.5 border border-border-strong bg-[var(--color-bg-elevated)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary transition hover:border-[var(--color-bone)] hover:text-[var(--color-bone)]"
          >
            <Settings2 className="h-3 w-3" />
            switch
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Footer ticker */}
      <div className="border-t border-border-subtle bg-[var(--color-bg-base)]/40 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
        <span className="text-[var(--color-cream)]">priority</span> · {phase.priority}
        <span className="mx-3 opacity-40">/</span>
        <span className="text-[var(--color-cream)]">horizon</span> · {horizon.weeks > 0 ? `${horizon.weeks}w ${horizon.label}` : horizon.label}
        <span className="mx-3 opacity-40">/</span>
        <span className="text-[var(--color-cream)]">cardio</span> · {phase.cardioPerWeek}× / wk
      </div>
    </motion.div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="border-b border-border-subtle px-5 py-4 sm:border-b-0 sm:border-r">
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</div>
      <div className="mt-1 font-display text-2xl font-extrabold tracking-tight num">{value}</div>
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">{hint}</div>
    </div>
  );
}
