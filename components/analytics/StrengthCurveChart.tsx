"use client";

import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { Trophy } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useAppStore } from "@/lib/store/useAppStore";
import { computeStrengthIndex } from "@/lib/calculations/strengthIndex";

export function StrengthCurveChart() {
  const prs = useAppStore((s) => s.personalRecords);
  const bw = useAppStore((s) => s.user.currentWeightKg);
  const idx = computeStrengthIndex(prs, bw);

  const labels = ["Press", "Pull", "OHP"];
  const colors = [
    "var(--color-accent-primary)",
    "var(--color-accent-secondary)",
    "var(--color-accent-tertiary)",
  ];
  const data = idx.perExercise.map((kg, i) => ({
    name: labels[i],
    value: Math.min(100, Math.round((kg / bw / 2.0) * 100)),
    fill: colors[i],
    raw: kg,
  }));

  return (
    <Card className="h-full">
      <CardHeader
        eyebrow="strength profile"
        action={
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-bg-elevated)]">
            <Trophy className="h-4 w-4 text-[var(--color-accent-amber)]" />
          </div>
        }
      >
        Aesthetic Lifts · 1RM × BW
      </CardHeader>
      <CardBody>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="35%"
              outerRadius="95%"
              data={data}
              startAngle={90}
              endAngle={-270}
              cx="50%"
              cy="50%"
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: "var(--color-bg-elevated)" }} dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2">
          {data.map((d, i) => (
            <div key={d.name} className="rounded-lg border border-border-subtle/60 bg-[var(--color-bg-elevated)] p-2">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: colors[i] }} />
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
                  {d.name}
                </span>
              </div>
              <div className="mt-1 font-display text-lg font-bold num">
                {d.raw.toFixed(0)}
                <span className="ml-1 text-[10px] font-medium text-text-muted">kg</span>
              </div>
              <div className="font-mono text-[9px] text-text-dim">
                {(d.raw / bw).toFixed(2)}× BW
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
