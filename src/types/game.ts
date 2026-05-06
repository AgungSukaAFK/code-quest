export type ModuleType = "computational_thinking" | "logic_math";

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Module {
  id: string;
  name: string;
  type: ModuleType;
  description: string;
  iconName: string;
  displayOrder: number;
  isUnlocked: boolean;
  progress: number;
}

export interface Puzzle {
  id: string;
  moduleId: string;
  type: string;
  difficulty: DifficultyLevel;
  content: Record<string, unknown>;
  correctAnswer: unknown;
}

export interface UserProgress {
  userId: string;
  moduleId: string;
  puzzleId: string;
  isCorrect: boolean;
  timeSpentMs: number;
  answeredAt: string;
}

export interface QState {
  moduleId: string;
  difficulty: DifficultyLevel;
  recentCorrect: number; // 0-5 window
  recentAttempts: number;
}
