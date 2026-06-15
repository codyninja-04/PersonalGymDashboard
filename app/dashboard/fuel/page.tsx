"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Beef, Trash2, Plus, Pill, Droplets } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MacroRingCard } from "@/components/kpi/MacroRingCard";
import { MealSuggester } from "@/components/fuel/MealSuggester";
import { MacroCyclingChart } from "@/components/fuel/MacroCyclingChart";
import { useNutritionStore } from "@/lib/store/useNutritionStore";
import { useAppStore } from "@/lib/store/useAppStore";
import { useSplitStore } from "@/lib/store/useSplitStore";
import { gymDaysOf } from "@/lib/data/workoutSplits";
import { getDayKey } from "@/lib/utils/formatting";
import { getPhase } from "@/lib/data/phases";

const CATEGORIES = ["breakfast", "lunch", "dinner", "snack", "pre-workout", "post-workout"] as const;

export default function FuelPage() {
  const today = useNutritionStore((s) => s.today);
  const targets = useNutritionStore((s) => s.targets);
  const meals = useNutritionStore((s) => s.mealLog);
  const logMeal = useNutritionStore((s) => s.logMeal);
  const deleteMeal = useNutritionStore((s) => s.deleteMeal);
  const creatineTaken = useNutritionStore((s) => s.creatineTaken);
  const toggleCreatine = useNutritionStore((s) => s.toggleCreatine);
  const water = useNutritionStore((s) => s.waterLiters);
  const setWater = useNutritionStore((s) => s.setWater);
  const recentFuel = useAppStore((s) => s.recentFuel);
  const userPhase = useAppStore((s) => s.user.phase);
  const phase = getPhase(userPhase);
  const splitDays = useSplitStore((s) => s.days);

  const isGym = gymDaysOf(splitDays).includes(getDayKey());

  const [name, setName] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("snack");
  const [cals, setCals] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  function submit() {
    const c = parseInt(cals, 10);
    if (!name || isNaN(c) || c <= 0) return;
    logMeal({
      name,
      category: cat,
      calories: c,
      protein: parseInt(protein, 10) || 0,
      carbs: parseInt(carbs, 10) || 0,
      fats: parseInt(fats, 10) || 0,
    });
    setName("");
    setCals("");
    setProtein("");
    setCarbs("");
    setFats("");
  }

  const stanceLabel = phase.stance === "deficit" ? "deficit" : phase.stance === "surplus" ? "surplus" : "maintenance";

  return (
    <div className="space-y-6">
      <TopBar />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-border-strong bg-[var(--color-bg-surface)] p-6 sm:p-8"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--color-cream)]">
            fuel · {phase.label} · {isGym ? `gym day · ${targets.calories} kcal` : `rest day · ${targets.calories} kcal`}
          </span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-[40px] sm:leading-tight">
          You can&rsquo;t out-train a bad diet.
        </h1>
        <p className="mt-2 text-[13px] text-text-secondary max-w-xl">
          {stanceLabel === "deficit"
            ? "Hit protein. Cardio's optional. Don't chase carbs to fill kcal — protein first, then carbs around the lift."
            : stanceLabel === "surplus"
              ? "Eat. The surplus only works if you actually hit it. Quality calories, not just any calories."
              : "Precision is the game. Hit targets within 100 kcal. Track to know."}
        </p>
      </motion.div>

      <MacroCyclingChart recentFuel={recentFuel} />

      <MealSuggester />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <MacroRingCard />

        <Card>
          <CardHeader eyebrow="supplements">Daily Lock-ins</CardHeader>
          <CardBody>
            <button
              onClick={toggleCreatine}
              className={`flex w-full items-center justify-between gap-3 border p-3 transition ${
                creatineTaken
                  ? "border-[var(--color-cream)]/40 bg-[var(--color-cream)]/10"
                  : "border-border-subtle bg-[var(--color-bg-elevated)] hover:border-border-strong"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`grid h-9 w-9 place-items-center ${creatineTaken ? "bg-[var(--color-cream)]/10" : "bg-bg-base"}`}>
                  <Pill className={`h-4 w-4 ${creatineTaken ? "text-[var(--color-cream)]" : "text-text-muted"}`} />
                </div>
                <div className="text-left">
                  <div className="text-[13px] font-semibold">Creatine 5g</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                    {creatineTaken ? "taken · streak protected" : "tap to mark"}
                  </div>
                </div>
              </div>
              <Badge variant={creatineTaken ? "secondary" : "muted"}>{creatineTaken ? "✓" : "—"}</Badge>
            </button>

            <div className="mt-3 border border-border-subtle bg-[var(--color-bg-elevated)] p-3">
              <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em]">
                <span className="flex items-center gap-2 text-text-muted">
                  <Droplets className="h-3 w-3 text-[var(--color-chrome)]" /> Water
                </span>
                <span className="num text-text-secondary">{water.toFixed(1)} / 3.0 L</span>
              </div>
              <div className="h-2 overflow-hidden bg-bg-base">
                <div
                  className="h-full bg-[var(--color-bone)]"
                  style={{ width: `${Math.min(100, (water / 3) * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex gap-1.5">
                {[0.25, 0.5, 1].map((v) => (
                  <button
                    key={v}
                    onClick={() => setWater(water + v)}
                    className="flex-1 border border-border-subtle bg-bg-base py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary hover:border-[var(--color-bone)] hover:text-[var(--color-bone)]"
                  >
                    +{v}L
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader eyebrow="targets vs actual">Macro Math</CardHeader>
          <CardBody>
            <div className="space-y-3">
              <MacroRow label="Calories" v={today.calories} t={targets.calories} unit="kcal" color="var(--color-cream)" />
              <MacroRow label="Protein" v={today.protein} t={targets.protein} unit="g" color="var(--color-bone)" />
              <MacroRow label="Carbs" v={today.carbs} t={targets.carbs} unit="g" color="var(--color-chrome)" />
              <MacroRow label="Fats" v={today.fats} t={targets.fats} unit="g" color="var(--color-cream)" />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader eyebrow="log meal · 5 sec form">
          <span className="inline-flex items-center gap-1.5">
            <Beef className="h-4 w-4 text-[var(--color-cream)]" /> Add Entry
          </span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meal name"
              className="h-10 sm:col-span-2 border border-border bg-bg-base px-3 text-[13px] outline-none focus:border-[var(--color-bone)]"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as (typeof CATEGORIES)[number])}
              className="h-10 border border-border bg-bg-base px-3 text-[12px] font-mono uppercase tracking-[0.12em] text-text-secondary outline-none focus:border-[var(--color-bone)]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input value={cals} onChange={(e) => setCals(e.target.value)} placeholder="kcal" className="h-10 border border-border bg-bg-base px-3 font-mono text-[13px] outline-none focus:border-[var(--color-bone)]" />
            <input value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="protein" className="h-10 border border-border bg-bg-base px-3 font-mono text-[13px] outline-none focus:border-[var(--color-bone)]" />
            <input value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="carbs" className="h-10 border border-border bg-bg-base px-3 font-mono text-[13px] outline-none focus:border-[var(--color-bone)]" />
            <input value={fats} onChange={(e) => setFats(e.target.value)} placeholder="fats" className="h-10 border border-border bg-bg-base px-3 font-mono text-[13px] outline-none focus:border-[var(--color-bone)]" />
          </div>
          <button
            onClick={submit}
            className="mt-3 inline-flex items-center gap-1.5 bg-[var(--color-bone)] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] hover:opacity-90"
          >
            <Plus className="h-3 w-3" /> log meal
          </button>

          <div className="mt-6 space-y-2">
            {meals.length === 0 && (
              <div className="text-center py-6 text-[12px] text-text-muted">
                Log your first meal of the day to start tracking.
              </div>
            )}
            {meals.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 border border-border-subtle bg-[var(--color-bg-elevated)] px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{m.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                    {m.category} · {m.calories}kcal · P{m.protein} C{m.carbs} F{m.fats}
                  </div>
                </div>
                <button
                  onClick={() => deleteMeal(m.id)}
                  className="grid h-8 w-8 place-items-center border border-border-subtle text-text-muted hover:border-[var(--color-blood)] hover:text-[var(--color-blood)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function MacroRow({ label, v, t, unit, color }: { label: string; v: number; t: number; unit: string; color: string }) {
  const pct = Math.min(100, Math.round((v / t) * 100));
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em]">
        <span className="text-text-muted">{label}</span>
        <span className="num text-text-secondary">
          {v}<span className="text-text-dim"> / {t} {unit}</span>
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden bg-[var(--color-bg-elevated)]">
        <div
          className="h-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
