"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trash2 } from "lucide-react";
import { useCoachInsights } from "@/hooks/useCoachInsights";

const TYPE_COLOR: Record<string, string> = {
  SYSTEM: "var(--color-text-muted)",
  ACTION_REQUIRED: "var(--color-cream)",
  NUTRITION_OVERRIDE: "var(--color-bone)",
  DIRECTIVE: "var(--color-chrome)",
  PR_ALERT: "var(--color-bone)",
  WARNING: "var(--color-blood)",
};

const TYPE_TAG: Record<string, string> = {
  SYSTEM: "system",
  ACTION_REQUIRED: "act",
  NUTRITION_OVERRIDE: "fuel",
  DIRECTIVE: "directive",
  PR_ALERT: "pr",
  WARNING: "warn",
};

const SEEN_KEY = "anand-notif-seen-ids";

export function NotificationDropdown() {
  const messages = useCoachInsights();
  const [open, setOpen] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  // Load seen ids
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SEEN_KEY);
      if (raw) setSeenIds(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  // Mark as seen when opened
  useEffect(() => {
    if (!open) return;
    const ids = new Set([...seenIds, ...messages.map((m) => m.id)]);
    setSeenIds(ids);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(ids).slice(-200)));
    } catch {}
  }, [open, messages, seenIds]);

  // Click outside
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const unread = messages.filter((m) => !seenIds.has(m.id)).length;
  const display = [...messages].reverse().slice(0, 12);

  function clearAll() {
    const ids = new Set(messages.map((m) => m.id));
    setSeenIds(ids);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(ids).slice(-200)));
    } catch {}
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="relative grid h-9 w-9 place-items-center border border-border-subtle bg-[var(--color-bg-elevated)] text-text-secondary transition hover:border-border-strong hover:text-text-primary"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-[var(--color-bone)] px-1 font-mono text-[9px] font-bold text-[var(--color-bg-base)]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden border border-border-strong bg-[var(--color-bg-surface)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-[var(--color-bone)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-secondary">
                  coach signals
                </span>
              </div>
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted hover:text-text-primary"
              >
                <Trash2 className="h-3 w-3" />
                mark read
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {display.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-dim">
                    all quiet · coach has no new signals
                  </div>
                </div>
              ) : (
                <ul>
                  {display.map((m) => {
                    const isUnread = !seenIds.has(m.id);
                    return (
                      <li
                        key={m.id}
                        className="border-b border-border-subtle/40 px-4 py-3 transition hover:bg-[var(--color-bg-elevated)]/40"
                      >
                        <div className="flex items-start gap-2">
                          {isUnread && (
                            <span
                              className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-bone)]"
                              aria-label="unread"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="font-mono text-[9px] font-bold uppercase tracking-[0.22em]"
                                style={{ color: TYPE_COLOR[m.type] }}
                              >
                                {TYPE_TAG[m.type]}
                              </span>
                              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="mt-1 text-[12px] leading-snug text-text-secondary">
                              {m.text}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-border-subtle px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">
              live signals from the coach module
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
