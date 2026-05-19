import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { MultiplayerLobbyClient } from "@/components/multiplayer/MultiplayerLobbyClient";

export default async function MultiplayerLobbyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,username,avatar_seed,role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-900 via-purple-950 to-indigo-950">
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
        displayName={profile?.display_name ?? profile?.username ?? "Siswa"}
        avatarSeed={profile?.avatar_seed ?? null}
      />
    </div>
  );
}
