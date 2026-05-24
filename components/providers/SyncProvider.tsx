"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { useNutritionStore } from "@/lib/store/useNutritionStore";
import type { SyncBundle } from "@/app/actions/fetch";

export function SyncProvider({
  bundle,
  children,
}: {
  bundle: SyncBundle;
  children: React.ReactNode;
}) {
  const hydrateApp = useAppStore((s) => s.hydrate);
  const hydrateNutrition = useNutritionStore((s) => s.hydrate);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    hydrateApp(bundle);
    hydrateNutrition(bundle.todayFuel);
  }, [bundle, hydrateApp, hydrateNutrition]);

  return <>{children}</>;
}
