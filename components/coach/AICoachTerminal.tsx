"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Activity, Send, Sparkles, Terminal, Loader2 } from "lucide-react";
import { useCoachInsights } from "@/hooks/useCoachInsights";
import { cn } from "@/lib/utils/formatting";
import { askCoachAction, dailyBriefingAction } from "@/app/actions/ai";
import type { CoachMessage } from "@/types/metrics";

const TYPE_SPEED = 16;

const TYPE_COLOR: Record<string, string> = {
  SYSTEM: "var(--color-text-secondary)",
  ACTION_REQUIRED: "var(--color-cream)",
  NUTRITION_OVERRIDE: "var(--color-cream)",
  DIRECTIVE: "var(--color-chrome)",
  PR_ALERT: "var(--color-bone)",
  WARNING: "var(--color-blood)",
};

const TYPE_TAG: Record<string, string> = {
  SYSTEM: "[SYSTEM]",
  ACTION_REQUIRED: "[ACT]",
  NUTRITION_OVERRIDE: "[FUEL]",
  DIRECTIVE: "[BRIEF]",
  PR_ALERT: "[PR]",
  WARNING: "[WARN]",
};

const BRIEFING_CACHE_KEY = "forge-ai-briefing";

interface CachedBriefing {
  date: string;
  text: string;
  provider?: string;
}

