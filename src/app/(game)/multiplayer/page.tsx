import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { MultiplayerLobbyClient } from "@/components/multiplayer/MultiplayerLobbyClient";
import { BG } from "@/lib/assets";

export default async function MultiplayerLobbyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,username,avatar_seed,role,has_seen_arena_intro")
    .eq("id", user.id)
    .single();

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(2,6,23,0.62), rgba(2,6,23,0.74)), url('${BG.arena}')`,
      }}
    >
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
      <MultiplayerLobbyClient
        userId={user.id}
        displayName={profile?.display_name ?? profile?.username ?? "Siswa"}
        avatarSeed={profile?.avatar_seed ?? null}
        hasSeenArenaIntro={Boolean(profile?.has_seen_arena_intro)}
      />
    </div>
  );
}
