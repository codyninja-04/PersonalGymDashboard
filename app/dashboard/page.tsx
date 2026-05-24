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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <TopBar />
      <HeroBanner />
      <PhilosophyTicker />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <IntentSetter />
        <DailyQuote />
      </div>

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
