"use client";

import { CalendarCheck, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/lib/store/useAppStore";

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEK_PLAN_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const SCHEDULED = new Set(["monday", "wednesday", "friday", "saturday"]);

export function ConsistencyCard() {
  const weekPlan = useAppStore((s) => s.weekPlan);
  const streak = useAppStore((s) => s.streak);
  const completedDates = new Set(weekPlan.sessions.map((s) => s.date));

  // Compute monday-start week
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 0=Monday
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dow);

  const dayStates = WEEK_PLAN_KEYS.map((k, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const isFuture = d > now;
    const isToday = d.toDateString() === now.toDateString();
    const planned = SCHEDULED.has(k);
    const done = completedDates.has(iso);
    return { key: k, label: WEEK_LABELS[i], planned, done, isFuture, isToday };
  });

  const completed = dayStates.filter((d) => d.done && d.planned).length;
  const planned = dayStates.filter((d) => d.planned).length;
  const pct = Math.round((completed / planned) * 100);
  const flawless = completed === planned && completed > 0;

  return (
    <Card glow={flawless ? "secondary" : "tertiary"}>
      <CardHeader
        eyebrow="this week"
        action={
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-bg-elevated)]">
            <CalendarCheck className="h-4 w-4 text-[var(--color-accent-tertiary)]" />
          </div>
        }
      >
        Consistency
      </CardHeader>
      <CardBody>
        <div className="flex items-end justify-between">
          <div>
            <div className="font-display text-[40px] font-bold leading-none tracking-tight num">
              {completed}<span className="text-text-muted">/{planned}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={flawless ? "secondary" : "tertiary"}>
                {flawless ? "Flawless" : `${planned - completed} left`}
              </Badge>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted flex items-center gap-1">
                <Flame className="h-3 w-3 text-[var(--color-accent-amber)]" /> {streak}d streak
              </span>
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            {pct}%
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {dayStates.map((d, idx) => {
            const colorClass = d.done
              ? "bg-[var(--color-accent-secondary)] shadow-[0_0_12px_var(--color-accent-secondary)]"
              : d.planned && !d.isFuture
                ? "bg-[var(--color-accent-primary)]/40 ring-1 ring-inset ring-[var(--color-accent-primary)]/50"
                : d.planned
                  ? "bg-[var(--color-bg-elevated)] ring-1 ring-inset ring-border-strong"
                  : "bg-[var(--color-bg-base)] ring-1 ring-inset ring-border-subtle";
            return (
              <motion.div
                key={d.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex flex-col items-center gap-1.5"
              >
                <div className={`h-9 w-full rounded-md ${colorClass} relative`}>
                  {d.isToday && (
                    <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-[var(--color-accent-amber)] shadow-[0_0_8px_var(--color-accent-amber)]" />
                  )}
                </div>
                <span className="font-mono text-[9px] uppercase text-text-dim">{d.label}</span>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border-subtle/50 pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
          <span>Plan · Mon · Wed · Fri · Sat</span>
          <span style={{ color: flawless ? "var(--color-accent-secondary)" : "var(--color-text-muted)" }}>
            {flawless ? "100% lock-in" : "in progress"}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
