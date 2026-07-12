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

  // Status babak berbasis flag cerita (siswa dianggap selesai modul
  // setelah menuntaskan 3 soal — lihat PlayClient).
  const m2Done = Boolean(profile?.has_completed_m2);
  const l1Done = Boolean(profile?.has_completed_l1);
  const hasSeenIntroWorld = Boolean(profile?.has_seen_intro_world);

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
        userId={user.id}
        username={profile?.username}
        avatarSeed={profile?.avatar_seed}
        m2Done={m2Done}
        l1Done={l1Done}
        hasSeenIntroWorld={hasSeenIntroWorld}
      />
    </div>
  );
}
