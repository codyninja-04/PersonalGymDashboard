"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import type { DBBodyMeasurement } from "@/types/db";

const SERIES: Array<{ key: keyof DBBodyMeasurement; label: string; color: string }> = [
  { key: "waist_cm", label: "Waist", color: "var(--color-bone)" },
  { key: "chest_cm", label: "Chest", color: "var(--color-cream)" },
  { key: "arm_cm", label: "Arm", color: "var(--color-chrome)" },
];

interface TooltipPayload {
  payload: Record<string, number | string>;
  color: string;
  dataKey: string;
}

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border-strong bg-[rgba(10,10,10,0.95)] px-3 py-2 font-mono text-[11px] shadow-2xl backdrop-blur-xl">
      <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
            {p.dataKey.replace("_cm", "")}
          </span>
          <span className="num">{Number(p.payload[p.dataKey]).toFixed(1)} cm</span>
        </div>
      ))}
    </div>
  );
};

export function MeasurementsChart({ measurements }: { measurements: DBBodyMeasurement[] }) {
  const data = useMemo(
    () =>
      measurements.map((m) => ({
        date: m.date,
        waist_cm: m.waist_cm,
        chest_cm: m.chest_cm,
        arm_cm: m.arm_cm,
      })),
    [measurements],
  );

  const deltas = useMemo(() => {
    if (measurements.length < 2) return null;
    const first = measurements[0];
    const last = measurements[measurements.length - 1];
    return SERIES.map(({ key, label }) => {
      const a = first[key] as number | null;
      const b = last[key] as number | null;
      if (a == null || b == null) return { label, delta: null };
      return { label, delta: Math.round((b - a) * 10) / 10 };
    });
  }, [measurements]);

  if (measurements.length === 0) {
    return (
      <Card>
        <CardHeader eyebrow="trend">Measurements over time</CardHeader>
        <CardBody>
          <div className="grid place-items-center border border-dashed border-border-subtle bg-[var(--color-bg-elevated)]/40 py-12 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-dim">
              no measurements logged yet
            </div>
            <div className="mt-1 text-[12px] text-text-secondary">
              Log your first set above to see trend lines here.
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        eyebrow={`${measurements.length} entries · trend`}
        action={
          deltas && (
            <div className="flex gap-3">
              {deltas.map((d) =>
                d.delta == null ? null : (
                  <div key={d.label} className="text-right">
                    <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">{d.label}</div>
                    <div
                      className="font-mono text-[12px] font-bold num"
                      style={{ color: d.delta < 0 ? "var(--color-cream)" : d.delta > 0 ? "var(--color-bone)" : "var(--color-text-muted)" }}
                    >
                      {d.delta >= 0 ? "+" : ""}{d.delta} cm
                    </div>
                  </div>
                ),
              )}
            </div>
          )
        }
      >
        Measurements
      </CardHeader>
      <CardBody>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
              <defs>
                {SERIES.map(({ key, color }) => (
                  <linearGradient key={`grad-${key}`} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgba(200,196,184,0.06)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--color-text-dim)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-dim)" fontSize={9} tickLine={false} axisLine={false} width={40} domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-cream)", strokeOpacity: 0.4, strokeDasharray: "4 4" }} />
              <Legend wrapperStyle={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--color-text-muted)" }} />
              {SERIES.map(({ key, label, color }) => (
                <Area
                  key={key as string}
                  type="monotone"
                  dataKey={key as string}
                  name={label}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#grad-${key as string})`}
                  connectNulls
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
