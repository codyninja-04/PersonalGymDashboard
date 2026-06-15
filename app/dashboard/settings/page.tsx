"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { User2, Target, Zap, Save, Loader2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/lib/store/useAppStore";
import { useBodyMetrics } from "@/hooks/useBodyMetrics";
import { updateProfileAction } from "@/app/actions/profile";
import { PhaseSelector } from "@/components/settings/PhaseSelector";
import { SplitBuilder } from "@/components/settings/SplitBuilder";
import { TutorialReplayButton } from "@/components/onboarding/TutorialReplayButton";

export default function SettingsPage() {
  const user = useAppStore((s) => s.user);
  const hydrate = useAppStore((s) => s.hydrate);
  const { tdee, weeksLeft } = useBodyMetrics();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: user.name,
    age: user.age,
    height_cm: user.heightCm,
    current_weight_kg: user.currentWeightKg,
    estimated_bf: user.estimatedBF,
    target_bf: user.targetBF,
    phase: user.phase,
    goal: user.goal,
  });

  function save() {
    startTransition(async () => {
      await updateProfileAction({
        ...form,
        onboarded: true,
      });
      // Optimistic local update
      hydrate({
        profile: {
          id: "local",
          ...form,
          gender: user.gender,
          onboarded: true,
          created_at: "",
          updated_at: new Date().toISOString(),
        },
        weights: [],
        bfs: [],
        prs: [],
        sessions: [],
        todayFuel: null,
        recentFuel: [],
        measurements: [],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      <TopBar />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[22px] border border-border-strong bg-gradient-to-br from-[#11111c] to-[#0a0a14] p-6"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
          settings · profile
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          The athlete profile.
        </h1>
        <p className="mt-2 text-[13px] text-text-secondary">
          Configure your stats once. The dashboard tailors itself to these values.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            eyebrow="identity · edit"
            action={
              <button
                onClick={save}
                disabled={pending}
                className="inline-flex h-9 items-center gap-1.5 bg-[var(--color-bone)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] transition hover:opacity-90 disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                {saved ? "saved" : "save"}
              </button>
            }
          >
            <span className="inline-flex items-center gap-1.5">
              <User2 className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" />
              Profile
            </span>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <TextField
                label="Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <NumField
                label="Age"
                value={form.age}
                onChange={(v) => setForm({ ...form, age: v })}
              />
              <NumField
                label="Height (cm)"
                value={form.height_cm}
                onChange={(v) => setForm({ ...form, height_cm: v })}
              />
              <NumField
                label="Weight (kg)"
                value={form.current_weight_kg}
                step={0.1}
                onChange={(v) => setForm({ ...form, current_weight_kg: v })}
              />
              <NumField
                label="Body Fat %"
                value={Math.round(form.estimated_bf * 1000) / 10}
                step={0.1}
                onChange={(v) => setForm({ ...form, estimated_bf: (v || 0) / 100 })}
              />
              <NumField
                label="Target BF %"
                value={Math.round(form.target_bf * 1000) / 10}
                step={0.1}
                onChange={(v) => setForm({ ...form, target_bf: (v || 0) / 100 })}
              />
              <SelectField
                label="Goal"
                value={form.goal}
                options={["recomp", "cut", "bulk"]}
                onChange={(v) => setForm({ ...form, goal: v as typeof form.goal })}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader eyebrow="energy">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[var(--color-accent-amber)]" />
              Caloric Math
            </span>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <StatLine label="TDEE" value={`${tdee} kcal`} accent="var(--color-accent-amber)" />
              <StatLine label="Cut deficit" value="-450 kcal/day" accent="var(--color-accent-primary)" />
              <StatLine label="Projected drop" value="0.4 kg/wk" accent="var(--color-accent-secondary)" />
              <StatLine label="Weeks to target" value={`${weeksLeft}w`} accent="var(--color-accent-tertiary)" />
            </div>
          </CardBody>
        </Card>
      </div>

      <PhaseSelector />

      <SplitBuilder />

      <Card>
        <CardHeader
          eyebrow="objectives · long horizon"
          action={<Badge variant="primary" glow><Target className="h-3 w-3" /> the arc</Badge>}
        >
          Mission Parameters
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Mission step="01" title="Hit your target BF" desc="Lock in a body fat you can hold year-round. Visible progress, sustainable setpoint." accent="var(--color-bone)" />
            <Mission step="02" title="Stay consistent" desc="Train your split, log your food, show up on the days that count. Streaks build physiques." accent="var(--color-chrome)" />
            <Mission step="03" title="Get stronger over time" desc="Add reps or weight every week you can. Progressive overload is the whole game." accent="var(--color-cream)" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader eyebrow="help · onboarding">New here, or want a refresher?</CardHeader>
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-md text-[13px] text-text-secondary">
              Replay the quick walkthrough any time. It covers every page and how the dashboard
              adapts to your numbers.
            </p>
            <TutorialReplayButton />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  wide,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  wide?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-border-subtle bg-[var(--color-bg-elevated)] px-3 font-mono text-[13px] outline-none focus:border-[var(--color-accent-primary)]"
      />
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-10 rounded-lg border border-border-subtle bg-[var(--color-bg-elevated)] px-3 font-mono text-[13px] outline-none focus:border-[var(--color-accent-primary)]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-border-subtle bg-[var(--color-bg-elevated)] px-3 font-mono text-[12px] uppercase tracking-[0.12em] outline-none focus:border-[var(--color-accent-primary)]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatLine({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-subtle/60 bg-[var(--color-bg-elevated)]/60 px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">{label}</span>
      <span className="font-display text-base font-bold num" style={{ color: accent }}>{value}</span>
    </div>
  );
}

function Mission({ step, title, desc, accent }: { step: string; title: string; desc: string; accent: string }) {
  return (
    <div className="relative rounded-xl border border-border-subtle/60 bg-[var(--color-bg-elevated)]/60 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
        objective {step}
      </div>
      <div className="mt-1 font-display text-lg font-semibold">{title}</div>
      <div className="mt-1 text-[12px] text-text-muted">{desc}</div>
    </div>
  );
}
