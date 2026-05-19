import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/Header";
import { LeaderboardClient } from "@/components/game/LeaderboardClient";

export interface LeaderboardEntry {
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarSeed: string | null;
  className: string | null;
  score: number; // 0–100 (avg skill_level × 100, rounded)
  totalCorrect: number;
  modulesPlayed: number;
  rank: number;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_seed, role, class_name")
    .eq("id", user.id)
    .single();

  const admin = createAdminClient();

  const [{ data: profiles }, { data: skills }, { data: sessions }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id, username, display_name, avatar_seed, class_name"),
      admin.from("student_skills").select("user_id, module_id, skill_level"),
      admin.from("sessions").select("user_id, total_correct"),
    ]);

  const visibleProfiles =
    profile?.role === "siswa"
      ? (profiles ?? []).filter((p) => p.class_name === profile.class_name)
      : (profiles ?? []);

  const entries: LeaderboardEntry[] = visibleProfiles
    .map((p) => {
      const userSkills = (skills ?? []).filter((s) => s.user_id === p.id);
      const userSessions = (sessions ?? []).filter((s) => s.user_id === p.id);

      const avgSkill =
        userSkills.length > 0
          ? userSkills.reduce((sum, s) => sum + s.skill_level, 0) /
            userSkills.length
          : 0;

      const totalCorrect = userSessions.reduce(
        (sum, s) => sum + (s.total_correct ?? 0),
        0,
      );

      return {
        userId: p.id,
        username: p.username,
        displayName: p.display_name,
        avatarSeed: p.avatar_seed,
        className: p.class_name,
        score: Math.round(avgSkill * 100),
        totalCorrect,
        modulesPlayed: userSkills.length,
      };
    })
    .filter((e) => e.modulesPlayed > 0)
    .sort((a, b) => b.score - a.score || b.totalCorrect - a.totalCorrect)
    .map((e, i) => ({ ...e, rank: i + 1 }));

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
      <LeaderboardClient
        entries={entries}
        currentUserId={user.id}
        viewerRole={profile?.role ?? null}
        viewerClassName={profile?.class_name ?? null}
      />
    </div>
  );
}
