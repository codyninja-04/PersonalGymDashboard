"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Beef,
  ChevronUp,
  Dumbbell,
  Flame,
  LineChart,
  LogOut,
  NotebookText,
  Settings,
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { useTierStatus } from "@/hooks/useBodyMetrics";
import { cn } from "@/lib/utils/formatting";

const NAV = [
  { href: "/dashboard", label: "Today", icon: Activity },
  { href: "/dashboard/analytics", label: "Progress", icon: LineChart },
  { href: "/dashboard/workout", label: "Train", icon: Dumbbell },
  { href: "/dashboard/fuel", label: "Fuel", icon: Beef },
  { href: "/dashboard/settings", label: "Profile", icon: Settings },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const user = useAppStore((s) => s.user);
  const streak = useAppStore((s) => s.streak);
  const tier = useTierStatus(streak);
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = (user.name || email || "A").charAt(0).toUpperCase();
  void NotebookText;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border-subtle bg-[var(--color-bg-surface)] lg:flex">
      <div className="flex h-[72px] items-center gap-3 border-b border-border-subtle px-5">
        <div className="grid h-9 w-9 place-items-center border border-[var(--color-bone)] bg-[var(--color-bg-base)] font-display text-base font-extrabold">
          {initial}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-base font-extrabold tracking-tight">
            FORGE
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-text-muted">
            {user.name}'s carve
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5">
        <div className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[0.32em] text-text-dim">
          system
        </div>
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 text-sm transition-all",
                    active
                      ? "bg-[var(--color-bg-elevated)] text-[var(--color-bone)]"
                      : "text-text-secondary hover:bg-[var(--color-bg-elevated)]/50 hover:text-text-primary",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-y-1 left-0 w-[2px] bg-[var(--color-bone)]"
                    />
                  )}
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 px-3">
          <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.32em] text-text-dim">
            phase
          </div>
          <div className="border border-border-subtle bg-[var(--color-bg-elevated)] p-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cream)] shadow-[0_0_8px_var(--color-cream)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                {user.phase}
              </span>
            </div>
            <div className="mt-3 h-px bg-[var(--color-border)]" />
            <div className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
              <span>current bf</span>
              <span className="text-text-secondary num">{(user.estimatedBF * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
              <span>target</span>
              <span className="text-[var(--color-cream)] num">{(user.targetBF * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative border-t border-border-subtle p-3">
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.16 }}
              className="absolute inset-x-3 bottom-[100px] border border-border-strong bg-[var(--color-bg-elevated)] p-1 shadow-2xl"
            >
              <div className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">
                signed in
              </div>
              <div className="truncate px-3 pb-2 text-[12px] text-text-secondary">{email}</div>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-text-secondary transition hover:bg-[var(--color-bg-raised)] hover:text-[var(--color-bone)]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setMenuOpen((s) => !s)}
          className="w-full border border-border-subtle bg-[var(--color-bg-elevated)] p-3 text-left transition hover:border-border-strong"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center border border-border-strong bg-[var(--color-bg-base)] font-display text-sm font-extrabold">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{user.name}</div>
              <div className="truncate font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                {email}
              </div>
            </div>
            <ChevronUp
              className={cn(
                "h-3.5 w-3.5 text-text-muted transition-transform",
                menuOpen && "rotate-180",
              )}
            />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-2.5">
            <div className="flex items-center gap-1.5">
              <Flame className="h-3 w-3 text-[var(--color-cream)]" />
              <span className="font-mono text-[10px] font-bold text-[var(--color-bone)]">
                {streak}d
              </span>
            </div>
            <span
              className="font-mono text-[9px] uppercase tracking-[0.22em]"
              style={{ color: tier.color }}
            >
              {tier.label}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
