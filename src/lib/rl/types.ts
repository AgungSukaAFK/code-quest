// Q-Learning types — digunakan di src/lib/rl/

export type Action = "easier" | "same" | "harder";

export interface QState {
  moduleId: string;
  difficultyLevel: number; // 0=easy, 1=medium, 2=hard
  recentCorrectRate: number; // 0.0 – 1.0 (window 5 soal terakhir)
}

export interface QTableEntry {
  state: string; // JSON serialized QState
  action: Action;
  qValue: number;
}

export interface RewardParams {
  isCorrect: boolean;
  timeSpentMs: number;
  difficulty: number;
  expectedTimeMs: number;
}
