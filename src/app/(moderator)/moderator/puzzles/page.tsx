import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/Header";
import { PuzzlesClient } from "@/components/moderator/PuzzlesClient";

export interface ManagedPuzzle {
  id: string;
  module_id: string;
  type: string;
  difficulty: number;
  title: string;
  goal: string | null;
  content: unknown;
  expected_time_sec: number | null;
  concepts_tested: string[] | null;
}

export interface ModuleOption {
  id: string;
  name: string;
}

export default async function ModeratorPuzzlesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const admin = createAdminClient();

  const [{ data: puzzles }, { data: modules }] = await Promise.all([
    admin
      .from("puzzles")
      .select("id, module_id, type, difficulty, title, goal, content, expected_time_sec, concepts_tested")
      .order("module_id")
      .order("difficulty"),
    admin.from("modules").select("id, name").order("display_order"),
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        user={{
          id: user.id,
          email: user.email,
          username: currentProfile?.username,
          avatar_seed: currentProfile?.avatar_seed,
          role: currentProfile?.role,
        }}
      />
      <PuzzlesClient
        puzzles={(puzzles ?? []) as ManagedPuzzle[]}
        modules={(modules ?? []) as ModuleOption[]}
      />
    </div>
  );
}
