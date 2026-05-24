// Training & nutrition phases.
// Each phase defines macro math, training intensity, weekly change target,
// recovery prescription, and a one-line philosophy.

export type PhaseKey =
  | "cut-aggressive"
  | "cut-moderate"
  | "recomp"
  | "lean-bulk"
  | "bulk-aggressive"
  | "maintenance";

export type Stance = "deficit" | "neutral" | "surplus";

export interface PhaseConfig {
  key: PhaseKey;
  label: string;
  short: string;
  stance: Stance;
  tagline: string;
  description: string;

  // Caloric math
  caloricMultiplier: number;      // applied to TDEE
  proteinPerKg: number;            // g of protein per kg bodyweight
  carbPerKgGym: number;            // g carbs per kg on gym days
  carbPerKgRest: number;           // g carbs per kg on rest days
  fatPerKg: number;                // g fat per kg (baseline; rest balances)

  // Training prescription
  rpeBand: [number, number];       // recommended RPE on top sets
  repBias: "strength" | "hypertrophy" | "balanced";
  weeklyWeightChangeKg: number;    // negative = loss, positive = gain
  cardioPerWeek: number;           // suggested LISS/HIIT sessions per week
  deloadEveryWeeks: number;        // 0 = never

  // Duration
  typicalDurationWeeks: number;    // typical cycle length; 999 = ongoing

  // Coach tone
  philosophy: string;              // shown in UI
  priority: string;                // what to optimize
  watchOut: string;                // common failure mode
}

export const PHASES: Record<PhaseKey, PhaseConfig> = {
  "cut-aggressive": {
    key: "cut-aggressive",
    label: "Aggressive Cut",
    short: "Cut+",
    stance: "deficit",
    tagline: "Carve hard. Short window.",
    description: "Maximize fat loss in a compressed cycle. Protect strength via high protein + carb-cycling. Cardio is mandatory.",
    caloricMultiplier: 0.78,
    proteinPerKg: 2.4,
    carbPerKgGym: 2.7,
    carbPerKgRest: 1.5,
    fatPerKg: 0.8,
    rpeBand: [7, 8.5],
    repBias: "hypertrophy",
    weeklyWeightChangeKg: -0.7,
    cardioPerWeek: 3,
    deloadEveryWeeks: 6,
    typicalDurationWeeks: 8,
    philosophy: "Carve. Don't grind.",
    priority: "fat loss · strength preservation",
    watchOut: "Sleep + recovery suffer first. Cap deficit if RPE creeps down.",
  },
  "cut-moderate": {
    key: "cut-moderate",
    label: "Moderate Cut",
    short: "Cut",
    stance: "deficit",
    tagline: "Slow knife. Sustainable.",
    description: "Sustainable fat loss. The smartest path for most. Easier to hold strength and habits.",
    caloricMultiplier: 0.85,
    proteinPerKg: 2.2,
    carbPerKgGym: 3.0,
    carbPerKgRest: 2.0,
    fatPerKg: 0.9,
    rpeBand: [7.5, 9],
    repBias: "hypertrophy",
    weeklyWeightChangeKg: -0.4,
    cardioPerWeek: 2,
    deloadEveryWeeks: 8,
    typicalDurationWeeks: 12,
    philosophy: "Slow knife cuts deeper.",
    priority: "fat loss · adherence",
    watchOut: "Boredom is the enemy. Track weekly. Trust the trend.",
  },
  "recomp": {
    key: "recomp",
    label: "Body Recomp",
    short: "Recomp",
    stance: "neutral",
    tagline: "Build + lose. Together.",
    description: "Calorie cycling at maintenance. Surplus on gym days, deficit on rest days. Slow but the cleanest physique route.",
    caloricMultiplier: 1.0,
    proteinPerKg: 2.2,
    carbPerKgGym: 4.0,
    carbPerKgRest: 1.5,
    fatPerKg: 0.9,
    rpeBand: [8, 9.5],
    repBias: "hypertrophy",
    weeklyWeightChangeKg: 0.0,
    cardioPerWeek: 2,
    deloadEveryWeeks: 8,
    typicalDurationWeeks: 24,
    philosophy: "Be patient. The body listens.",
    priority: "muscle gain · fat loss · habit",
    watchOut: "Slow visual progress. Take photos monthly, not daily.",
  },
  "lean-bulk": {
    key: "lean-bulk",
    label: "Lean Bulk",
    short: "Lean Bulk",
    stance: "surplus",
    tagline: "Eat to build. Not to bloat.",
    description: "Slow muscle gain with minimal fat. Surplus dialed tight. The David Laid template.",
    caloricMultiplier: 1.08,
    proteinPerKg: 1.8,
    carbPerKgGym: 5.0,
    carbPerKgRest: 4.0,
    fatPerKg: 1.0,
    rpeBand: [8, 9.5],
    repBias: "balanced",
    weeklyWeightChangeKg: 0.25,
    cardioPerWeek: 1,
    deloadEveryWeeks: 6,
    typicalDurationWeeks: 16,
    philosophy: "Eat to build. Not to bloat.",
    priority: "muscle gain · low fat gain",
    watchOut: "If waist grows faster than chest, surplus is too aggressive.",
  },
  "bulk-aggressive": {
    key: "bulk-aggressive",
    label: "Aggressive Bulk",
    short: "Bulk+",
    stance: "surplus",
    tagline: "Push the ceiling.",
    description: "Maximize size and strength. Accept some fat gain. Best for beginners or post-cut rebound.",
    caloricMultiplier: 1.20,
    proteinPerKg: 1.6,
    carbPerKgGym: 6.0,
    carbPerKgRest: 5.0,
    fatPerKg: 1.2,
    rpeBand: [8.5, 10],
    repBias: "strength",
    weeklyWeightChangeKg: 0.5,
    cardioPerWeek: 0,
    deloadEveryWeeks: 5,
    typicalDurationWeeks: 12,
    philosophy: "Push the ceiling.",
    priority: "strength · size",
    watchOut: "BF can spike. Cap cycle at 12 weeks then re-evaluate.",
  },
  "maintenance": {
    key: "maintenance",
    label: "Maintenance",
    short: "Maintain",
    stance: "neutral",
    tagline: "Hold what you built.",
    description: "Calories at TDEE. Lock the physique in. Train for performance, peaking, or rest from cycling.",
    caloricMultiplier: 1.0,
    proteinPerKg: 1.8,
    carbPerKgGym: 4.0,
    carbPerKgRest: 3.0,
    fatPerKg: 1.0,
    rpeBand: [7, 9],
    repBias: "strength",
    weeklyWeightChangeKg: 0.0,
    cardioPerWeek: 2,
    deloadEveryWeeks: 8,
    typicalDurationWeeks: 999,
    philosophy: "Hold what you've built.",
    priority: "performance · longevity",
    watchOut: "Comfort drifts. Re-weigh weekly to catch creep early.",
  },
};

