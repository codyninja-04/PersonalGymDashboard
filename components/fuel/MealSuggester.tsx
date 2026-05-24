"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChefHat, RefreshCcw } from "lucide-react";
import { mealSuggestAction } from "@/app/actions/ai";

const PREF_CHIPS = ["high protein", "vegetarian", "indian", "no cooking", "post-workout"];

export function MealSuggester() {
  const [open, setOpen] = useState(false);
  const [preference, setPreference] = useState("");
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function suggest() {
    setError(null);
    startTransition(async () => {
      const res = await mealSuggestAction(preference);
      if (res.ok && res.text) setText(res.text);
      else if (res.notConfigured)
        setError("AI not configured. Add a GEMINI / GROQ / OPENROUTER key to enable.");
      else setError(res.error?.slice(0, 200) ?? "coach unreachable");
    });
  }

  return (
    <div className="border border-border-subtle bg-[var(--color-bg-elevated)]/60 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-3.5 w-3.5 text-[var(--color-cream)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-secondary">
            ai meal helper
          </span>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 border border-border-strong px-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary hover:border-[var(--color-bone)] hover:text-[var(--color-bone)]"
          >
            <Sparkles className="h-3 w-3" />
            suggest
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && !text && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                {PREF_CHIPS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setPreference(c)}
                    className={`border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] transition ${
                      preference === c
                        ? "border-[var(--color-bone)] bg-[var(--color-bone)] text-[var(--color-bg-base)]"
                        : "border-border-subtle bg-transparent text-text-muted hover:border-border-strong"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                placeholder="or type a preference (e.g. spicy, quick, fish)..."
                className="mt-2 h-10 w-full border border-border bg-[var(--color-bg-base)] px-3 font-mono text-[12px] outline-none placeholder:text-text-dim focus:border-[var(--color-bone)]"
              />

              {error && (
                <div className="mt-2 border border-[var(--color-blood)]/40 bg-[var(--color-blood-soft)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-blood)]">
                  {error}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
                  fits your remaining macros
                </span>
                <button
                  onClick={suggest}
                  disabled={pending}
                  className="inline-flex h-9 items-center gap-1.5 bg-[var(--color-bone)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] transition hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Sparkles className="h-3 w-3" /> suggest meal</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {text && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 border border-border-strong bg-[var(--color-bg-base)] p-4"
          >
            <div className="serif text-[14px] leading-relaxed text-text-primary whitespace-pre-line">
              {text}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setText(null);
                  setOpen(true);
                }}
                className="inline-flex h-8 items-center gap-1.5 border border-border-strong px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary hover:border-[var(--color-bone)] hover:text-[var(--color-bone)]"
              >
                <RefreshCcw className="h-3 w-3" />
                another
              </button>
              <button
                onClick={() => {
                  setText(null);
                  setOpen(false);
                  setPreference("");
                }}
                className="inline-flex h-8 items-center bg-[var(--color-bone)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] hover:opacity-90"
              >
                done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
