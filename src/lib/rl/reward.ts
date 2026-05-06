import type { RewardParams } from "./types";

const CORRECT_BONUS = 10;
const TIME_PENALTY_FACTOR = 0.001;
const DIFFICULTY_MULTIPLIER = [1.0, 1.5, 2.0]; // easy, medium, hard

export function calculateReward({
  isCorrect,
  timeSpentMs,
  difficulty,
  expectedTimeMs,
}: RewardParams): number {
  if (!isCorrect) return -5;

  const baseReward = CORRECT_BONUS * (DIFFICULTY_MULTIPLIER[difficulty] ?? 1.0);
  const timePenalty =
    Math.max(0, timeSpentMs - expectedTimeMs) * TIME_PENALTY_FACTOR;
  return Math.max(0, baseReward - timePenalty);
}
