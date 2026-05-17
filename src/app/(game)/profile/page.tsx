import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { ProfileClient } from "@/components/game/ProfileClient";

export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  skillLevel: number | null;
  totalSessions: number;
  totalAttempts: number;
  totalCorrect: number;
  lastPlayedAt: string | null;
}

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: skills },
    { data: sessions },
    { data: modules },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("student_skills")
      .select("module_id, skill_level")
      .eq("user_id", user.id),
    supabase
      .from("sessions")
      .select("module_id, total_attempts, total_correct, started_at")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false }),
    supabase.from("modules").select("id, name").order("display_order"),
  ]);

  if (!profile) redirect("/login");

  const moduleProgress: ModuleProgress[] = (modules ?? []).map((mod) => {
    const modSessions = (sessions ?? []).filter((s) => s.module_id === mod.id);
    const skill = (skills ?? []).find((s) => s.module_id === mod.id);

    return {
      moduleId: mod.id,
      moduleName: mod.name,
      skillLevel: skill?.skill_level ?? null,
      totalSessions: modSessions.length,
      totalAttempts: modSessions.reduce(
        (sum, s) => sum + (s.total_attempts ?? 0),
        0,
      ),
      totalCorrect: modSessions.reduce(
        (sum, s) => sum + (s.total_correct ?? 0),
        0,
      ),
      lastPlayedAt: modSessions[0]?.started_at ?? null,
    };
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        user={{
          id: user.id,
          email: user.email,
          username: profile.username,
          avatar_seed: profile.avatar_seed,
        }}
      />
      <ProfileClient
        profile={profile}
        moduleProgress={moduleProgress}
        userEmail={user.email ?? ""}
      />
    </div>
  );
}
