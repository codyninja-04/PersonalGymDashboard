"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { useBodyMetrics, useTierStatus } from "@/hooks/useBodyMetrics";
import { SculptureSilhouette } from "./SculptureSilhouette";

export function HeroBanner() {
  const user = useAppStore((s) => s.user);
  const streak = useAppStore((s) => s.streak);
  const { weeksLeft, currentLeanMass, weekDelta } = useBodyMetrics();
  const tier = useTierStatus(streak);

  const trending = weekDelta < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden border border-border bg-[var(--color-bg-surface)]"
    >
      {/* Marble vignette */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[var(--color-cream)] opacity-[0.06] blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-[var(--color-bone)] opacity-[0.04] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Sculpture silhouette — David / classical figure watermark */}
      <div
        className="pointer-events-none absolute -right-12 -bottom-16 hidden h-[120%] w-[420px] text-[var(--color-cream)] opacity-[0.12] sm:block lg:opacity-[0.18]"
        aria-hidden
      >
        <SculptureSilhouette className="h-full w-full" />
      </div>
      {/* Mobile: smaller silhouette in corner */}
      <div
        className="pointer-events-none absolute -right-8 -bottom-6 block h-[280px] w-[180px] text-[var(--color-cream)] opacity-[0.12] sm:hidden"
        aria-hidden
      >
        <SculptureSilhouette className="h-full w-full" />
      </div>

      <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Left — display block */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 border border-[var(--color-bone)]/30 bg-[var(--color-bg-elevated)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--color-bone)]">
              <Sparkles className="h-3 w-3" />
              {user.phase}
            </span>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.28em]"
              style={{ color: tier.color }}
            >
              · {tier.label}
            </span>
          </div>

          <h1 className="font-display text-[44px] font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-[64px] sm:leading-[0.92]">
            <span className="block text-text-muted">Lift heavy.</span>
            <span className="block">Eat clean.</span>
            <span className="block">
              <span className="serif italic font-medium text-[var(--color-cream)]">Earn</span>{" "}
              <span className="text-[var(--color-bone)]">the mirror.</span>
            </span>
          </h1>

          <p className="max-w-xl text-[14px] leading-relaxed text-text-secondary">
            <span className="text-text-primary font-semibold num">{user.currentWeightKg.toFixed(1)}kg</span> at
            <span className="text-text-primary font-semibold num"> {(user.estimatedBF * 100).toFixed(1)}% BF</span>,
            holding <span className="text-[var(--color-cream)] font-semibold num">{currentLeanMass.toFixed(1)}kg</span> of lean.
            Roughly <span className="text-text-primary font-semibold">{weeksLeft}</span> weeks of disciplined work between you and the {(user.targetBF * 100).toFixed(0)}% target.
          </p>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-cream)]" />
            <span>this week · {trending ? "down" : "holding"} {Math.abs(weekDelta).toFixed(1)}kg</span>
            <span className="opacity-40">/</span>
            <span>streak · {streak}d</span>
            <span className="opacity-40">/</span>
            <span>tier · {tier.label.toLowerCase()}</span>
          </div>
        </div>

        {/* Right — vertical philosophy column */}
        <div className="relative flex flex-col justify-between gap-6 border-l border-border-subtle pl-6 sm:pl-8 lg:border-l lg:pl-10">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted">
              the principle
            </div>
            <p className="serif mt-3 text-2xl italic leading-snug text-text-secondary sm:text-[26px]">
              &ldquo;The mirror doesn&rsquo;t lie. Build the body that earns the reflection.&rdquo;
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--color-cream)]">
              — david laid
            </p>
          </div>

          <div className="space-y-3">
            <HeroStat label="Lean mass" value={`${currentLeanMass.toFixed(1)}kg`} hint={"protected this cycle"} />
            <HeroStat label="Streak" value={`${streak}d`} hint={tier.label.toLowerCase()} />
            <HeroStat label="Horizon" value={`${weeksLeft}w`} hint={`to ${(user.targetBF * 100).toFixed(0)}% bf`} />
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="relative flex items-center justify-between border-t border-border-subtle bg-[var(--color-bg-base)]/40 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted sm:px-10">
        <span>aesthetic · healthy · strong</span>
        <span className="hidden sm:inline">symmetry &gt; size · tempo &gt; ego · discipline &gt; motivation</span>
      </div>
    </motion.div>
  );
}

function HeroStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="flex items-end justify-between border-b border-border-subtle pb-2 last:border-0">
      <div>
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">{label}</div>
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{hint}</div>
      </div>
      <div className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-bone)] num">
        {value}
      </div>
    </div>
  );
}