export const PHASE_KEYS: PhaseKey[] = [
  "cut-aggressive",
  "cut-moderate",
  "recomp",
  "lean-bulk",
  "bulk-aggressive",
  "maintenance",
];

// Map legacy free-text phase strings → a phase key for back-compat
export function resolvePhaseKey(input: string | null | undefined): PhaseKey {
  if (!input) return "cut-moderate";
  const lower = input.toLowerCase();
  if (lower in PHASES) return lower as PhaseKey;
  // Heuristics for free-text labels (e.g. "Aggressive Cut · Month 1")
  if (lower.includes("aggressive cut") || lower.includes("cut+")) return "cut-aggressive";
  if (lower.includes("cut")) return "cut-moderate";
  if (lower.includes("recomp")) return "recomp";
  if (lower.includes("lean") && lower.includes("bulk")) return "lean-bulk";
  if (lower.includes("aggressive bulk") || lower.includes("bulk+")) return "bulk-aggressive";
  if (lower.includes("bulk")) return "lean-bulk";
  if (lower.includes("maintain")) return "maintenance";
  return "cut-moderate";
}

export function getPhase(input: string | null | undefined): PhaseConfig {
  return PHASES[resolvePhaseKey(input)];
}

// Stance → goal mapping (DB still stores goal: cut/bulk/recomp)
export function phaseToGoal(key: PhaseKey): "cut" | "bulk" | "recomp" {
  const phase = PHASES[key];
  if (phase.stance === "deficit") return "cut";
  if (phase.stance === "surplus") return "bulk";
  return "recomp";
}