export function AICoachTerminal() {
  const ruleMessages = useCoachInsights();
  const [aiMessages, setAiMessages] = useState<CoachMessage[]>([]);
  const [visibleCount, setVisibleCount] = useState(1);
  const [currentText, setCurrentText] = useState("");
  const [question, setQuestion] = useState("");
  const [pending, startTransition] = useTransition();
  const [briefingProvider, setBriefingProvider] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => [...ruleMessages, ...aiMessages], [ruleMessages, aiMessages]);

  // Fetch daily briefing once per day (cached locally)
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let cached: CachedBriefing | null = null;
    try {
      const raw = localStorage.getItem(BRIEFING_CACHE_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch {}

    if (cached && cached.date === today) {
      setAiMessages([
        {
          id: `brief-${cached.date}`,
          type: "DIRECTIVE",
          text: cached.text,
          timestamp: new Date().toISOString(),
        },
      ]);
      setBriefingProvider(cached.provider ?? null);
      return;
    }

    const storedIntent =
      typeof window !== "undefined"
        ? (() => {
            try {
              const raw = localStorage.getItem("anand-intent-today");
              if (!raw) return undefined;
              const parsed = JSON.parse(raw);
              return parsed.date === today ? parsed.word : undefined;
            } catch {
              return undefined;
            }
          })()
        : undefined;

    dailyBriefingAction(storedIntent).then((res) => {
      if (res.ok && res.text) {
        const msg: CoachMessage = {
          id: `brief-${today}`,
          type: "DIRECTIVE",
          text: res.text,
          timestamp: new Date().toISOString(),
        };
        setAiMessages([msg]);
        setBriefingProvider(res.provider ?? null);
        try {
          localStorage.setItem(
            BRIEFING_CACHE_KEY,
            JSON.stringify({ date: today, text: res.text, provider: res.provider }),
          );
        } catch {}
      } else if (res.notConfigured) {
        // Quiet — fall back to rule-based only
      }
    });
  }, []);

  // Typewriter
  useEffect(() => {
    if (visibleCount > messages.length) return;
    const current = messages[visibleCount - 1];
    if (!current) return;
    if (currentText.length >= current.text.length) {
      const t = setTimeout(() => {
        setVisibleCount((c) => Math.min(messages.length, c + 1));
        setCurrentText("");
      }, 280);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setCurrentText(current.text.slice(0, currentText.length + 1));
    }, TYPE_SPEED);
    return () => clearTimeout(t);
  }, [visibleCount, currentText, messages]);

  // Auto-scroll
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [visibleCount, currentText]);

  function ask() {
    const q = question.trim();
    if (!q || pending) return;
    // Echo the user's question into the feed
    const userMsg: CoachMessage = {
      id: `q-${Date.now()}`,
      type: "SYSTEM",
      text: `> ${q}`,
      timestamp: new Date().toISOString(),
    };
    setAiMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    startTransition(async () => {
      const res = await askCoachAction(q);
      if (res.ok && res.text) {
        const reply: CoachMessage = {
          id: `a-${Date.now()}`,
          type: "DIRECTIVE",
          text: res.text,
          timestamp: new Date().toISOString(),
        };
        setAiMessages((prev) => [...prev, reply]);
      } else if (res.notConfigured) {
        setAiMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: "WARNING",
            text: "AI not configured. Add at least one GEMINI / GROQ / OPENROUTER key in .env.local to enable chat.",
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        setAiMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: "WARNING",
            text: `Coach offline: ${res.error?.slice(0, 120) ?? "unknown error"}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    });
  }

  return (
    <div className="border border-border-strong bg-gradient-to-b from-[#050505] to-[#0a0a0a] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-blood)] opacity-80" />
            <span className="h-2 w-2 rounded-full bg-[var(--color-cream)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--color-bone)]" />
          </span>
          <Terminal className="ml-2 h-3.5 w-3.5 text-text-muted" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            forge://coach.live
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-text-dim">
          <span className="flex items-center gap-1">
            <Activity className="h-2.5 w-2.5 text-[var(--color-cream)]" />
            {briefingProvider ? `ai · ${briefingProvider}` : "rule engine"}
          </span>
          <Sparkles className="h-3 w-3 text-[var(--color-chrome)]" />
        </div>
      </div>

      <div
        ref={ref}
        className="max-h-[340px] min-h-[220px] overflow-y-auto px-5 py-4 font-mono text-[12px] leading-[1.75]"
      >
        {messages.slice(0, Math.max(0, visibleCount - 1)).map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-1.5 flex gap-2"
          >
            <span className="text-[var(--color-cream)]">&gt;</span>
            <span style={{ color: TYPE_COLOR[m.type] }}>{TYPE_TAG[m.type]}</span>
            <span className="text-text-secondary">{m.text}</span>
          </motion.div>
        ))}
        {messages[visibleCount - 1] && (
          <div className="flex gap-2">
            <span className="text-[var(--color-cream)]">&gt;</span>
            <span style={{ color: TYPE_COLOR[messages[visibleCount - 1].type] }}>
              {TYPE_TAG[messages[visibleCount - 1].type]}
            </span>
            <span className="text-text-secondary">
              {currentText}
              <span
                className={cn(
                  "ml-0.5 inline-block h-3 w-1.5 -translate-y-[1px] bg-[var(--color-cream)] align-middle",
                )}
                style={{ animation: "blink 1.1s steps(2,start) infinite" }}
              />
            </span>
          </div>
        )}
        {visibleCount >= messages.length && currentText === "" && !pending && (
          <div className="mt-2 flex gap-2 text-text-dim">
            <span className="text-[var(--color-cream)]">&gt;</span>
            <span>awaiting your question...</span>
          </div>
        )}
        {pending && (
          <div className="mt-2 flex items-center gap-2 text-text-muted">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>coach is thinking...</span>
          </div>
        )}
      </div>

      {/* Ask-the-Coach input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="flex items-center gap-2 border-t border-border-subtle bg-[var(--color-bg-base)] p-2"
      >
        <span className="font-mono text-[12px] text-[var(--color-cream)] pl-2">&gt;</span>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="ask the coach anything..."
          disabled={pending}
          className="flex-1 bg-transparent font-mono text-[12px] text-text-primary outline-none placeholder:text-text-dim disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending || !question.trim()}
          className="inline-flex h-8 items-center gap-1.5 bg-[var(--color-bone)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] transition hover:opacity-90 disabled:opacity-40"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Send className="h-3 w-3" /> send</>}
        </button>
      </form>

      <div className="flex items-center justify-between border-t border-border-subtle px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-text-dim">
        <span>forge.os · coach module · adaptive</span>
        <span className="text-[var(--color-cream)]">● live</span>
      </div>
    </div>
  );
}
