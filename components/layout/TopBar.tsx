"use client";

import { useEffect, useState } from "react";
import { Search, Command } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { CommandPalette } from "./CommandPalette";
import { NotificationDropdown } from "./NotificationDropdown";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Late shift";
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  if (hour < 21) return "Evening";
  return "Night ops";
}

function getSubtext() {
  const lines = [
    "Show up. Repeat tomorrow.",
    "Carve the marble.",
    "The reps add up.",
    "Earn the mirror.",
    "Suffer well today.",
    "Discipline is identity.",
    "Tempo over ego.",
    "Hold the line.",
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

export function TopBar() {
  const user = useAppStore((s) => s.user);
  const [time, setTime] = useState<string>("--:--:--");
  const [subtext] = useState(getSubtext);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 -mx-4 mb-6 flex items-center justify-between border-b border-border-subtle bg-[var(--color-bg-base)]/85 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cream)]">
              <span className="absolute inset-0 inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cream)] opacity-75" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted">
              live · {time}
            </span>
          </div>
          <div className="hidden h-5 w-px bg-border-subtle md:block" />
          <div className="hidden min-w-0 md:block">
            <div className="font-display text-lg font-bold tracking-tight">
              {getGreeting()}, <span className="text-[var(--color-bone)]">{user.name}</span>.
            </div>
            <div className="truncate font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              {subtext}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden h-9 items-center gap-2 border border-border-subtle bg-[var(--color-bg-elevated)] px-3 text-[12px] text-text-muted transition hover:border-border-strong hover:text-text-primary md:inline-flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Find exercise</span>
            <span className="ml-3 inline-flex items-center gap-1 border border-border bg-[var(--color-bg-base)] px-1.5 py-0.5 font-mono text-[9px]">
              <Command className="h-2.5 w-2.5" />K
            </span>
          </button>
          <button
            onClick={() => setPaletteOpen(true)}
            className="grid h-9 w-9 place-items-center border border-border-subtle bg-[var(--color-bg-elevated)] text-text-secondary transition hover:border-border-strong hover:text-text-primary md:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <NotificationDropdown />
        </div>
      </header>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
