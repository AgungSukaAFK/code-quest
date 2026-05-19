import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { room_id } = await request.json() as { room_id?: string };
    if (!room_id) return NextResponse.json({ error: "room_id diperlukan" }, { status: 400 });

    const { data: player } = await supabase
      .from("room_players")
      .select("id,is_host")
      .eq("room_id", room_id)
      .eq("user_id", user.id)
      .single();

    if (!player) return NextResponse.json({ error: "Kamu tidak ada di room ini" }, { status: 404 });

    if (player.is_host) {
      // Host keluar → hapus room, cascade menghapus semua data room
      const { error } = await supabase
        .from("multiplayer_rooms")
        .delete()
        .eq("id", room_id);
      if (error) {
        console.error("multiplayer/leave delete room error:", error);
        return NextResponse.json({ error: "Gagal keluar" }, { status: 500 });
      }
    } else {
      // Pemain biasa → hapus baris player saja
      const { error, count } = await supabase
        .from("room_players")
        .delete({ count: "exact" })
        .eq("id", player.id);
      if (error) {
        console.error("multiplayer/leave delete player error:", error);
        return NextResponse.json({ error: "Gagal keluar" }, { status: 500 });
      }
      if (count === 0) {
        // RLS blocked the delete — policy belum dibuat di Supabase
        console.error("multiplayer/leave: delete blocked by RLS (count=0), player id:", player.id);
        return NextResponse.json({ error: "Tidak bisa keluar, hubungi admin" }, { status: 403 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("multiplayer/leave error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
