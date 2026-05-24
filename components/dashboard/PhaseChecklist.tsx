"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store/useAppStore";
import { getPhase } from "@/lib/data/phases";

interface ChecklistState {
  phase: string;
  startedAt: string;
  dismissed: boolean;
  done: Record<string, boolean>;
}

const KEY = "forge-phase-checklist";

const ITEMS: Array<{ id: string; label: string; href: string }> = [
  { id: "baseline-weight", label: "Log baseline weight", href: "/dashboard" },
  { id: "baseline-measure", label: "Log waist + chest measurements", href: "/dashboard/body" },
  { id: "baseline-photo", label: "Take front + side progress photo", href: "/dashboard/body" },
  { id: "step-target", label: "Adjust daily step target for new phase", href: "/dashboard" },
];

export function PhaseChecklist() {
  const userPhase = useAppStore((s) => s.user.phase);
  const phase = getPhase(userPhase);
  const [state, setState] = useState<ChecklistState | null>(null);

  // Initialize / detect phase change
  useEffect(() => {
    let stored: ChecklistState | null = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {}

    if (!stored || stored.phase !== userPhase) {
      const fresh: ChecklistState = {
        phase: userPhase,
        startedAt: new Date().toISOString(),
        dismissed: false,
        done: {},
      };
      setState(fresh);
      try {
        localStorage.setItem(KEY, JSON.stringify(fresh));
      } catch {}
      return;
    }
    setState(stored);
  }, [userPhase]);

  function toggle(id: string) {
    if (!state) return;
    const next: ChecklistState = {
      ...state,
      done: { ...state.done, [id]: !state.done[id] },
    };
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  function dismiss() {
    if (!state) return;
    const next = { ...state, dismissed: true };
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  if (!state || state.dismissed) return null;

  const doneCount = ITEMS.filter((i) => state.done[i.id]).length;
  if (doneCount >= ITEMS.length) return null;

  // Auto-hide after 4 days
  const daysSince = (Date.now() - new Date(state.startedAt).getTime()) / 86400_000;
  if (daysSince > 4) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="relative overflow-hidden border border-[var(--color-cream)]/40 bg-[var(--color-bg-surface)]"
      >
        <div className="absolute inset-y-0 left-0 w-[2px] bg-[var(--color-cream)]" />
        <div className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-cream)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted">
                phase switched · onboard the new cycle
              </span>
            </div>
            <button
              onClick={dismiss}
              className="text-text-muted hover:text-text-primary"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome to <span className="text-[var(--color-cream)]">{phase.label}</span>.
          </h3>
          <p className="mt-1 text-[13px] text-text-secondary">
            Lock in a baseline today so progress can be measured against it. Four quick tasks.
          </p>

          <div className="mt-4 space-y-2">
            {ITEMS.map((item, i) => {
              const done = state.done[item.id];
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 border px-3 py-2 transition ${
                    done
                      ? "border-[var(--color-cream)]/40 bg-[var(--color-cream)]/5"
                      : "border-border-subtle bg-[var(--color-bg-elevated)]"
                  }`}
                >
                  <button
                    onClick={() => toggle(item.id)}
                    className={`grid h-5 w-5 flex-shrink-0 place-items-center border transition ${
                      done
                        ? "border-[var(--color-bone)] bg-[var(--color-bone)] text-[var(--color-bg-base)]"
                        : "border-border-strong hover:border-[var(--color-bone)]"
                    }`}
                    aria-label={done ? "Unmark" : "Mark complete"}
                  >
                    {done && <Check className="h-3 w-3" strokeWidth={3} />}
                  </button>
                  <span
                    className={`flex-1 text-[12px] sm:text-[13px] ${
                      done ? "text-text-muted line-through" : "text-text-primary"
                    }`}
                  >
                    <span className="mr-2 font-mono text-[10px] text-text-dim">0{i + 1}</span>
                    {item.label}
                  </span>
                  <Link
                    href={item.href}
                    className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted hover:text-[var(--color-bone)]"
                  >
                    go <ChevronRight className="inline h-2.5 w-2.5" />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
            <span>
              {doneCount}/{ITEMS.length} complete · auto-hides in {Math.max(0, Math.ceil(4 - daysSince))}d
            </span>
            <span className="text-[var(--color-cream)]">{phase.philosophy}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
