import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { WorldMapClient } from "@/components/game/WorldMapClient";

export default async function WorldMapPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch puzzle IDs per module
  const [{ data: m2Puzzles }, { data: l1Puzzles }] = await Promise.all([
    supabase.from("puzzles").select("id").eq("module_id", "M2"),
    supabase.from("puzzles").select("id").eq("module_id", "L1"),
  ]);

  const m2Ids = (m2Puzzles ?? []).map((p) => p.id);
  const l1Ids = (l1Puzzles ?? []).map((p) => p.id);

  // Count unique puzzle IDs the user has ever submitted an answer to
  const [m2AttemptsRes, l1AttemptsRes] = await Promise.all([
    m2Ids.length > 0
      ? supabase.from("attempts").select("puzzle_id").eq("user_id", user.id).in("puzzle_id", m2Ids)
      : Promise.resolve({ data: [] }),
    l1Ids.length > 0
      ? supabase.from("attempts").select("puzzle_id").eq("user_id", user.id).in("puzzle_id", l1Ids)
      : Promise.resolve({ data: [] }),
  ]);

  const m2Progress = new Set((m2AttemptsRes.data ?? []).map((a) => a.puzzle_id)).size;
  const l1Progress = new Set((l1AttemptsRes.data ?? []).map((a) => a.puzzle_id)).size;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
      <WorldMapClient
        username={profile?.username}
        avatarSeed={profile?.avatar_seed}
        m2Progress={m2Progress}
        l1Progress={l1Progress}
      />
    </div>
  );
}
