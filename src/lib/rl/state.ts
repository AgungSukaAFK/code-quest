import type { QState, Action } from "./types";

export function serializeState(state: QState): string {
  return JSON.stringify({
    m: state.moduleId,
    d: state.difficultyLevel,
    r: Math.round(state.recentCorrectRate * 10) / 10, // round to 0.1
  });
}

export function buildState(
  moduleId: string,
  difficultyLevel: number,
  recentAnswers: boolean[],
): QState {
  const window = recentAnswers.slice(-5);
  const recentCorrectRate =
    window.length === 0 ? 0.5 : window.filter(Boolean).length / window.length;

  return { moduleId, difficultyLevel, recentCorrectRate };
}

export function getNextDifficulty(
  currentDifficulty: number,
  action: Action,
): number {
  if (action === "easier") return Math.max(0, currentDifficulty - 1);
  if (action === "harder") return Math.min(2, currentDifficulty + 1);
  return currentDifficulty;
}
