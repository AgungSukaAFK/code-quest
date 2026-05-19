import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { QTableDashboard } from "@/components/rl/QTableDashboard";

export default async function RLDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "moderator") redirect("/world-map");

  const { data: modules } = await supabase
    .from("modules")
    .select("id,name,description")
    .order("id", { ascending: true });

  const { data: qTables } = await supabase
    .from("q_tables")
    .select("*")
    .order("module_id", { ascending: true });

  const { data: recentEvents } = await supabase
    .from("rl_events")
    .select(
      "id,module_id,state_key_before,action_taken,was_exploration,reward,td_error,q_value_before,q_value_after,created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={{
          id: user.id,
          email: user.email,
          display_name: profile?.display_name,
          username: profile?.username,
          avatar_seed: profile?.avatar_seed,
          role: profile?.role,
        }}
      />

      <main className="container mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">RL Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualisasi Q-Table, event update, dan status agent untuk demo
            dosen.
          </p>
        </div>

        <QTableDashboard
          qTables={
            (qTables ?? []) as Array<{
              module_id: string;
              q_values: Record<string, Record<number, number>>;
              total_updates: number | null;
              total_episodes: number | null;
              epsilon: number | null;
              learning_rate: number | null;
            }>
          }
          recentEvents={
            (recentEvents ?? []) as Array<{
              id: string;
              module_id: string;
              state_key_before: string;
              action_taken: number;
              was_exploration: boolean;
              reward: number | null;
              td_error: number | null;
              q_value_before: number | null;
              q_value_after: number | null;
              created_at: string;
            }>
          }
          modules={
            (modules ?? []) as Array<{
              id: string;
              name: string;
              description: string | null;
            }>
          }
        />
      </main>
    </div>
  );
}
