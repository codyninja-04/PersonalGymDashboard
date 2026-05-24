"use client";

import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, ReferenceLine, Tooltip, Cell } from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useAppStore } from "@/lib/store/useAppStore";
import { computeMacros } from "@/lib/calculations/macros";
import { GYM_DAYS } from "@/lib/data/workoutSplits";
import { getDayKey } from "@/lib/utils/formatting";
import type { DBDailyFuel } from "@/types/db";

interface TooltipPayload {
  payload: { dateLabel: string; calories: number; target: number; isGym: boolean };
}

const ChartTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const delta = p.calories - p.target;
  return (
    <div className="border border-border-strong bg-[rgba(10,10,10,0.95)] px-3 py-2 font-mono text-[11px] shadow-2xl backdrop-blur-xl">
      <div className="mb-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
        <span>{p.dateLabel}</span>
        <span style={{ color: p.isGym ? "var(--color-cream)" : "var(--color-chrome)" }}>{p.isGym ? "gym day" : "rest"}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span>actual</span>
        <span className="num">{p.calories} kcal</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-text-muted">target</span>
        <span className="num text-text-muted">{p.target} kcal</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 border-t border-border-subtle pt-1">
        <span>Δ</span>
        <span className="num" style={{ color: Math.abs(delta) < 150 ? "var(--color-cream)" : "var(--color-blood)" }}>
          {delta >= 0 ? "+" : ""}{delta}
        </span>
      </div>
    </div>
  );
};

export function MacroCyclingChart({ recentFuel }: { recentFuel: DBDailyFuel[] }) {
  const user = useAppStore((s) => s.user);

  const data = useMemo(() => {
    const macros = computeMacros(user);
    const today = new Date();
    const days: Array<{
      date: string;
      dateLabel: string;
      calories: number;
      target: number;
      isGym: boolean;
    }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayName = (["sunday","monday","tuesday","wednesday","thursday","friday","saturday"] as const)[d.getDay()];
      const isGym = GYM_DAYS.includes(dayName);
      const fuel = recentFuel.find((f) => f.date === iso);
      const target = isGym ? macros.gym.calories : macros.rest.calories;
      days.push({
        date: iso,
        dateLabel: d.toLocaleDateString(undefined, { weekday: "short" }),
        calories: fuel?.calories ?? 0,
        target,
        isGym,
      });
    }
    return days;
  }, [recentFuel, user]);

  const macros = computeMacros(user);
  const todayIsGym = GYM_DAYS.includes(getDayKey());
  const todayTarget = todayIsGym ? macros.gym.calories : macros.rest.calories;

  const totalActual = data.reduce((s, d) => s + d.calories, 0);
  const totalTarget = data.reduce((s, d) => s + d.target, 0);
  const adherence = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

  return (
    <Card>
      <CardHeader
        eyebrow="7-day caloric adherence"
        action={
          <div className="text-right">
            <div className="font-display text-base font-extrabold num">{adherence}%</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">
              total {totalActual.toLocaleString()} / {totalTarget.toLocaleString()}
            </div>
          </div>
        }
      >
        Macro cycling
      </CardHeader>
      <CardBody>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
              <XAxis dataKey="dateLabel" stroke="var(--color-text-dim)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-dim)" fontSize={9} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(250,250,247,0.04)" }} />
              <ReferenceLine y={todayTarget} stroke="var(--color-cream)" strokeDasharray="3 3" strokeOpacity={0.7} />
              <Bar dataKey="calories" radius={0}>
                {data.map((d, i) => {
                  const delta = d.calories - d.target;
                  const onTarget = Math.abs(delta) < 150;
                  const noData = d.calories === 0;
                  const fill = noData
                    ? "rgba(120,120,120,0.18)"
                    : onTarget
                      ? "var(--color-cream)"
                      : "var(--color-bone)";
                  return <Cell key={i} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          <span>dashed line · today's target</span>
          <span><span className="text-[var(--color-cream)]">cream</span> · within 150 kcal · <span className="text-[var(--color-bone)]">white</span> · off-band</span>
        </div>
      </CardBody>
    </Card>
  );
}
