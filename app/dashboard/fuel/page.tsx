"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Beef, Trash2, Plus, Pill, Droplets } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MacroRingCard } from "@/components/kpi/MacroRingCard";
import { MealSuggester } from "@/components/fuel/MealSuggester";
import { useNutritionStore } from "@/lib/store/useNutritionStore";
import { GYM_DAYS } from "@/lib/data/workoutSplits";
import { getDayKey } from "@/lib/utils/formatting";

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

  const isGym = GYM_DAYS.includes(getDayKey());

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

  return (
    <div className="space-y-6">
      <TopBar />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[22px] border border-border-strong bg-gradient-to-br from-[#11111c] to-[#0a0a14] p-6"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-accent-amber)]">
            fuel · {isGym ? "gym day · 2050 kcal" : "rest day · 1750 kcal"}
          </span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          You can't out-train a bad diet.
        </h1>
        <p className="mt-2 text-[13px] text-text-secondary max-w-xl">
          Hit protein. Don't chase carbs blindly. Creatine non-negotiable.
        </p>
      </motion.div>

      <MealSuggester />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <MacroRingCard />

        <Card>
          <CardHeader eyebrow="supplements">Daily Lock-ins</CardHeader>
          <CardBody>
            <button
              onClick={toggleCreatine}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 transition ${
                creatineTaken
                  ? "border-[var(--color-accent-secondary)]/40 bg-[var(--color-accent-secondary-soft)]"
                  : "border-border-subtle bg-[var(--color-bg-elevated)] hover:border-border-strong"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${creatineTaken ? "bg-[var(--color-accent-secondary-soft)]" : "bg-bg-base"}`}>
                  <Pill className={`h-4 w-4 ${creatineTaken ? "text-[var(--color-accent-secondary)]" : "text-text-muted"}`} />
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

            <div className="mt-3 rounded-xl border border-border-subtle bg-[var(--color-bg-elevated)] p-3">
              <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em]">
                <span className="flex items-center gap-2 text-text-muted">
                  <Droplets className="h-3 w-3 text-[var(--color-accent-tertiary)]" /> Water
                </span>
                <span className="num text-text-secondary">{water.toFixed(1)} / 3.0 L</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg-base">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-accent-tertiary)] to-[var(--color-accent-secondary)]"
                  style={{ width: `${Math.min(100, (water / 3) * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex gap-1.5">
                {[0.25, 0.5, 1].map((v) => (
                  <button
                    key={v}
                    onClick={() => setWater(water + v)}
                    className="flex-1 rounded-md border border-border-subtle bg-bg-base py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary hover:border-[var(--color-accent-tertiary)] hover:text-[var(--color-accent-tertiary)]"
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
              <MacroRow label="Calories" v={today.calories} t={targets.calories} unit="kcal" color="var(--color-accent-amber)" />
              <MacroRow label="Protein" v={today.protein} t={targets.protein} unit="g" color="var(--color-accent-secondary)" />
              <MacroRow label="Carbs" v={today.carbs} t={targets.carbs} unit="g" color="var(--color-accent-tertiary)" />
              <MacroRow label="Fats" v={today.fats} t={targets.fats} unit="g" color="var(--color-accent-primary)" />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader eyebrow="log meal · 5 sec form">
          <span className="inline-flex items-center gap-1.5">
            <Beef className="h-4 w-4 text-[var(--color-accent-amber)]" /> Add Entry
          </span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meal name"
              className="h-10 sm:col-span-2 rounded-lg border border-border-subtle bg-bg-base px-3 text-[13px] outline-none focus:border-[var(--color-accent-amber)]"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as (typeof CATEGORIES)[number])}
              className="h-10 rounded-lg border border-border-subtle bg-bg-base px-3 text-[12px] font-mono uppercase tracking-[0.12em] text-text-secondary outline-none focus:border-[var(--color-accent-amber)]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input value={cals} onChange={(e) => setCals(e.target.value)} placeholder="kcal" className="h-10 rounded-lg border border-border-subtle bg-bg-base px-3 font-mono text-[13px] outline-none focus:border-[var(--color-accent-amber)]" />
            <input value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="protein" className="h-10 rounded-lg border border-border-subtle bg-bg-base px-3 font-mono text-[13px] outline-none focus:border-[var(--color-accent-secondary)]" />
            <input value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="carbs" className="h-10 rounded-lg border border-border-subtle bg-bg-base px-3 font-mono text-[13px] outline-none focus:border-[var(--color-accent-tertiary)]" />
            <input value={fats} onChange={(e) => setFats(e.target.value)} placeholder="fats" className="h-10 rounded-lg border border-border-subtle bg-bg-base px-3 font-mono text-[13px] outline-none focus:border-[var(--color-accent-primary)]" />
          </div>
          <button
            onClick={submit}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent-amber)] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black hover:opacity-90"
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
                className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle/60 bg-[var(--color-bg-elevated)]/60 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{m.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                    {m.category} · {m.calories}kcal · P{m.protein} C{m.carbs} F{m.fats}
                  </div>
                </div>
                <button
                  onClick={() => deleteMeal(m.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border-subtle text-text-muted hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
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
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}
