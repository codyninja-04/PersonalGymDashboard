"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Check, Pencil } from "lucide-react";

const STORAGE_KEY = "anand-intent-today";
const PROMPTS = [
  "What's the one word for today?",
  "If today was filmed in slow-mo, the word would be:",
  "Set the tone. One word.",
  "What does today's lift mean to you?",
];

function loadStored(): { date: string; word: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function IntentSetter() {
  const today = new Date().toISOString().slice(0, 10);
  const [intent, setIntent] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [prompt, setPrompt] = useState(PROMPTS[0]);

  useEffect(() => {
    const stored = loadStored();
    if (stored && stored.date === today) setIntent(stored.word);
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  }, [today]);

  function save() {
    const w = draft.trim().slice(0, 24);
    if (!w) return;
    setIntent(w);
    setEditing(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, word: w }));
  }

  return (
    <div className="surface relative overflow-hidden px-6 py-6">
      <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-[var(--color-cream)] via-[var(--color-bone)] to-transparent opacity-30" />

      <div className="flex items-center gap-2">
        <Target className="h-3.5 w-3.5 text-[var(--color-cream)]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted">
          today's intent
        </span>
      </div>

      {!intent && !editing && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setEditing(true)}
          className="mt-3 group w-full text-left"
        >
          <p className="serif text-2xl italic leading-tight text-text-secondary sm:text-3xl">
            {prompt}
          </p>
          <span className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-cream)] group-hover:text-text-primary">
            <Pencil className="h-3 w-3" />
            set a word
          </span>
        </motion.button>
      )}

      {editing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
          <div className="flex gap-2">
            <input
              autoFocus
              maxLength={24}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") setEditing(false);
              }}
              placeholder="discipline · ferocity · calm · execute"
              className="h-12 flex-1 border border-border bg-[var(--color-bg-elevated)] px-3 font-display text-base font-semibold outline-none focus:border-[var(--color-bone)]"
            />
            <button
              onClick={save}
              className="inline-flex h-12 items-center gap-1.5 bg-[var(--color-bone)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] hover:opacity-90"
            >
              <Check className="h-3 w-3" /> lock
            </button>
          </div>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
            one word. you'll see it every time you open this page today.
          </p>
        </motion.div>
      )}

      {intent && !editing && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
          <div className="flex items-end justify-between gap-3">
            <h3 className="font-display text-5xl font-extrabold uppercase tracking-[-0.02em] leading-none sm:text-6xl">
              {intent}
            </h3>
            <button
              onClick={() => {
                setDraft(intent);
                setEditing(true);
              }}
              className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted hover:text-text-primary"
            >
              edit
            </button>
          </div>
          <div className="mt-3 brutalist-divider" />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim">
            carry this through every set.
          </p>
        </motion.div>
      )}
    </div>
  );
}
