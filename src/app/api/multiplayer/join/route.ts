import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code, display_name, avatar_seed } = await request.json() as {
      code?: string;
      display_name?: string;
      avatar_seed?: string;
    };

    if (!code || !display_name) {
      return NextResponse.json({ error: "code dan display_name diperlukan" }, { status: 400 });
    }

    const { data: room } = await supabase
      .from("multiplayer_rooms")
      .select("id,status,max_players,code")
      .eq("code", code.toUpperCase())
      .single();

    if (!room) return NextResponse.json({ error: "Room tidak ditemukan" }, { status: 404 });
    if (room.status !== "waiting") return NextResponse.json({ error: "Game sudah dimulai" }, { status: 409 });

    const { count } = await supabase
      .from("room_players")
      .select("id", { count: "exact", head: true })
      .eq("room_id", room.id);

    if ((count ?? 0) >= room.max_players) {
      return NextResponse.json({ error: "Room sudah penuh" }, { status: 409 });
    }

    // Upsert: rejoin if already in room
    const { error } = await supabase.from("room_players").upsert(
      { room_id: room.id, user_id: user.id, display_name, avatar_seed: avatar_seed ?? null, is_host: false },
      { onConflict: "room_id,user_id" },
    );

    if (error) return NextResponse.json({ error: "Gagal bergabung" }, { status: 500 });

    return NextResponse.json({ code: room.code, room_id: room.id });
  } catch (err) {
    console.error("multiplayer/join error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
