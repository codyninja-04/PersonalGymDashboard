"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Sparkles, Activity } from "lucide-react";
import { useCoachInsights } from "@/hooks/useCoachInsights";
import { cn } from "@/lib/utils/formatting";

const TYPE_SPEED = 18;

const TYPE_COLOR: Record<string, string> = {
  SYSTEM: "var(--color-text-secondary)",
  ACTION_REQUIRED: "var(--color-accent-amber)",
  NUTRITION_OVERRIDE: "var(--color-accent-secondary)",
  DIRECTIVE: "var(--color-accent-tertiary)",
  PR_ALERT: "var(--color-accent-primary)",
  WARNING: "var(--color-accent-primary)",
};

const TYPE_TAG: Record<string, string> = {
  SYSTEM: "[SYSTEM]",
  ACTION_REQUIRED: "[ACTION_REQUIRED]",
  NUTRITION_OVERRIDE: "[NUTRITION_OVERRIDE]",
  DIRECTIVE: "[DIRECTIVE]",
  PR_ALERT: "[PR_ALERT]",
  WARNING: "[WARNING]",
};

export function AICoachTerminal() {
  const messages = useCoachInsights();
  const [visibleCount, setVisibleCount] = useState(1);
  const [currentText, setCurrentText] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount > messages.length) return;
    const current = messages[visibleCount - 1];
    if (!current) return;
    if (currentText.length >= current.text.length) {
      const t = setTimeout(() => {
        setVisibleCount((c) => Math.min(messages.length, c + 1));
        setCurrentText("");
      }, 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setCurrentText(current.text.slice(0, currentText.length + 1));
    }, TYPE_SPEED);
    return () => clearTimeout(t);
  }, [visibleCount, currentText, messages]);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [visibleCount, currentText]);

  const elapsed = useMemo(() => Math.floor(Math.random() * 200 + 50), []);

  return (
    <div className="rounded-[18px] border border-border-strong bg-gradient-to-b from-[#050508] to-[#0a0a14] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between border-b border-border-subtle/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent-primary)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent-amber)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent-secondary)]" />
          </span>
          <Terminal className="ml-2 h-3.5 w-3.5 text-text-muted" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            forge://coach.live
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-text-dim">
          <span className="flex items-center gap-1">
            <Activity className="h-2.5 w-2.5 text-[var(--color-accent-secondary)]" />
            uplink stable
          </span>
          <span>{elapsed}ms</span>
          <Sparkles className="h-3 w-3 text-[var(--color-accent-tertiary)]" />
        </div>
      </div>

      <div
        ref={ref}
        className="max-h-[280px] min-h-[200px] overflow-y-auto px-5 py-4 font-mono text-[12px] leading-[1.75]"
      >
        {messages.slice(0, visibleCount - 1).map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="flex gap-2"
          >
            <span className="text-[var(--color-accent-secondary)]">&gt;</span>
            <span style={{ color: TYPE_COLOR[m.type] }}>{TYPE_TAG[m.type]}</span>
            <span className="text-text-secondary">{m.text}</span>
          </motion.div>
        ))}
        {messages[visibleCount - 1] && (
          <div className="flex gap-2">
            <span className="text-[var(--color-accent-secondary)]">&gt;</span>
            <span style={{ color: TYPE_COLOR[messages[visibleCount - 1].type] }}>
              {TYPE_TAG[messages[visibleCount - 1].type]}
            </span>
            <span className="text-text-secondary">
              {currentText}
              <span
                className={cn(
                  "ml-0.5 inline-block h-3 w-1.5 -translate-y-[1px] bg-[var(--color-accent-secondary)] align-middle",
                )}
                style={{ animation: "blink 1.1s steps(2,start) infinite" }}
              />
            </span>
          </div>
        )}
        {visibleCount >= messages.length && currentText === "" && (
          <div className="mt-2 flex gap-2 text-text-dim">
            <span className="text-[var(--color-accent-secondary)]">&gt;</span>
            <span>standing by for telemetry...</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle/60 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-text-dim">
        <span>forge.os · coach module · adaptive</span>
        <span className="text-[var(--color-accent-secondary)]">● live</span>
      </div>
    </div>
  );
}
