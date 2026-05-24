"use client";

import { useState } from "react";
import { Plus, Scale, Beef, Droplets } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { useNutritionStore } from "@/lib/store/useNutritionStore";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export function QuickActions() {
  const logWeight = useAppStore((s) => s.logWeight);
  const logMeal = useNutritionStore((s) => s.logMeal);
  const setWater = useNutritionStore((s) => s.setWater);
  const water = useNutritionStore((s) => s.waterLiters);
  const [w, setW] = useState("");
  const [mealCals, setMealCals] = useState("");
  const [mealProtein, setMealProtein] = useState("");

  return (
    <Card className="h-full">
      <CardHeader eyebrow="quick log">Capture · 5 sec</CardHeader>
      <CardBody className="space-y-3">
        <div className="rounded-xl border border-border-subtle/60 bg-[var(--color-bg-elevated)]/60 p-3">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            <Scale className="h-3 w-3 text-[var(--color-accent-primary)]" /> Morning weight
          </div>
          <div className="flex gap-2">
            <input
              value={w}
              onChange={(e) => setW(e.target.value)}
              placeholder="72.0"
              className="h-9 flex-1 rounded-lg border border-border-subtle bg-bg-base px-3 font-mono text-[13px] outline-none transition focus:border-[var(--color-accent-primary)]"
            />
            <button
              onClick={async () => {
                const v = parseFloat(w);
                if (v > 30 && v < 200) {
                  await logWeight(v);
                  setW("");
                }
              }}
              className="inline-flex h-9 items-center gap-1 bg-[var(--color-bone)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] hover:opacity-90"
            >
              <Plus className="h-3 w-3" /> log
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle/60 bg-[var(--color-bg-elevated)]/60 p-3">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            <Beef className="h-3 w-3 text-[var(--color-accent-amber)]" /> Quick meal
          </div>
          <div className="flex gap-2">
            <input
              value={mealCals}
              onChange={(e) => setMealCals(e.target.value)}
              placeholder="kcal"
              className="h-9 w-1/2 rounded-lg border border-border-subtle bg-bg-base px-3 font-mono text-[13px] outline-none transition focus:border-[var(--color-accent-amber)]"
            />
            <input
              value={mealProtein}
              onChange={(e) => setMealProtein(e.target.value)}
              placeholder="protein g"
              className="h-9 w-1/2 rounded-lg border border-border-subtle bg-bg-base px-3 font-mono text-[13px] outline-none transition focus:border-[var(--color-accent-secondary)]"
            />
            <button
              onClick={async () => {
                const c = parseInt(mealCals, 10);
                const p = parseInt(mealProtein, 10);
                if (!isNaN(c) && c > 0) {
                  await logMeal({
                    name: "Quick meal",
                    category: "snack",
                    calories: c,
                    protein: isNaN(p) ? 0 : p,
                    carbs: 0,
                    fats: 0,
                  });
                  setMealCals("");
                  setMealProtein("");
                }
              }}
              className="inline-flex h-9 items-center gap-1 rounded-lg bg-[var(--color-accent-amber)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black hover:opacity-90"
            >
              <Plus className="h-3 w-3" /> add
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle/60 bg-[var(--color-bg-elevated)]/60 p-3">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            <span className="flex items-center gap-2">
              <Droplets className="h-3 w-3 text-[var(--color-accent-tertiary)]" /> Hydration
            </span>
            <span className="num">{water.toFixed(1)} / 3.0 L</span>
          </div>
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-bg-base">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-accent-tertiary)] to-[var(--color-accent-secondary)]"
              style={{ width: `${Math.min(100, (water / 3) * 100)}%` }}
            />
          </div>
          <div className="flex gap-1">
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
  );
}
