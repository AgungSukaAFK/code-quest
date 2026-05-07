export type SkillBin = "low" | "medium" | "high";
export type AccuracyBin = "low" | "medium" | "high";
export type StreakBin = "negative" | "neutral" | "positive";
export type HintBin = "low" | "high";

export interface RLState {
  skill_bin: SkillBin;
  accuracy_bin: AccuracyBin;
  streak_bin: StreakBin;
  hint_bin: HintBin;
}

export type RLAction = 1 | 2 | 3;

export interface QTableData {
  [stateKey: string]: {
    [action: number]: number;
  };
}

export interface QTableMetadata {
  module_id: string;
  total_updates: number;
  total_episodes: number;
  learning_rate: number;
  discount_factor: number;
  epsilon: number;
  epsilon_min: number;
  epsilon_decay: number;
}

export interface RLDecision {
  action: RLAction;
  was_exploration: boolean;
  q_value_before: number;
  state_key: string;
  epsilon_at_decision: number;
}

export interface AttemptOutcome {
  solved: boolean;
  progress_score: number;
  time_ratio: number;
  hints_used: number;
  gave_up: boolean;
  difficulty_taken: number;
  skill_before: number;
  skill_after: number;
}
