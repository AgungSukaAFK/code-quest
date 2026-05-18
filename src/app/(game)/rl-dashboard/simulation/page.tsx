import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { RLSimulationClient } from "@/components/rl/RLSimulationClient";

export default async function RLSimulationPage() {
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

  const moduleList = (modules ?? []) as Array<{
    id: string;
    name: string;
    description: string | null;
  }>;

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={{
          id: user.id,
          email: user.email,
          username: profile?.username,
          avatar_seed: profile?.avatar_seed,
          role: profile?.role,
        }}
      />

      <main className="container mx-auto max-w-6xl px-4 py-6">
        <RLSimulationClient
          modules={moduleList}
          defaultModuleId={moduleList[0]?.id ?? "M2"}
        />
      </main>
    </div>
  );
}
