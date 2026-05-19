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
      .select("id,host_id,status,current_question_index")
      .eq("id", room_id)
      .single();

    if (!room) return NextResponse.json({ error: "Room tidak ditemukan" }, { status: 404 });
    if (room.host_id !== user.id) return NextResponse.json({ error: "Hanya host yang bisa mengontrol game" }, { status: 403 });
    if (room.status !== "playing") return NextResponse.json({ error: "Game tidak sedang berlangsung" }, { status: 409 });

    const nextIndex = room.current_question_index + 1;

    if (nextIndex >= 10) {
      await supabase
        .from("multiplayer_rooms")
        .update({ status: "finished", finished_at: new Date().toISOString() })
        .eq("id", room_id);
      return NextResponse.json({ finished: true });
    }

    await supabase
      .from("multiplayer_rooms")
      .update({ current_question_index: nextIndex, question_shown_at: new Date().toISOString() })
      .eq("id", room_id);

    return NextResponse.json({ finished: false, next_index: nextIndex });
  } catch (err) {
    console.error("multiplayer/next error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
