"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LineChart, NotebookText, Beef, Settings } from "lucide-react";
import { cn } from "@/lib/utils/formatting";

const NAV = [
  { href: "/dashboard", label: "Dash", icon: Zap },
  { href: "/dashboard/analytics", label: "Gains", icon: LineChart },
  { href: "/dashboard/workout", label: "Lift", icon: NotebookText },
  { href: "/dashboard/fuel", label: "Fuel", icon: Beef },
  { href: "/dashboard/settings", label: "Profile", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-2 bottom-2 z-40 flex h-14 items-center justify-around rounded-2xl border border-border-strong bg-[rgba(15,15,23,0.85)] px-2 backdrop-blur-xl lg:hidden">
      {NAV.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] transition",
              active
                ? "text-[var(--color-accent-primary)]"
                : "text-text-muted",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="font-mono uppercase tracking-[0.12em]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
