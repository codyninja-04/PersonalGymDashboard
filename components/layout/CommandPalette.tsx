"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Dumbbell, Calendar, Command } from "lucide-react";
import { EXERCISE_LIBRARY } from "@/lib/data/exerciseLibrary";
import { useSplitStore } from "@/lib/store/useSplitStore";

interface SearchResult {
  id: string;
  name: string;
  primary: string;
  days: string[];
  category: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const splitDays = useSplitStore((s) => s.days);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const INDEX = useMemo<SearchResult[]>(() => {
    const dayMap: Record<string, string[]> = {};
    Object.entries(splitDays).forEach(([dayKey, split]) => {
      split.exercises.forEach((ex) => {
        dayMap[ex.id] = dayMap[ex.id] ?? [];
        if (!dayMap[ex.id].includes(dayKey)) dayMap[ex.id].push(dayKey);
      });
    });
    return Object.values(EXERCISE_LIBRARY).map((ex) => ({
      id: ex.id,
      name: ex.name,
      primary: ex.primary,
      days: dayMap[ex.id] ?? [],
      category: ex.category,
    }));
  }, [splitDays]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INDEX.slice(0, 20);
    return INDEX.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.primary.toLowerCase().includes(q) ||
        r.id.includes(q.replace(/\s+/g, "-")),
    ).slice(0, 30);
  }, [query, INDEX]);

  useEffect(() => {
    if (active >= results.length) setActive(0);
  }, [results.length, active]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(results.length - 1, a + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        // For now, just close on enter — could deep-link to exercise in future
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, results.length]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden border border-border-strong bg-[var(--color-bg-surface)] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
              <Search className="h-4 w-4 text-text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exercises, muscle groups..."
                className="flex-1 bg-transparent font-display text-base text-text-primary outline-none placeholder:text-text-dim"
              />
              <kbd className="hidden items-center gap-1 border border-border bg-[var(--color-bg-elevated)] px-1.5 py-0.5 font-mono text-[9px] text-text-muted sm:inline-flex">
                ESC
              </kbd>
              <button onClick={onClose} className="text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-dim">
                    no exercise matches &ldquo;{query}&rdquo;
                  </div>
                </div>
              ) : (
                <ul>
                  {results.map((r, i) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={onClose}
                        className={`flex w-full items-center gap-3 border-b border-border-subtle/40 px-4 py-3 text-left transition ${
                          active === i ? "bg-[var(--color-bg-elevated)]" : "hover:bg-[var(--color-bg-elevated)]/60"
                        }`}
                      >
                        <div className="grid h-8 w-8 place-items-center border border-border bg-[var(--color-bg-base)]">
                          <Dumbbell className="h-3.5 w-3.5 text-[var(--color-bone)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-[13px] font-semibold">{r.name}</div>
                          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                            <span>{r.primary}</span>
                            <span className="opacity-40">·</span>
                            <span>{r.category}</span>
                            {r.days.length > 0 && (
                              <>
                                <span className="opacity-40">·</span>
                                <span className="flex items-center gap-1 text-[var(--color-cream)]">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {r.days.map((d) => d.slice(0, 3)).join(" / ")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border-subtle px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">
              <span className="flex items-center gap-2">
                <span>{results.length} results</span>
                <span className="opacity-40">·</span>
                <span>↑↓ navigate · ↵ select</span>
              </span>
              <span className="flex items-center gap-1">
                <Command className="h-2.5 w-2.5" />K to reopen
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
