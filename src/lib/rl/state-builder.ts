import { createClient } from "@/lib/supabase/server";
import type { RLState } from "./types";
import {
  discretizeAccuracy,
  discretizeHint,
  discretizeSkill,
  discretizeStreak,
} from "./state";

export async function buildStudentState(
  userId: string,
  moduleId: string,
): Promise<RLState> {
  const supabase = await createClient();

  const { data: skill } = await supabase
    .from("student_skills")
    .select("skill_level")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();

  const skillLevel = skill?.skill_level ?? 0.5;

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("module_id", moduleId);

  const sessionIds = (sessions ?? []).map((session) => session.id);

  let attempts: { solved: boolean; hints_used: number | null }[] = [];

  if (sessionIds.length > 0) {
    const { data: recentAttempts } = await supabase
      .from("attempts")
      .select("solved,hints_used")
      .in("session_id", sessionIds)
      .order("attempted_at", { ascending: false })
      .limit(5);

    attempts = recentAttempts ?? [];
  }

  const recentAccuracy =
    attempts.length > 0
      ? attempts.filter((attempt) => attempt.solved).length / attempts.length
      : 0.5;

  let streak = 0;
  for (const attempt of attempts) {
    if (attempt.solved) {
      if (streak >= 0) streak += 1;
      else break;
    } else {
      if (streak <= 0) streak -= 1;
      else break;
    }
  }

  const avgHints =
    attempts.length > 0
      ? attempts.reduce((sum, attempt) => sum + (attempt.hints_used ?? 0), 0) /
        attempts.length
      : 0;

  return {
    skill_bin: discretizeSkill(skillLevel),
    accuracy_bin: discretizeAccuracy(recentAccuracy),
    streak_bin: discretizeStreak(streak),
    hint_bin: discretizeHint(avgHints),
  };
}
