"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { signInAction, signUpAction } from "@/app/auth/actions";

type Mode = "signin" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result =
        mode === "signin" ? await signInAction(formData) : await signUpAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-[var(--color-accent-primary)] opacity-25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[var(--color-accent-tertiary)] opacity-25 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 neon-grid opacity-30" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/login" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] via-[var(--color-accent-tertiary)] to-[var(--color-accent-secondary)] grid place-items-center font-mono text-base font-bold text-white shadow-[0_0_24px_rgba(255,51,102,0.5)]">
              A
            </div>
            <div>
              <div className="font-display text-base font-extrabold tracking-tight">
                FORGE
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-text-muted">
                aesthetic · healthy · strong
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="rounded-[22px] border border-border-strong bg-[rgba(15,15,23,0.7)] p-6 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-8"
        >
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--color-cream)]">
            {mode === "signin" ? "log in" : "create account"}
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            {mode === "signin" ? "Welcome back." : "Carve something real."}
          </h1>
          <p className="mt-1 text-[13px] text-text-secondary">
            {mode === "signin"
              ? "Resume the work."
              : "Free, forever. The body you want is on the other side of consistent reps."}
          </p>
          <p className="mt-3 serif text-[14px] italic text-text-muted">
            &ldquo;{mode === "signin" ? "Show up on the days you don't want to." : "It's never too late to start."}&rdquo;
          </p>

          <form action={submit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <Field
                icon={<User className="h-4 w-4" />}
                name="name"
                type="text"
                placeholder="Name"
                autoComplete="name"
              />
            )}
            <Field
              icon={<Mail className="h-4 w-4" />}
              name="email"
              type="email"
              placeholder="you@domain.com"
              autoComplete="email"
              required
            />
            <Field
              icon={<Lock className="h-4 w-4" />}
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
            />

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-[var(--color-accent-primary)]/40 bg-[var(--color-accent-primary-soft)] px-3 py-2 text-[12px] text-[var(--color-accent-primary)]">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="group relative mt-2 inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden bg-[var(--color-bone)] font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-bg-base)] transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "log in" : "create account"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between border-t border-border-subtle/60 pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            {mode === "signin" ? (
              <>
                <span>new here?</span>
                <Link
                  href="/signup"
                  className="text-[var(--color-cream)] hover:text-[var(--color-bone)]"
                >
                  create account →
                </Link>
              </>
            ) : (
              <>
                <span>already in?</span>
                <Link
                  href="/login"
                  className="text-[var(--color-cream)] hover:text-[var(--color-bone)]"
                >
                  log in →
                </Link>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-center"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-text-dim">
            marble doesn&rsquo;t ask for permission
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <label className="relative block">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
        {icon}
      </span>
      <input
        {...props}
        className="h-11 w-full rounded-lg border border-border-subtle bg-[var(--color-bg-elevated)] pl-10 pr-3 font-mono text-[13px] text-text-primary outline-none transition placeholder:text-text-dim focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/30"
      />
    </label>
  );
}
