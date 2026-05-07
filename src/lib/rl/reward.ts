import type { AttemptOutcome } from "./types";

export function calculateReward(outcome: AttemptOutcome): {
  total: number;
  breakdown: Record<string, number>;
} {
  const breakdown: Record<string, number> = {
    outcome_component: 0,
    skill_growth_component: 0,
    hint_penalty: 0,
  };

  if (outcome.solved) {
    if (outcome.time_ratio < 0.5) {
      breakdown.outcome_component = 0.3;
    } else if (outcome.time_ratio <= 1.5) {
      breakdown.outcome_component = 1.0;
    } else {
      breakdown.outcome_component = 0.7;
    }
  } else if (outcome.gave_up) {
    breakdown.outcome_component = -1.5;
  } else if (outcome.progress_score >= 0.5) {
    breakdown.outcome_component = 0.2;
  } else {
    breakdown.outcome_component = -0.8;
  }

  const skillDelta = outcome.skill_after - outcome.skill_before;
  breakdown.skill_growth_component = skillDelta * 3.0;

  if (outcome.hints_used > 0) {
    breakdown.hint_penalty = -0.15 * outcome.hints_used;
  }

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  return { total, breakdown };
}
