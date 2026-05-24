import type { WeightEntry, BFEntry, BodyMetric } from "@/types/metrics";

export function computeLeanMassSeries(
  weights: WeightEntry[],
  bfHistory: BFEntry[],
): BodyMetric[] {
  const bfByDate = new Map(bfHistory.map((e) => [e.date, e.bf]));
  const sortedBF = [...bfHistory].sort((a, b) => (a.date < b.date ? -1 : 1));
  let lastKnownBF = sortedBF[0]?.bf ?? 0.21;

  return weights.map((w) => {
    const bf = bfByDate.get(w.date);
    if (bf !== undefined) lastKnownBF = bf;
    const leanMassKg = Math.round(w.weight * (1 - lastKnownBF) * 10) / 10;
    return {
      date: w.date,
      weightKg: w.weight,
      bf: lastKnownBF,
      leanMassKg,
    };
  });
}

export function leanMassDelta(series: BodyMetric[]): number {
  if (series.length < 2) return 0;
  return (
    Math.round((series[series.length - 1].leanMassKg - series[0].leanMassKg) * 10) / 10
  );
}
