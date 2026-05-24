"use client";

import { useEffect, useState } from "react";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-[var(--color-bg-base)]">
        <div className="flex flex-col items-center gap-4">
          <div className="font-display text-2xl font-extrabold tracking-tight">FORGE</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-text-muted">
            loading the carve
          </div>
          <div className="relative h-px w-56 overflow-hidden bg-[var(--color-border-subtle)]">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-[var(--color-bone)] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
