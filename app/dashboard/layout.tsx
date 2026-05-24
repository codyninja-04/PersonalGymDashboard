import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { HydrationGate } from "@/components/ui/HydrationGate";
import { SyncProvider } from "@/components/providers/SyncProvider";
import { createServerSupabase } from "@/lib/supabase/server";
import { fetchSyncBundle } from "@/app/actions/fetch";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let userEmail = "demo@forge.local";

  if (supabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    userEmail = user.email ?? "";
  }

  const bundle = supabaseConfigured
    ? await fetchSyncBundle()
    : { profile: null, weights: [], bfs: [], prs: [], sessions: [], todayFuel: null };

  return (
    <SyncProvider bundle={bundle}>
      <HydrationGate>
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0 neon-grid opacity-[0.35]" />
          <Sidebar email={userEmail} />
          <main className="relative min-h-screen lg:pl-[240px]">
            <div className="px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-10 lg:pb-10">
              {children}
            </div>
          </main>
          <MobileNav />
        </div>
      </HydrationGate>
    </SyncProvider>
  );
}
