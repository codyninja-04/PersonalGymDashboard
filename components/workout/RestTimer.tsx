"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Timer, Check } from "lucide-react";
import { useRestTimerStore } from "@/lib/store/useRestTimerStore";

export function RestTimer() {
  const active = useRestTimerStore((s) => s.active);
  const exerciseName = useRestTimerStore((s) => s.exerciseName);
  const totalSec = useRestTimerStore((s) => s.totalSec);
  const endsAt = useRestTimerStore((s) => s.endsAt);
  const addTime = useRestTimerStore((s) => s.addTime);
  const stop = useRestTimerStore((s) => s.stop);

  const [now, setNow] = useState(() => Date.now());
  const buzzedFor = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [active]);

  const remainingMs = endsAt ? Math.max(0, endsAt - now) : 0;
  const remaining = Math.ceil(remainingMs / 1000);
  const done = active && remaining <= 0;

  // Buzz once and auto-dismiss when the rest finishes.
  useEffect(() => {
    if (!done || !endsAt) return;
    if (buzzedFor.current !== endsAt) {
      buzzedFor.current = endsAt;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([120, 60, 120]);
      }
    }
    const id = setTimeout(stop, 2200);
    return () => clearTimeout(id);
  }, [done, endsAt, stop]);

  const pct = totalSec > 0 ? Math.min(1, remaining / totalSec) : 0;
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const label = `${mm}:${String(ss).padStart(2, "0")}`;

  const R = 16;
  const C = 2 * Math.PI * R;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 lg:bottom-6"
        >
          <div
            className={
              "flex items-center gap-3 border bg-[rgba(10,10,10,0.92)] px-3 py-2 shadow-2xl backdrop-blur-xl " +
              (done ? "border-[var(--color-cream)]" : "border-border-strong")
            }
          >
            {/* Countdown ring */}
            <div className="relative grid h-10 w-10 place-items-center">
              <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
                <circle cx="20" cy="20" r={R} fill="none" stroke="var(--color-border-strong)" strokeWidth="3" />
                <circle
                  cx="20"
                  cy="20"
                  r={R}
                  fill="none"
                  stroke={done ? "var(--color-cream)" : "var(--color-bone)"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - pct)}
                  style={{ transition: "stroke-dashoffset 0.25s linear" }}
                />
              </svg>
              <span className="absolute">
                {done ? (
                  <Check className="h-4 w-4 text-[var(--color-cream)]" />
                ) : (
                  <Timer className="h-3.5 w-3.5 text-text-muted" />
                )}
              </span>
            </div>

            <div className="min-w-[92px]">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
                {done ? "rest done" : "resting"}
              </div>
              {done ? (
                <div className="font-display text-base font-bold tracking-tight">
                  next set up
                </div>
              ) : (
                <div className="font-display text-xl font-extrabold tracking-tight num tabular-nums">
                  {label}
                </div>
              )}
              {!done && exerciseName && (
                <div className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-text-dim">
                  {exerciseName}
                </div>
              )}
            </div>

            {!done && (
              <button
                type="button"
                onClick={() => addTime(15)}
                className="inline-flex h-9 items-center gap-0.5 border border-border-subtle px-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary transition hover:border-border-strong hover:text-text-primary"
              >
                <Plus className="h-3 w-3" />
                15s
              </button>
            )}
            <button
              type="button"
              onClick={stop}
              className="grid h-9 w-9 place-items-center text-text-muted transition hover:text-text-primary"
              aria-label={done ? "Dismiss" : "Skip rest"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
