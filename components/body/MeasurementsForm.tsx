"use client";

import { useState, useTransition } from "react";
import { Loader2, Ruler, Save, Check } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { logMeasurementAction } from "@/app/actions/measurements";

const FIELDS: Array<{ key: keyof FormState; label: string }> = [
  { key: "waist_cm", label: "Waist" },
  { key: "chest_cm", label: "Chest" },
  { key: "arm_cm", label: "Arm" },
  { key: "neck_cm", label: "Neck" },
  { key: "thigh_cm", label: "Thigh" },
  { key: "hip_cm", label: "Hip" },
];

interface FormState {
  waist_cm: string;
  chest_cm: string;
  arm_cm: string;
  neck_cm: string;
  thigh_cm: string;
  hip_cm: string;
  notes: string;
}

export function MeasurementsForm({ onSaved }: { onSaved?: () => void }) {
  const [form, setForm] = useState<FormState>({
    waist_cm: "",
    chest_cm: "",
    arm_cm: "",
    neck_cm: "",
    thigh_cm: "",
    hip_cm: "",
    notes: "",
  });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function setField(k: keyof FormState, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function save() {
    startTransition(async () => {
      const payload: Record<string, number | string | null> = {};
      FIELDS.forEach(({ key }) => {
        const v = form[key];
        payload[key] = v ? parseFloat(v) : null;
      });
      payload.notes = form.notes || null;
      await logMeasurementAction(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved?.();
    });
  }

  return (
    <Card>
      <CardHeader
        eyebrow="cold measure · ideally morning, post-bathroom"
        action={
          <button
            onClick={save}
            disabled={pending}
            className="inline-flex h-9 items-center gap-1.5 bg-[var(--color-bone)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-bg-base)] hover:opacity-90 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : saved ? <><Check className="h-3 w-3" /> saved</> : <><Save className="h-3 w-3" /> log</>}
          </button>
        }
      >
        <span className="inline-flex items-center gap-2">
          <Ruler className="h-4 w-4 text-[var(--color-cream)]" />
          Today's measurements
        </span>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FIELDS.map(({ key, label }) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">
                {label} (cm)
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
                placeholder="—"
                className="h-11 border border-border bg-[var(--color-bg-base)] px-3 font-mono text-[14px] text-text-primary outline-none placeholder:text-text-dim focus:border-[var(--color-bone)]"
              />
            </label>
          ))}
        </div>
        <textarea
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          placeholder="notes · fasted / pumped / time of day..."
          rows={2}
          className="mt-3 w-full resize-none border border-border bg-[var(--color-bg-base)] p-3 font-mono text-[12px] text-text-primary outline-none placeholder:text-text-dim focus:border-[var(--color-bone)]"
        />
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">
          weekly log · same conditions each time · trend &gt; single reading
        </p>
      </CardBody>
    </Card>
  );
}
