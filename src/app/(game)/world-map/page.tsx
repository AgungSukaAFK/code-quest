import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { WorldMapClient } from "@/components/game/WorldMapClient";

export default async function WorldMapPage() {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        user={{
          id: user.id,
          email: user.email,
          username: profile?.username,
          avatar_seed: profile?.avatar_seed,
          role: profile?.role,
        }}
      />
      <WorldMapClient
        username={profile?.username}
        avatarSeed={profile?.avatar_seed}
      />
    </div>
  );
}
