"use client";

import { WeightCard } from "./WeightCard";
import { ConsistencyCard } from "./ConsistencyCard";
import { MacroRingCard } from "./MacroRingCard";
import { StrengthIndexCard } from "./StrengthIndexCard";

export function KPIGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <WeightCard />
      <ConsistencyCard />
      <MacroRingCard />
      <StrengthIndexCard />
    </div>
  );
}
