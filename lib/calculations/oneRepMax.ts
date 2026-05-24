// Epley formula: 1RM = weight * (1 + reps / 30)
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

// Brzycki — alternative
export function brzycki(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  return Math.round((weight * 36 / (37 - reps)) * 10) / 10;
}
