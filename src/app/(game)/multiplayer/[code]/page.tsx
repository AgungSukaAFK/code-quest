import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { MultiplayerRoomClient } from "@/components/multiplayer/MultiplayerRoomClient";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function MultiplayerRoomPage({ params }: Props) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,username,avatar_seed,role")
    .eq("id", user.id)
    .single();

  const { data: room } = await supabase
    .from("multiplayer_rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (!room) notFound();

  const { data: players } = await supabase
    .from("room_players")
    .select("*")
    .eq("room_id", room.id)
    .order("score", { ascending: false });

  const { data: questions } = await supabase
    .from("room_questions")
    .select("*")
    .eq("room_id", room.id)
    .order("question_order");

  const { data: currentPlayer } = await supabase
    .from("room_players")
    .select("*")
    .eq("room_id", room.id)
    .eq("user_id", user.id)
    .single();

  // If not a player yet and room is still waiting, auto-join
  if (!currentPlayer && room.status === "waiting") {
    redirect(`/multiplayer?join=${code}`);
  }
  if (!currentPlayer) notFound();

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
      <MultiplayerRoomClient
        initialRoom={room}
        initialPlayers={players ?? []}
        questions={questions ?? []}
        currentPlayer={currentPlayer}
        userId={user.id}
      />
    </div>
  );
}
