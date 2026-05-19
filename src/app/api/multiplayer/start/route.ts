import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { room_id } = await request.json() as { room_id?: string };
    if (!room_id) return NextResponse.json({ error: "room_id diperlukan" }, { status: 400 });

    const { data: room } = await supabase
      .from("multiplayer_rooms")
      .select("id,host_id,status,timer_seconds")
      .eq("id", room_id)
      .single();

    if (!room) return NextResponse.json({ error: "Room tidak ditemukan" }, { status: 404 });
    if (room.host_id !== user.id) return NextResponse.json({ error: "Hanya host yang bisa memulai" }, { status: 403 });
    if (room.status !== "waiting") return NextResponse.json({ error: "Game sudah dimulai" }, { status: 409 });

    const { count } = await supabase
      .from("room_players")
      .select("id", { count: "exact", head: true })
      .eq("room_id", room_id);

    if ((count ?? 0) < 2) {
      return NextResponse.json({ error: "Minimal 2 pemain untuk memulai" }, { status: 400 });
    }

    const now = new Date().toISOString();
    await supabase
      .from("multiplayer_rooms")
      .update({
        status: "playing",
        current_question_index: 0,
        question_shown_at: now,
        started_at: now,
      })
      .eq("id", room_id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("multiplayer/start error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
