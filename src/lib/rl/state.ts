import type {
  AccuracyBin,
  HintBin,
  RLState,
  SkillBin,
  StreakBin,
} from "./types";

export function discretizeSkill(skillLevel: number): SkillBin {
  if (skillLevel < 0.4) return "low";
  if (skillLevel < 0.7) return "medium";
  return "high";
}

export function discretizeAccuracy(recentAccuracy: number): AccuracyBin {
  if (recentAccuracy < 0.4) return "low";
  if (recentAccuracy < 0.75) return "medium";
  return "high";
}

export function discretizeStreak(streak: number): StreakBin {
  if (streak <= -2) return "negative";
  if (streak >= 2) return "positive";
  return "neutral";
}

export function discretizeHint(avgHints: number): HintBin {
  return avgHints < 1 ? "low" : "high";
}

export function stateToKey(state: RLState): string {
  return `${state.skill_bin}|${state.accuracy_bin}|${state.streak_bin}|${state.hint_bin}`;
}

export function keyToState(key: string): RLState {
  const [skill, accuracy, streak, hint] = key.split("|");
  return {
    skill_bin: skill as SkillBin,
    accuracy_bin: accuracy as AccuracyBin,
    streak_bin: streak as StreakBin,
    hint_bin: hint as HintBin,
  };
}

export function getAllStateKeys(): string[] {
  const skills: SkillBin[] = ["low", "medium", "high"];
  const accuracies: AccuracyBin[] = ["low", "medium", "high"];
  const streaks: StreakBin[] = ["negative", "neutral", "positive"];
  const hints: HintBin[] = ["low", "high"];

  const keys: string[] = [];

  for (const skill of skills) {
    for (const accuracy of accuracies) {
      for (const streak of streaks) {
        for (const hint of hints) {
          keys.push(
            stateToKey({
              skill_bin: skill,
              accuracy_bin: accuracy,
              streak_bin: streak,
              hint_bin: hint,
            }),
          );
        }
      }
    }
  }

  return keys;
}
