"use client";

import { TrendingDown, TrendingUp, Scale } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/ui/Sparkline";
import { useAppStore } from "@/lib/store/useAppStore";
import { useBodyMetrics } from "@/hooks/useBodyMetrics";
import { formatDelta, formatKg } from "@/lib/utils/formatting";

export function WeightCard() {
  const weight = useAppStore((s) => s.user.currentWeightKg);
  const weights = useAppStore((s) => s.weightHistory);
  const { weekDelta, monthDelta } = useBodyMetrics();
  const data = weights.slice(-7).map((w) => w.weight);
  const trending = weekDelta < 0;
  const color = trending ? "var(--color-accent-secondary)" : "var(--color-accent-primary)";

  return (
    <Card glow={trending ? "secondary" : "primary"}>
      <CardHeader
        eyebrow="body weight"
        action={
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-bg-elevated)]">
            <Scale className="h-4 w-4 text-[var(--color-accent-primary)]" />
          </div>
        }
      >
        Mass
      </CardHeader>
      <CardBody>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-display text-[40px] font-bold leading-none tracking-tight num">
              {weight.toFixed(1)}
              <span className="ml-1 text-base font-medium text-text-muted">kg</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={trending ? "secondary" : "primary"}>
                {trending ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {formatDelta(weekDelta)}kg · 7d
              </Badge>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                30d {formatDelta(monthDelta)}
              </span>
            </div>
          </div>
          <div className="-mb-2">
            <Sparkline
              data={data}
              width={120}
              height={48}
              stroke={color}
              fill={color}
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border-subtle/50 pt-3">
          <Stat label="High" value={formatKg(Math.max(...data))} />
          <Stat label="Low" value={formatKg(Math.min(...data))} />
          <Stat
            label="Trend"
            value={trending ? "Cutting" : "Holding"}
            highlight={trending ? "secondary" : "primary"}
          />
        </div>
      </CardBody>
    </Card>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "primary" | "secondary";
}) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-dim">
        {label}
      </div>
      <div
        className="mt-0.5 font-mono text-[12px] font-semibold num"
        style={
          highlight === "secondary"
            ? { color: "var(--color-accent-secondary)" }
            : highlight === "primary"
              ? { color: "var(--color-accent-primary)" }
              : undefined
        }
      >
        {value}
      </div>
    </div>
  );
}
