"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { getPhase } from "@/lib/data/phases";
import { markDeloadAction } from "@/app/actions/lifestyle";

interface Props {
  lastDeloadAt: string | null;
  phaseStartedAt: string | null;
}

export function DeloadBanner({ lastDeloadAt, phaseStartedAt }: Props) {
  const userPhase = useAppStore((s) => s.user.phase);
  const phase = getPhase(userPhase);
  const [pending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);

  if (phase.deloadEveryWeeks === 0 || dismissed) return null;

  const reference = lastDeloadAt ?? phaseStartedAt ?? new Date().toISOString();
  const weeksSince = (Date.now() - new Date(reference).getTime()) / (7 * 86400_000);
  if (weeksSince < phase.deloadEveryWeeks) return null;

  function takeIt() {
    startTransition(async () => {
      await markDeloadAction();
      setDismissed(true);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border border-[var(--color-blood)]/40 bg-[var(--color-bg-surface)]"
    >
      <div className="absolute inset-y-0 left-0 w-[2px] bg-[var(--color-blood)]" />
      <div className="relative grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:p-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--color-blood)]">
            <AlertCircle className="h-3.5 w-3.5" />
            deload window
          </div>
          <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight">
            {Math.floor(weeksSince)} weeks since last deload.
          </h3>
          <p className="mt-1 text-[12px] text-text-secondary">
            Drop volume ~40% this week. Hold weights, drop sets. CNS reset → next block is sharper.
          </p>
        </div>
        <div className="flex items-end sm:items-center">
          <button
            onClick={takeIt}
            disabled={pending}
            className="inline-flex h-10 items-center gap-1.5 bg-[var(--color-bone)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-bg-base)] hover:opacity-90 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            taking it
          </button>
        </div>
      </div>
    </motion.div>
  );
}
