"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/lib/store/useAppStore";
import { formatRelativeDate } from "@/lib/utils/formatting";

export function PRFeed() {
  const prs = useAppStore((s) => s.personalRecords).slice(-6).reverse();

  return (
    <Card className="h-full">
      <CardHeader
        eyebrow="recent prs"
        action={
          <Badge variant="primary" glow>
            <Trophy className="h-3 w-3" />
            {prs.length} this cycle
          </Badge>
        }
      >
        PR Wall
      </CardHeader>
      <CardBody>
        <div className="space-y-2">
          {prs.map((pr, i) => (
            <motion.div
              key={`${pr.exercise}-${pr.date}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative flex items-center gap-3 rounded-xl border border-border-subtle/60 bg-[var(--color-bg-elevated)]/60 p-3 transition hover:border-[var(--color-accent-primary)]/40"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--color-accent-primary-soft)]">
                <Trophy className="h-4 w-4 text-[var(--color-accent-primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-[13px] font-semibold text-text-primary">
                  {pr.exercise}
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                  <span>{pr.weight}kg × {pr.reps}</span>
                  <span>·</span>
                  <span>{formatRelativeDate(pr.date)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-base font-bold num text-[var(--color-accent-primary)]">
                  {pr.estimatedOneRM.toFixed(1)}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-dim">
                  est 1RM
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
