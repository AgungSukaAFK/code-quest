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

  // Deteksi "selesai" dari data attempts asli (bukan flag yang bisa gagal
  // tersimpan karena race saat redirect): modul dianggap selesai jika siswa
  // sudah mengerjakan minimal 3 soal unik di modul itu.
  const SOAL_PER_MODULE = 3;

  const [{ data: m2Puzzles }, { data: l1Puzzles }] = await Promise.all([
    supabase.from("puzzles").select("id").eq("module_id", "M2"),
    supabase.from("puzzles").select("id").eq("module_id", "L1"),
  ]);
  const m2Ids = (m2Puzzles ?? []).map((p) => p.id);
  const l1Ids = (l1Puzzles ?? []).map((p) => p.id);

  const [m2AttemptsRes, l1AttemptsRes] = await Promise.all([
    m2Ids.length > 0
      ? supabase.from("attempts").select("puzzle_id").eq("user_id", user.id).in("puzzle_id", m2Ids)
      : Promise.resolve({ data: [] as { puzzle_id: string }[] }),
    l1Ids.length > 0
      ? supabase.from("attempts").select("puzzle_id").eq("user_id", user.id).in("puzzle_id", l1Ids)
      : Promise.resolve({ data: [] as { puzzle_id: string }[] }),
  ]);

  const m2Count = new Set((m2AttemptsRes.data ?? []).map((a) => a.puzzle_id)).size;
  const l1Count = new Set((l1AttemptsRes.data ?? []).map((a) => a.puzzle_id)).size;

  const m2Done = m2Count >= SOAL_PER_MODULE;
  const l1Done = l1Count >= SOAL_PER_MODULE;
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
