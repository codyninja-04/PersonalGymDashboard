"use client";

import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function ProgressiveOverloadBadge({ increment = 2.5 }: { increment?: number }) {
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-secondary-soft)] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-secondary)] ring-1 ring-inset ring-[var(--color-accent-secondary)]/40 shadow-[0_0_12px_var(--color-accent-secondary)]"
    >
      <ArrowUp className="h-2.5 w-2.5" />
      +{increment} kg
    </motion.span>
  );
}
