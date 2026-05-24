"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { Activity, ArrowUpRight } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/lib/store/useAppStore";
import { useBodyMetrics } from "@/hooks/useBodyMetrics";

interface TooltipPayload {
  payload: { label: string; weight: number; lean: number };
}
const ChartTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-strong bg-[rgba(15,15,23,0.95)] px-3 py-2 font-mono text-[11px] shadow-2xl backdrop-blur-xl">
      <div className="text-text-muted uppercase tracking-[0.16em] text-[9px] mb-1">{p.label}</div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)]" /> Weight
        </span>
        <span className="num">{p.weight.toFixed(1)} kg</span>
      </div>
      <div className="flex items-center justify-between gap-3 mt-1">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-secondary)]" /> Lean Mass
        </span>
        <span className="num">{p.lean.toFixed(1)} kg</span>
      </div>
    </div>
  );
};

export function WeightLeanMassChart() {
  const weights = useAppStore((s) => s.weightHistory);
  const { series, leanMassDelta, currentLeanMass } = useBodyMetrics();

  const data = useMemo(() => {
    return weights.slice(-30).map((w, i) => {
      const lean = series.find((s) => s.date === w.date)?.leanMassKg ?? 0;
      return {
        date: w.date,
        label: `D${i + 1}`,
        weight: w.weight,
        lean,
      };
    });
  }, [weights, series]);

  return (
    <Card className="h-full">
      <CardHeader
        eyebrow="30-day composition"
        action={
          <Badge variant={leanMassDelta >= 0 ? "secondary" : "primary"} glow>
            <Activity className="h-3 w-3" />
            {leanMassDelta >= 0 ? "+" : ""}{leanMassDelta} kg lean
          </Badge>
        }
      >
        Weight vs Lean Mass
      </CardHeader>
      <CardBody>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="font-display text-2xl font-bold tracking-tight num">
              {currentLeanMass.toFixed(1)} <span className="text-sm text-text-muted">kg lean</span>
            </div>
            <div className="mt-1 text-[11px] text-text-muted flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-[var(--color-accent-secondary)]" />
              Optimal recomp — losing fat, holding muscle
            </div>
          </div>
          <div className="flex gap-3 font-mono text-[10px] uppercase tracking-[0.14em]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-accent-primary)]" />
              <span className="text-text-muted">Weight</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-accent-secondary)]" />
              <span className="text-text-muted">Lean</span>
            </span>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="secondaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent-secondary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-accent-secondary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(123,97,255,0.08)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--color-text-dim)"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                domain={["dataMin - 1", "dataMax + 1"]}
                stroke="var(--color-text-dim)"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-accent-tertiary)", strokeOpacity: 0.4, strokeDasharray: "4 4" }} />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="var(--color-accent-primary)"
                strokeWidth={2.4}
                fill="url(#primaryGrad)"
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="lean"
                stroke="var(--color-accent-secondary)"
                strokeWidth={2.4}
                fill="url(#secondaryGrad)"
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}

// Suppress no-unused-vars
void LineChart;
void Line;
