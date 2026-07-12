import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { PlayClient } from "@/components/game/PlayClient";
import { LevelBackground } from "@/components/game/LevelBackground";
import { BG } from "@/lib/assets";

interface PlayPageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { moduleId } = await params;
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

  const { data: module } = await supabase
    .from("modules")
    .select("*")
    .eq("id", moduleId)
    .single();

  if (!module) notFound();

  const [sessionResult, puzzlesResult] = await Promise.all([
    supabase.from("sessions").insert({ user_id: user.id, module_id: moduleId }).select("id").single(),
    supabase.from("puzzles").select("id").eq("module_id", moduleId),
  ]);

  if (!sessionResult.data) redirect("/world-map");

  const prefix = moduleId.toLowerCase();
  const hasSeenModuleOpen = Boolean(profile?.[`has_seen_${prefix}_open`]);

  const puzzleIds = (puzzlesResult.data ?? []).map((p) => p.id);
  let initialUniqueCount = 0;
  if (puzzleIds.length > 0) {
    const { data: prevAttempts } = await supabase
      .from("attempts")
      .select("puzzle_id")
      .eq("user_id", user.id)
      .in("puzzle_id", puzzleIds);
    initialUniqueCount = new Set((prevAttempts ?? []).map((a) => a.puzzle_id)).size;
  }

  // Modul sudah tuntas (>=3 soal unik) → masuk mode "latihan bebas" (tak terbatas).
  const alreadyCompleted = initialUniqueCount >= 3;

  return (
    <div className="relative min-h-screen">
      <LevelBackground src={moduleId === "L1" ? BG.menara : BG.lembah} />
      <div className="relative z-10">
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

      <PlayClient
        module={{
          id: module.id,
          name: module.name,
          description: module.description,
        }}
        sessionId={sessionResult.data.id}
        userId={user.id}
        avatarSeed={profile?.avatar_seed ?? null}
        username={profile?.username ?? null}
        role={profile?.role ?? null}
        initialUniqueCount={initialUniqueCount}
        hasSeenModuleOpen={hasSeenModuleOpen}
        alreadyCompleted={alreadyCompleted}
      />
      </div>
    </div>
  );
}
