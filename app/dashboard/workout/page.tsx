"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { WorkoutSplitModule } from "@/components/workout/WorkoutSplitModule";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ANAND_SPLITS } from "@/lib/data/workoutSplits";
import { useAppStore } from "@/lib/store/useAppStore";
import { formatRelativeDate } from "@/lib/utils/formatting";

const DAY_ORDER: Array<keyof typeof ANAND_SPLITS> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function WorkoutPage() {
  const sessions = useAppStore((s) => s.weekPlan.sessions).slice(-10).reverse();

  return (
    <div className="space-y-6">
      <TopBar />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[22px] border border-border-strong bg-gradient-to-br from-[#11111c] to-[#0a0a14] p-6"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-accent-primary)]">
          workout log · live
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          Today's session, the rest of the week, and the history.
        </h1>
      </motion.div>

      <WorkoutSplitModule />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader eyebrow="weekly split"><Calendar className="inline h-3.5 w-3.5 mr-1.5 text-[var(--color-accent-tertiary)]" /> Plan</CardHeader>
          <CardBody>
            <div className="space-y-2">
              {DAY_ORDER.map((k) => {
                const split = ANAND_SPLITS[k];
                return (
                  <div
                    key={k}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle/60 bg-[var(--color-bg-elevated)]/60 px-3 py-2.5"
                  >
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">
                        {k}
                      </div>
                      <div className="text-[13px] font-semibold text-text-primary">{split.name}</div>
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                      {split.isRest ? "—" : `${split.exercises.length} ex`}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader eyebrow="history · last sessions">Recent Lifts</CardHeader>
          <CardBody>
            <div className="space-y-2">
              {sessions.length === 0 && (
                <div className="text-center text-[12px] text-text-muted py-6">
                  No sessions logged yet — start lifting and they'll appear here.
                </div>
              )}
              {sessions.map((s) => (
                <Link
                  href="/dashboard/workout"
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle/60 bg-[var(--color-bg-elevated)]/60 px-3 py-2.5 transition hover:border-[var(--color-accent-tertiary)]/40"
                >
                  <div>
                    <div className="text-[13px] font-semibold text-text-primary">{s.splitName}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                      {formatRelativeDate(s.date)} · {(s.totalVolumeKg / 1000).toFixed(1)}t tonnage
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
