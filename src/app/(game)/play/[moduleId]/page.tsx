import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { PlayClient } from "@/components/game/PlayClient";

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

  const { data: session } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      module_id: moduleId,
    })
    .select("id")
    .single();

  if (!session) redirect("/world-map");

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

      <PlayClient
        module={{
          id: module.id,
          name: module.name,
          description: module.description,
        }}
        sessionId={session.id}
        avatarSeed={profile?.avatar_seed ?? null}
        username={profile?.username ?? null}
      />
    </div>
  );
}
