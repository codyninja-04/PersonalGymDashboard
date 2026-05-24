import { TopBar } from "@/components/layout/TopBar";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { PhilosophyTicker } from "@/components/dashboard/PhilosophyTicker";
import { KPIGrid } from "@/components/kpi/KPIGrid";
import { WeightLeanMassChart } from "@/components/analytics/WeightLeanMassChart";
import { VolumeLoadBarChart } from "@/components/analytics/VolumeLoadBarChart";
import { WorkoutSplitModule } from "@/components/workout/WorkoutSplitModule";
import { AICoachTerminal } from "@/components/coach/AICoachTerminal";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PRFeed } from "@/components/dashboard/PRFeed";
import { DailyQuote } from "@/components/dashboard/DailyQuote";
import { IntentSetter } from "@/components/dashboard/IntentSetter";
import { SpotifyPlayer } from "@/components/dashboard/SpotifyPlayer";
import { StallDiagnosisCard } from "@/components/dashboard/StallDiagnosisCard";
import { PhaseCard } from "@/components/dashboard/PhaseCard";
import { PhaseChecklist } from "@/components/dashboard/PhaseChecklist";
import { DeloadBanner } from "@/components/dashboard/DeloadBanner";
import { LifestyleQuickLog } from "@/components/dashboard/LifestyleQuickLog";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

async function loadDeloadContext() {
  if (!isSupabaseConfigured()) return { last_deload_at: null, phase_started_at: null };
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { last_deload_at: null, phase_started_at: null };
    const { data } = await supabase
      .from("profiles")
      .select("last_deload_at, phase_started_at")
      .eq("id", user.id)
      .maybeSingle();
    return {
      last_deload_at: (data?.last_deload_at as string | null) ?? null,
      phase_started_at: (data?.phase_started_at as string | null) ?? null,
    };
  } catch {
    return { last_deload_at: null, phase_started_at: null };
  }
}

async function loadLifestyleToday() {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("daily_fuel")
      .select("sleep_hours, steps, energy_rating, soreness_rating")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const [deloadCtx, lifestyleToday] = await Promise.all([loadDeloadContext(), loadLifestyleToday()]);

  return (
    <div className="space-y-6">
      <TopBar />
      <HeroBanner />
      <PhilosophyTicker />

      <PhaseChecklist />
      <DeloadBanner
        lastDeloadAt={deloadCtx.last_deload_at}
        phaseStartedAt={deloadCtx.phase_started_at}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <IntentSetter />
        <DailyQuote />
      </div>

      <PhaseCard />

      <StallDiagnosisCard />

      <KPIGrid />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <WeightLeanMassChart />
        </div>
        <VolumeLoadBarChart />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <WorkoutSplitModule />
        </div>
        <div className="space-y-4">
          <SpotifyPlayer />
          <LifestyleQuickLog
            initial={
              lifestyleToday
                ? {
                    sleep_hours: lifestyleToday.sleep_hours as number | null,
                    steps: lifestyleToday.steps as number | null,
                    energy_rating: lifestyleToday.energy_rating as number | null,
                    soreness_rating: lifestyleToday.soreness_rating as number | null,
                  }
                : undefined
            }
          />
          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AICoachTerminal />
        </div>
        <PRFeed />
      </div>

      <footer className="flex flex-col items-center gap-3 border-t border-border-subtle py-8 text-center">
        <div className="font-display text-2xl font-extrabold tracking-[-0.04em]">
          FORGE
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-text-dim">
          aesthetic · healthy · strong
        </div>
      </footer>
    </div>
  );
}
