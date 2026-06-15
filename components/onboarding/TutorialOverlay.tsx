"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Dumbbell,
  Beef,
  Camera,
  LineChart,
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft,
  X,
  type LucideIcon,
} from "lucide-react";
import { useTutorialStore } from "@/lib/store/useTutorialStore";

interface Step {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: Activity,
    eyebrow: "welcome",
    title: "This is Forge.",
    body: "Your training, food, and body in one place. No clutter, no fluff. Just the numbers that move the needle and a dashboard that reacts to them. Here is the 30 second tour. Skip it any time.",
  },
  {
    icon: Activity,
    eyebrow: "today",
    title: "Start every day here.",
    body: "The Today page is your command center. Your phase, your streak, today's session, your macros, and a coach that reads your data. Set an intent, log your lifestyle, and get moving.",
  },
  {
    icon: Dumbbell,
    eyebrow: "train",
    title: "Log lifts as you go.",
    body: "Open Train, hit start, and log each set with weight, reps, and RPE. We track tonnage and flag PRs automatically. Tap any other day to preview what's coming.",
  },
  {
    icon: SlidersHorizontal,
    eyebrow: "make it yours",
    title: "Your split, your rules.",
    body: "Everyone trains differently. In Profile you can pick a proven template like Push Pull Legs or Upper Lower, then rename days, swap movements, and dial in your sets. The whole app adapts to it.",
  },
  {
    icon: Beef,
    eyebrow: "fuel",
    title: "Eat for the day you're in.",
    body: "Forge cycles your macros around your split. More food on training days, less on rest days. Log meals, water, and creatine, and watch your weekly adherence build.",
  },
  {
    icon: Camera,
    eyebrow: "body",
    title: "Track what the scale misses.",
    body: "Weight lies on its own. Log measurements and progress photos so you can see the recomp happening even when the number on the scale holds steady.",
  },
  {
    icon: LineChart,
    eyebrow: "progress",
    title: "Watch the trend, not the day.",
    body: "Progress turns your logs into charts. Weight versus lean mass, volume by muscle, strength curves, and a running strength index. This is where the work shows up.",
  },
];

export function TutorialOverlay() {
  const open = useTutorialStore((s) => s.open);
  const seen = useTutorialStore((s) => s.seen);
  const hydrated = useTutorialStore((s) => s.hydrated);
  const start = useTutorialStore((s) => s.start);
  const finish = useTutorialStore((s) => s.finish);
  const [step, setStep] = useState(0);

  // Auto-open once, only for genuinely new users (after persist rehydrates).
  useEffect(() => {
    if (hydrated && !seen && !open) {
      const t = setTimeout(() => start(), 600);
      return () => clearTimeout(t);
    }
  }, [hydrated, seen, open, start]);

  const isLast = step === STEPS.length - 1;

  function close() {
    finish();
    setStep(0);
  }
  function next() {
    if (isLast) close();
    else setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  const current = STEPS[step];
  const Icon = current?.icon ?? Activity;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/80 px-4 backdrop-blur-md"
          onClick={close}
        >
          <motion.div
            initial={{ y: 22, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden border border-border-strong bg-[var(--color-bg-surface)] shadow-2xl"
          >
            {/* top accent */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(420px_140px_at_50%_-40%,rgba(245,237,214,0.16),transparent)]" />

            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center text-text-muted transition hover:text-text-primary"
              aria-label="Skip tour"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative px-6 pt-8 pb-6">
              <div className="grid h-12 w-12 place-items-center border border-[var(--color-bone)] bg-[var(--color-bg-base)]">
                <Icon className="h-6 w-6 text-[var(--color-bone)]" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--color-cream)]">
                    {current.eyebrow}
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
                    {current.title}
                  </h2>
                  <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
                    {current.body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* footer */}
            <div className="flex items-center justify-between border-t border-border-subtle px-6 py-4">
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStep(i)}
                    aria-label={`Go to step ${i + 1}`}
                    className={
                      "h-1.5 rounded-full transition-all " +
                      (i === step
                        ? "w-5 bg-[var(--color-bone)]"
                        : "w-1.5 bg-border-strong hover:bg-text-muted")
                    }
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={back}
                    className="inline-flex h-9 items-center gap-1.5 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted transition hover:text-text-primary"
                  >
                    <ArrowLeft className="h-3 w-3" /> back
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex h-9 items-center gap-1.5 bg-[var(--color-bone)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] transition hover:opacity-90"
                >
                  {isLast ? "start training" : "next"}
                  {!isLast && <ArrowRight className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </motion.div>

          <button
            type="button"
            onClick={close}
            className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted transition hover:text-text-primary"
          >
            skip the tour
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
