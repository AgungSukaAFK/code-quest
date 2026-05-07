export type PuzzleType =
  | "decomposition_sort"
  | "decomposition_order"
  | "truth_table"
  | "circuit_eval";

export interface Category {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

export interface Task {
  id: string;
  label: string;
  description?: string;
}

export interface DecompositionSortContent {
  type: "decomposition_sort";
  categories: Category[];
  tasks: Task[];
  correct_mapping: Record<string, string>;
}

export interface DecompositionOrderContent {
  type: "decomposition_order";
  tasks: Task[];
  correct_order: string[];
  parallel_groups?: string[][];
}

export type PuzzleContent = DecompositionSortContent | DecompositionOrderContent;

export interface PuzzleBase {
  id: string;
  module_id: string;
  type: PuzzleType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  variation_type: string | null;
  title: string;
  context: string | null;
  goal: string | null;
  content: PuzzleContent;
  expected_time_sec: number;
  concepts_tested: string[];
}

export interface DecompositionSortAnswer {
  type: "decomposition_sort";
  mapping: Record<string, string>;
}

export interface PuzzleResult {
  solved: boolean;
  correct_count: number;
  total_count: number;
  partial_score: number;
  feedback: string;
  incorrect_tasks?: string[];
}
