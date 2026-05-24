"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/formatting";

type CardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  glow?: "primary" | "secondary" | "tertiary" | "none";
  strong?: boolean;
  children?: ReactNode;
};

export function Card({
  glow = "none",
  strong = false,
  className,
  children,
  ...props
}: CardProps) {
  const glowClass = {
    primary: "before:bg-[radial-gradient(400px_200px_at_50%_-20%,rgba(255,51,102,0.22),transparent)]",
    secondary: "before:bg-[radial-gradient(400px_200px_at_50%_-20%,rgba(0,255,170,0.18),transparent)]",
    tertiary: "before:bg-[radial-gradient(400px_200px_at_50%_-20%,rgba(123,97,255,0.22),transparent)]",
    none: "",
  }[glow];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden",
        strong ? "glass-strong" : "glass",
        "shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]",
        "before:absolute before:inset-0 before:pointer-events-none before:opacity-80",
        glowClass,
        className,
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function CardHeader({
  children,
  className,
  eyebrow,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 px-5 pt-5 pb-3",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        {eyebrow && (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            {eyebrow}
          </span>
        )}
        <div className="text-sm font-medium text-text-primary">{children}</div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-5 pb-5", className)}>{children}</div>;
}
