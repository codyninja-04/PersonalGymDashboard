"use client";

import { PHILOSOPHY_TICKER } from "@/lib/data/quotes";

export function PhilosophyTicker() {
  const lines = [...PHILOSOPHY_TICKER, ...PHILOSOPHY_TICKER];
  return (
    <div className="relative overflow-hidden border-y border-border-subtle bg-[var(--color-bg-surface)]/60 py-3">
      <div className="absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--color-bg-base)] to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--color-bg-base)] to-transparent" />
      <div className="flex whitespace-nowrap" style={{ animation: "marquee 38s linear infinite" }}>
        {lines.map((line, i) => (
          <span
            key={i}
            className="mx-6 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-text-muted"
          >
            <span className="text-[var(--color-cream)]">◆</span>
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
