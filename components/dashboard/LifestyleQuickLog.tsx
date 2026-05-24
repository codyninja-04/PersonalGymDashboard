"use client";

import { useEffect, useState, useTransition } from "react";
import { Moon, Footprints, Battery, Activity, Loader2, Check } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { logLifestyleAction } from "@/app/actions/lifestyle";

interface Props {
  initial?: {
    sleep_hours?: number | null;
    steps?: number | null;
    energy_rating?: number | null;
    soreness_rating?: number | null;
  };
}

export function LifestyleQuickLog({ initial }: Props) {
  const [sleep, setSleep] = useState(initial?.sleep_hours?.toString() ?? "");
  const [steps, setSteps] = useState(initial?.steps?.toString() ?? "");
  const [energy, setEnergy] = useState(initial?.energy_rating ?? 0);
  const [soreness, setSoreness] = useState(initial?.soreness_rating ?? 0);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initial) {
      setSleep(initial.sleep_hours?.toString() ?? "");
      setSteps(initial.steps?.toString() ?? "");
      setEnergy(initial.energy_rating ?? 0);
      setSoreness(initial.soreness_rating ?? 0);
    }
  }, [initial]);

  function save() {
    startTransition(async () => {
      await logLifestyleAction({
        sleep_hours: sleep ? parseFloat(sleep) : null,
        steps: steps ? parseInt(steps, 10) : null,
        energy_rating: energy > 0 ? energy : null,
        soreness_rating: soreness > 0 ? soreness : null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <Card>
      <CardHeader
        eyebrow="today · recovery telemetry"
        action={
          <button
            onClick={save}
            disabled={pending}
            className="inline-flex h-8 items-center gap-1.5 bg-[var(--color-bone)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] hover:opacity-90 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : saved ? <><Check className="h-3 w-3" /> saved</> : "save"}
          </button>
        }
      >
        Lifestyle log
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <NumField icon={<Moon className="h-3.5 w-3.5" />} label="sleep · h" value={sleep} onChange={setSleep} placeholder="7.5" step="0.25" />
          <NumField icon={<Footprints className="h-3.5 w-3.5" />} label="steps" value={steps} onChange={setSteps} placeholder="8500" step="100" />
        </div>
        <RatingPicker icon={<Battery className="h-3.5 w-3.5" />} label="energy" value={energy} onChange={setEnergy} />
        <RatingPicker icon={<Activity className="h-3.5 w-3.5" />} label="soreness" value={soreness} onChange={setSoreness} />
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">
          coach reads these → adjusts tomorrow's intensity
        </p>
      </CardBody>
    </Card>
  );
}

function NumField({
  icon, label, value, onChange, placeholder, step,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">
        <span className="text-[var(--color-cream)]">{icon}</span>
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        step={step ?? "1"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 border border-border bg-[var(--color-bg-base)] px-2.5 font-mono text-[13px] text-text-primary outline-none placeholder:text-text-dim focus:border-[var(--color-bone)]"
      />
    </label>
  );
}

function RatingPicker({
  icon, label, value, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">
        <span className="text-[var(--color-cream)]">{icon}</span>
        {label}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? 0 : n)}
            className={`h-7 w-7 border font-mono text-[10px] transition ${
              value >= n
                ? "border-[var(--color-bone)] bg-[var(--color-bone)] text-[var(--color-bg-base)]"
                : "border-border-subtle bg-[var(--color-bg-elevated)] text-text-muted hover:border-border-strong"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
