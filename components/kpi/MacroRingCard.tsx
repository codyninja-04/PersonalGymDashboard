"use client";

import { Flame } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useNutritionStore } from "@/lib/store/useNutritionStore";

export function MacroRingCard() {
  const today = useNutritionStore((s) => s.today);
  const targets = useNutritionStore((s) => s.targets);

  const pct = Math.min(100, Math.round((today.calories / targets.calories) * 100));
  const remaining = Math.max(0, targets.calories - today.calories);

  const arcColor =
    pct >= 95
      ? "var(--color-accent-amber)"
      : pct >= 70
        ? "var(--color-accent-secondary)"
        : "var(--color-accent-primary)";

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const macros: Array<{ label: string; value: number; target: number; color: string }> = [
    { label: "Protein", value: today.protein, target: targets.protein, color: "var(--color-accent-secondary)" },
    { label: "Carbs", value: today.carbs, target: targets.carbs, color: "var(--color-accent-amber)" },
    { label: "Fats", value: today.fats, target: targets.fats, color: "var(--color-accent-tertiary)" },
  ];

  return (
    <Card glow="secondary">
      <CardHeader
        eyebrow="today's fuel"
        action={
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-bg-elevated)]">
            <Flame className="h-4 w-4 text-[var(--color-accent-amber)]" />
          </div>
        }
      >
        Macros
      </CardHeader>
      <CardBody>
        <div className="flex items-center gap-4">
          <div className="relative h-[140px] w-[140px]">
            <svg className="-rotate-90" width="140" height="140" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="var(--color-bg-elevated)"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke={arcColor}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                  transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)",
                  filter: `drop-shadow(0 0 6px ${arcColor})`,
                }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="font-display text-2xl font-bold leading-none num">
                  {today.calories}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted mt-1">
                  / {targets.calories} kcal
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            {macros.map((m) => {
              const macroPct = Math.min(100, (m.value / m.target) * 100);
              return (
                <div key={m.label}>
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.12em]">
                    <span className="text-text-muted">{m.label}</span>
                    <span className="num text-text-secondary">
                      {m.value}<span className="text-text-dim">/{m.target}g</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${macroPct}%`,
                        background: m.color,
                        boxShadow: `0 0 8px ${m.color}`,
                        transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border-subtle/50 pt-3 font-mono text-[10px] uppercase tracking-[0.14em]">
          <span className="text-text-muted">{remaining} kcal remaining</span>
          <span
            style={{ color: targets.carbs - today.carbs < 30 ? "var(--color-accent-amber)" : "var(--color-text-muted)" }}
          >
            {targets.carbs - today.carbs < 30 ? "carb ceiling active" : "deficit on rails"}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
