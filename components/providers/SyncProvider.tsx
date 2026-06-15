"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { useNutritionStore } from "@/lib/store/useNutritionStore";
import { useSplitStore, type WeekMap } from "@/lib/store/useSplitStore";
import type { SyncBundle } from "@/app/actions/fetch";

function isValidSplit(value: unknown): value is WeekMap {
  return (
    !!value &&
    typeof value === "object" &&
    "monday" in (value as Record<string, unknown>) &&
    Array.isArray((value as WeekMap).monday?.exercises)
  );
}

export function SyncProvider({
  bundle,
  children,
}: {
  bundle: SyncBundle;
  children: React.ReactNode;
}) {
  const hydrateApp = useAppStore((s) => s.hydrate);
  const hydrateNutrition = useNutritionStore((s) => s.hydrate);
  const user = useAppStore((s) => s.user);
  const recomputeTargets = useNutritionStore((s) => s.recomputeTargets);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    hydrateApp(bundle);
    hydrateNutrition(bundle.todayFuel);

    // Pull the saved split from the account. Apply it after the local cache
    // has rehydrated so the server copy wins across devices.
    const serverSplit = bundle.profile?.split;
    if (isValidSplit(serverSplit)) {
      const templateId = bundle.profile?.split_template ?? "custom";
      const apply = () => {
        useSplitStore.getState().hydrateFromServer(serverSplit, templateId);
        // Gym vs rest days may differ now, so re-cycle the macro targets.
        recomputeTargets(useAppStore.getState().user);
      };
      if (useSplitStore.persist.hasHydrated()) apply();
      else useSplitStore.persist.onFinishHydration(apply);
    }
  }, [bundle, hydrateApp, hydrateNutrition, recomputeTargets]);

  // Recompute nutrition targets whenever the user profile (phase / weight) changes
  useEffect(() => {
    recomputeTargets(user);
  }, [user, recomputeTargets]);

  return <>{children}</>;
}
