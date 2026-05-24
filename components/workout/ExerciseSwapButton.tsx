"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Loader2, X } from "lucide-react";
import { exerciseSwapAction, type ExerciseSwap } from "@/app/actions/ai";

interface Props {
  exerciseName: string;
  primaryMuscle: string;
}

const REASONS = ["equipment busy", "pain / injury", "want variety", "no rack today"];

export function ExerciseSwapButton({ exerciseName, primaryMuscle }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [alternatives, setAlternatives] = useState<ExerciseSwap[]>([]);
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function find() {
    setError(null);
    setAlternatives([]);
    setRawText(null);
    startTransition(async () => {
      const res = await exerciseSwapAction(exerciseName, primaryMuscle, reason || "variety");
      if (res.ok) {
        if (res.alternatives && res.alternatives.length > 0) {
          setAlternatives(res.alternatives);
        } else {
          setRawText(res.text ?? "no swap suggestions found");
        }
      } else if (res.notConfigured)
        setError("AI not configured. Add a key in .env.local to enable.");
      else setError(res.error?.slice(0, 200) ?? "coach unreachable");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
          setAlternatives([]);
          setRawText(null);
          setReason("");
        }}
        className="inline-flex h-7 items-center gap-1 border border-border-subtle px-2 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted transition hover:border-[var(--color-bone)] hover:text-[var(--color-bone)]"
        title="Find an alternative for this exercise"
      >
        <Shuffle className="h-3 w-3" />
        swap
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md border border-border-strong bg-[var(--color-bg-surface)]"
            >
              <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
                <div className="flex items-center gap-2">
                  <Shuffle className="h-3.5 w-3.5 text-[var(--color-cream)]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-secondary">
                    swap finder
                  </span>
                </div>
                <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-5 py-4">
                <p className="text-[13px] text-text-secondary">
                  Need an alternative to <span className="text-[var(--color-bone)] font-semibold">{exerciseName}</span>?
                </p>

                {alternatives.length === 0 && !rawText && (
                  <>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {REASONS.map((r) => (
                        <button
                          key={r}
                          onClick={() => setReason(r)}
                          className={`border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] transition ${
                            reason === r
                              ? "border-[var(--color-bone)] bg-[var(--color-bone)] text-[var(--color-bg-base)]"
                              : "border-border-subtle text-text-muted hover:border-border-strong"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    {error && (
                      <div className="mt-3 border border-[var(--color-blood)]/40 bg-[var(--color-blood-soft)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-blood)]">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={find}
                      disabled={pending}
                      className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 bg-[var(--color-bone)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-bg-base)] transition hover:opacity-90 disabled:opacity-60"
                    >
                      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Shuffle className="h-3 w-3" /> find swap</>}
                    </button>
                  </>
                )}

                {alternatives.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {alternatives.map((alt, i) => (
                      <div
                        key={i}
                        className="border border-border-strong bg-[var(--color-bg-elevated)] p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-[var(--color-cream)]">
                            0{i + 1}
                          </span>
                          <span className="font-display text-[14px] font-semibold text-text-primary">
                            {alt.name}
                          </span>
                        </div>
                        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                          {alt.muscle_match}
                        </div>
                        <p className="mt-2 text-[12px] leading-snug text-text-secondary">{alt.why}</p>
                      </div>
                    ))}
                    <button
                      onClick={() => setOpen(false)}
                      className="mt-2 inline-flex h-9 w-full items-center justify-center bg-[var(--color-bone)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] hover:opacity-90"
                    >
                      got it
                    </button>
                  </div>
                )}

                {rawText && alternatives.length === 0 && (
                  <div className="mt-3 border border-border bg-[var(--color-bg-elevated)] p-3 font-mono text-[12px] text-text-secondary whitespace-pre-line">
                    {rawText}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
