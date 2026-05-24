"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Quote as QuoteIcon } from "lucide-react";
import { getQuoteForToday } from "@/lib/data/quotes";
import { useAppStore } from "@/lib/store/useAppStore";

export function DailyQuote() {
  const streak = useAppStore((s) => s.streak);
  const quote = useMemo(() => getQuoteForToday(streak), [streak]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden surface px-6 py-7 sm:px-8 sm:py-9"
    >
      <div className="absolute inset-y-0 left-0 w-[2px] bg-[var(--color-bone)] opacity-80" />
      <div className="absolute -top-4 -right-2 text-[var(--color-bone)] opacity-[0.05]">
        <QuoteIcon className="h-32 w-32" strokeWidth={1} />
      </div>

      <div className="relative">
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted">
          <span className="h-px w-6 bg-[var(--color-bone)] opacity-40" />
          today's line
        </div>
        <p className="serif text-2xl leading-snug text-text-primary sm:text-3xl sm:leading-snug italic">
          &ldquo;{quote.text}&rdquo;
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--color-cream)]">
            — {quote.author}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
