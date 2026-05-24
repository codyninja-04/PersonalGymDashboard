"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, Loader2, RefreshCcw } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { stallDiagnosisAction } from "@/app/actions/ai";

const CACHE_KEY = "forge-stall-diagnosis";
const STALL_THRESHOLD_KG = 0.25;
const STALL_WINDOW = 7;

interface CachedDiagnosis {
  date: string;
  text: string;
}

export function StallDiagnosisCard() {
  const weightHistory = useAppStore((s) => s.weightHistory);
  const [text, setText] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const isStalled = useMemo(() => {
    const last = weightHistory.slice(-STALL_WINDOW);
    if (last.length < STALL_WINDOW) return false;
    const start = last.slice(0, 2).reduce((a, b) => a + b.weight, 0) / 2;
    const end = last.slice(-2).reduce((a, b) => a + b.weight, 0) / 2;
    return Math.abs(end - start) < STALL_THRESHOLD_KG;
  }, [weightHistory]);

  // Load cached diagnosis (1/day)
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached: CachedDiagnosis = JSON.parse(raw);
        if (cached.date === today) {
          setText(cached.text);
          setHasRun(true);
        }
      }
    } catch {}
  }, []);

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await stallDiagnosisAction();
      if (res.ok && res.text) {
        setText(res.text);
        setHasRun(true);
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ date: new Date().toISOString().slice(0, 10), text: res.text }),
          );
        } catch {}
      } else if (res.notConfigured)
        setError("AI not configured. Add a key in .env.local.");
      else setError(res.error?.slice(0, 200) ?? "coach unreachable");
    });
  }

  if (!isStalled && !text) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border border-[var(--color-cream)]/30 bg-[var(--color-bg-surface)]"
    >
      <div className="absolute inset-y-0 left-0 w-[2px] bg-[var(--color-cream)] opacity-60" />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-center gap-2">
          {isStalled ? (
            <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-cream)]" />
          ) : (
            <Activity className="h-3.5 w-3.5 text-[var(--color-cream)]" />
          )}
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted">
            {isStalled ? "plateau detected · ai protocol" : "ai protocol · cached"}
          </span>
        </div>

        {!hasRun && !text && (
          <>
            <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight">
              Weight has been flat 7 days.
            </h3>
            <p className="mt-2 text-[13px] text-text-secondary">
              Run a diagnosis. The coach will examine your trends and propose ONE specific change — not a list.
            </p>

            {error && (
              <div className="mt-3 border border-[var(--color-blood)]/40 bg-[var(--color-blood-soft)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-blood)]">
                {error}
              </div>
            )}

            <button
              onClick={run}
              disabled={pending}
              className="mt-4 inline-flex h-10 items-center gap-1.5 bg-[var(--color-bone)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-bg-base)] transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Activity className="h-3 w-3" /> diagnose</>}
            </button>
          </>
        )}

        <AnimatePresence>
          {text && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              <p className="serif text-[18px] leading-relaxed text-text-primary">
                {text}
              </p>
              <button
                onClick={run}
                disabled={pending}
                className="mt-4 inline-flex h-8 items-center gap-1.5 border border-border-strong bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted hover:border-[var(--color-bone)] hover:text-[var(--color-bone)]"
              >
                {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
                re-diagnose
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
