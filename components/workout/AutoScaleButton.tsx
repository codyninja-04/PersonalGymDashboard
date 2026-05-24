"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2, X } from "lucide-react";
import { autoScaleAction } from "@/app/actions/ai";

const PRESET_REASONS = ["tired", "sore from last session", "slept poorly", "low energy", "just got back from cardio"];

export function AutoScaleButton({ splitName }: { splitName: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function scale() {
    setError(null);
    startTransition(async () => {
      const res = await autoScaleAction(reason, splitName);
      if (res.ok && res.text) setResponse(res.text);
      else if (res.notConfigured)
        setError("AI not configured. Add a GEMINI / GROQ / OPENROUTER key to enable.");
      else setError(res.error?.slice(0, 200) ?? "coach unreachable");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setResponse(null);
          setError(null);
          setReason("");
        }}
        className="inline-flex h-8 items-center gap-1.5 border border-border-strong bg-[var(--color-bg-elevated)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary transition hover:border-[var(--color-bone)] hover:text-[var(--color-bone)]"
        title="Scale today's session"
      >
        <Wand2 className="h-3 w-3" />
        scale
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
              className="w-full max-w-lg border border-border-strong bg-[var(--color-bg-surface)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-3.5 w-3.5 text-[var(--color-cream)]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-secondary">
                    auto-scale today
                  </span>
                </div>
                <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!response && (
                <div className="px-5 py-5">
                  <p className="text-[13px] text-text-secondary">
                    Tell the coach how you're feeling. They'll read your recent volume + RPE history and propose a scaled version of today's <span className="text-[var(--color-bone)]">{splitName}</span>.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {PRESET_REASONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setReason(r)}
                        className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition ${
                          reason === r
                            ? "border-[var(--color-bone)] bg-[var(--color-bone)] text-[var(--color-bg-base)]"
                            : "border-border-subtle bg-transparent text-text-muted hover:border-border-strong"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="or describe in your own words..."
                    rows={3}
                    className="mt-3 w-full resize-none border border-border bg-[var(--color-bg-elevated)] px-3 py-2 font-mono text-[12px] text-text-primary outline-none placeholder:text-text-dim focus:border-[var(--color-bone)]"
                  />

                  {error && (
                    <div className="mt-3 border border-[var(--color-blood)]/40 bg-[var(--color-blood-soft)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-blood)]">
                      {error}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">
                      reads your last 5 sessions + macros
                    </span>
                    <button
                      onClick={scale}
                      disabled={pending}
                      className="inline-flex h-10 items-center gap-1.5 bg-[var(--color-bone)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-bg-base)] transition hover:opacity-90 disabled:opacity-60"
                    >
                      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Wand2 className="h-3 w-3" /> scale it</>}
                    </button>
                  </div>
                </div>
              )}

              {response && (
                <div className="px-5 py-5">
                  <div className="serif text-[15px] leading-relaxed text-text-primary whitespace-pre-line">
                    {response}
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      onClick={() => setResponse(null)}
                      className="inline-flex h-9 items-center border border-border-strong bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary transition hover:border-[var(--color-bone)] hover:text-[var(--color-bone)]"
                    >
                      ask again
                    </button>
                    <button
                      onClick={() => setOpen(false)}
                      className="inline-flex h-9 items-center bg-[var(--color-bone)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] transition hover:opacity-90"
                    >
                      lock in
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
