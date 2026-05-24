import { cn } from "@/lib/utils/formatting";

type Variant = "primary" | "secondary" | "tertiary" | "amber" | "muted";

const variants: Record<Variant, string> = {
  primary: "bg-[var(--color-accent-primary-soft)] text-[var(--color-accent-primary)] ring-1 ring-inset ring-[var(--color-accent-primary)]/30",
  secondary: "bg-[var(--color-accent-secondary-soft)] text-[var(--color-accent-secondary)] ring-1 ring-inset ring-[var(--color-accent-secondary)]/30",
  tertiary: "bg-[var(--color-accent-tertiary-soft)] text-[var(--color-accent-tertiary)] ring-1 ring-inset ring-[var(--color-accent-tertiary)]/30",
  amber: "bg-[rgba(255,181,71,0.16)] text-[var(--color-accent-amber)] ring-1 ring-inset ring-[var(--color-accent-amber)]/30",
  muted: "bg-[#1f1f30] text-text-muted ring-1 ring-inset ring-white/5",
};

export function Badge({
  children,
  variant = "muted",
  className,
  glow = false,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  glow?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        variants[variant],
        glow && "shadow-[0_0_12px_currentColor]",
        className,
      )}
    >
      {children}
    </span>
  );
}
