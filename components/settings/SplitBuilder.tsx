"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Plus,
  Trash2,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Coffee,
  RotateCcw,
  Check,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useSplitStore } from "@/lib/store/useSplitStore";
import { DAY_KEYS, DAY_SHORT, type DayKey } from "@/lib/data/workoutSplits";
import { SPLIT_TEMPLATES } from "@/lib/data/splitTemplates";
import { MUSCLE_GROUPS, exercisesByMuscle } from "@/lib/data/exerciseLibrary";
import { getDayKey, cn } from "@/lib/utils/formatting";

const BY_MUSCLE = exercisesByMuscle();

export function SplitBuilder() {
  const days = useSplitStore((s) => s.days);
  const templateId = useSplitStore((s) => s.templateId);
  const applyTemplate = useSplitStore((s) => s.applyTemplate);
  const resetToDefault = useSplitStore((s) => s.resetToDefault);

  const [openDay, setOpenDay] = useState<DayKey>(getDayKey());

  const totalSets = DAY_KEYS.reduce(
    (acc, k) => acc + days[k].exercises.reduce((a, e) => a + e.sets, 0),
    0,
  );
  const trainingDays = DAY_KEYS.filter((k) => !days[k].isRest && days[k].exercises.length > 0).length;

  return (
    <Card id="split-builder">
      <CardHeader
        eyebrow="training · your split"
        action={
          <button
            onClick={resetToDefault}
            className="inline-flex h-8 items-center gap-1.5 border border-border-subtle bg-[var(--color-bg-elevated)] px-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary transition hover:border-border-strong hover:text-text-primary"
          >
            <RotateCcw className="h-3 w-3" /> reset
          </button>
        }
      >
        <span className="inline-flex items-center gap-1.5">
          <Dumbbell className="h-3.5 w-3.5 text-[var(--color-bone)]" />
          Build your week
        </span>
      </CardHeader>
      <CardBody>
        <p className="mb-4 text-[13px] text-text-secondary">
          Your split is yours. Start from a proven template, then tweak any day, swap movements, or
          dial in the sets. Every change saves on this device automatically and reshapes your plan,
          your macro cycling, and your volume tracking.
        </p>

        {/* Template picker */}
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
          start from a template
        </div>
        <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SPLIT_TEMPLATES.map((t) => {
            const active = templateId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t.id)}
                className={cn(
                  "group flex flex-col gap-1 border p-3 text-left transition",
                  active
                    ? "border-[var(--color-bone)] bg-[var(--color-bg-elevated)]"
                    : "border-border-subtle bg-[var(--color-bg-elevated)]/40 hover:border-border-strong",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-[14px] font-bold tracking-tight">{t.name}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
                    {t.daysPerWeek}d
                  </span>
                </div>
                <p className="text-[11px] leading-snug text-text-muted">{t.tagline}</p>
              </button>
            );
          })}
        </div>

        {templateId === "custom" && (
          <div className="mb-4 inline-flex items-center gap-1.5">
            <Badge variant="primary" glow><Check className="h-3 w-3" /> custom split</Badge>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
              {trainingDays} training days · {totalSets} sets / week
            </span>
          </div>
        )}

        {/* Day editor */}
        <div className="space-y-2">
          {DAY_KEYS.map((key) => (
            <DayEditor
              key={key}
              dayKey={key}
              open={openDay === key}
              isToday={key === getDayKey()}
              onToggle={() => setOpenDay((d) => (d === key ? ("" as DayKey) : key))}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function DayEditor({
  dayKey,
  open,
  isToday,
  onToggle,
}: {
  dayKey: DayKey;
  open: boolean;
  isToday: boolean;
  onToggle: () => void;
}) {
  const day = useSplitStore((s) => s.days[dayKey]);
  const renameDay = useSplitStore((s) => s.renameDay);
  const toggleRest = useSplitStore((s) => s.toggleRest);
  const addExercise = useSplitStore((s) => s.addExercise);
  const removeExercise = useSplitStore((s) => s.removeExercise);
  const moveExercise = useSplitStore((s) => s.moveExercise);
  const setExerciseSets = useSplitStore((s) => s.setExerciseSets);

  const [pick, setPick] = useState("");
  const setCount = day.exercises.reduce((a, e) => a + e.sets, 0);

  return (
    <div
      className={cn(
        "border bg-[var(--color-bg-elevated)]/40 transition",
        open ? "border-border-strong" : "border-border-subtle",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <span
          className={cn(
            "grid h-9 w-11 place-items-center border font-mono text-[10px] font-bold uppercase tracking-[0.1em]",
            day.isRest
              ? "border-border-subtle bg-transparent text-text-muted"
              : "border-[var(--color-bone)] bg-[var(--color-bone)] text-[var(--color-bg-base)]",
          )}
        >
          {DAY_SHORT[dayKey]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-semibold text-text-primary">{day.name}</span>
            {isToday && (
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--color-cream)]">
                today
              </span>
            )}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
            {day.isRest ? "rest day" : `${day.exercises.length} exercises · ${setCount} sets`}
          </div>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border-subtle px-3 py-3">
              {/* Day controls */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <input
                  value={day.name}
                  onChange={(e) => renameDay(dayKey, e.target.value)}
                  disabled={day.isRest}
                  placeholder="Day name"
                  className="h-9 flex-1 min-w-[140px] border border-border bg-[var(--color-bg-base)] px-3 font-mono text-[12px] text-text-primary outline-none transition placeholder:text-text-dim focus:border-[var(--color-bone)] disabled:opacity-40"
                />
                <button
                  type="button"
                  onClick={() => toggleRest(dayKey)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 border px-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition",
                    day.isRest
                      ? "border-[var(--color-bone)] bg-[var(--color-bone)] text-[var(--color-bg-base)]"
                      : "border-border-subtle bg-[var(--color-bg-elevated)] text-text-secondary hover:border-border-strong",
                  )}
                >
                  <Coffee className="h-3 w-3" />
                  {day.isRest ? "rest day" : "mark rest"}
                </button>
              </div>

              {!day.isRest && (
                <>
                  {/* Exercise list */}
                  <div className="space-y-1.5">
                    {day.exercises.map((ex, i) => (
                      <div
                        key={`${ex.id}-${i}`}
                        className="flex items-center gap-2 border border-border-subtle bg-[var(--color-bg-base)] px-2.5 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] font-semibold text-text-primary">
                            {ex.name}
                          </div>
                          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
                            {ex.primary} · {ex.repRange[0]}-{ex.repRange[1]} reps
                          </div>
                        </div>

                        {/* Sets stepper */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setExerciseSets(dayKey, i, ex.sets - 1)}
                            className="grid h-7 w-7 place-items-center border border-border-subtle text-text-muted transition hover:text-text-primary"
                            aria-label="Fewer sets"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center font-mono text-[12px] font-bold num">
                            {ex.sets}
                            <span className="text-text-dim">×</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setExerciseSets(dayKey, i, ex.sets + 1)}
                            className="grid h-7 w-7 place-items-center border border-border-subtle text-text-muted transition hover:text-text-primary"
                            aria-label="More sets"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Reorder + remove */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveExercise(dayKey, i, -1)}
                            disabled={i === 0}
                            className="grid h-7 w-7 place-items-center text-text-muted transition hover:text-text-primary disabled:opacity-20"
                            aria-label="Move up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveExercise(dayKey, i, 1)}
                            disabled={i === day.exercises.length - 1}
                            className="grid h-7 w-7 place-items-center text-text-muted transition hover:text-text-primary disabled:opacity-20"
                            aria-label="Move down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExercise(dayKey, i)}
                            className="grid h-7 w-7 place-items-center text-text-muted transition hover:text-[var(--color-blood)]"
                            aria-label="Remove exercise"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {day.exercises.length === 0 && (
                      <div className="border border-dashed border-border-subtle px-3 py-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
                        empty day · add a movement below
                      </div>
                    )}
                  </div>

                  {/* Add exercise */}
                  <div className="mt-3 flex items-center gap-2">
                    <select
                      value={pick}
                      onChange={(e) => setPick(e.target.value)}
                      className="h-9 flex-1 border border-border bg-[var(--color-bg-base)] px-2 font-mono text-[12px] text-text-primary outline-none focus:border-[var(--color-bone)]"
                    >
                      <option value="">Add an exercise…</option>
                      {MUSCLE_GROUPS.map((g) => (
                        <optgroup key={g} label={g}>
                          {BY_MUSCLE[g]?.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!pick}
                      onClick={() => {
                        if (!pick) return;
                        addExercise(dayKey, pick);
                        setPick("");
                      }}
                      className="inline-flex h-9 items-center gap-1.5 bg-[var(--color-bone)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] transition hover:opacity-90 disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" /> add
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
