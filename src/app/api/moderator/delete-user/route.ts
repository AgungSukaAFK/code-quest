import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await request.json() as { userId?: string };
  if (!userId) return NextResponse.json({ error: "userId wajib diisi" }, { status: 400 });

  // Prevent self-deletion
  if (userId === user.id) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Prevent deleting another moderator
  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (target?.role === "moderator") {
    return NextResponse.json({ error: "Tidak bisa menghapus akun moderator" }, { status: 403 });
  }

  // Delete related data in dependency order before removing auth user.
  // Tables without ON DELETE CASCADE to auth.users must be cleaned manually.

  // 1. room_players (FK user_id → auth.users, no cascade)
  //    Deleting room_players cascades → room_answers (via player_id FK)
  await admin.from("room_players").delete().eq("user_id", userId);

  // 2. multiplayer_rooms where user is host (FK host_id → auth.users, no cascade)
  //    Deleting rooms cascades → room_players, room_questions, room_answers
  await admin.from("multiplayer_rooms").delete().eq("host_id", userId);

  // 3. sessions (FK user_id → auth.users, no cascade)
  //    Deleting sessions cascades → attempts (via session_id FK with ON DELETE CASCADE)
  await admin.from("sessions").delete().eq("user_id", userId);

  // 4. Delete auth user — Supabase cascades student_skills, rl_events, profiles
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
