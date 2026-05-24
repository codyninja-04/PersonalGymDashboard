"use client";

import { motion } from "framer-motion";
import { Ruler, Camera } from "lucide-react";

export function BodyHero({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-none border border-border-strong bg-[var(--color-bg-surface)] p-6 sm:p-8"
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--color-cream)]">
        the body · measurements & mirror
      </div>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-[40px] sm:leading-tight">
        The tape doesn&rsquo;t lie. <span className="serif italic text-[var(--color-cream)]">Neither does the mirror.</span>
      </h1>
      <p className="mt-2 max-w-2xl text-[13px] text-text-secondary">
        Weight alone can mislead during recomp and lean bulks. Track measurements weekly + take progress photos in the same lighting every Sunday morning. Future-you will read this back as proof of the work.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
        <Tile icon={<Ruler className="h-3.5 w-3.5" />} label="entries logged" value={`${count}`} />
        <Tile icon={<Camera className="h-3.5 w-3.5" />} label="photo cadence" value="weekly" />
      </div>
    </motion.div>
  );
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-border-subtle bg-[var(--color-bg-elevated)] px-3 py-2">
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        <span className="text-[var(--color-cream)]">{icon}</span>
        {label}
      </div>
      <div className="mt-0.5 font-display text-xl font-extrabold num">{value}</div>
    </div>
  );
}
