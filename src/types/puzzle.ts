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

export interface TruthTableRow {
  inputs: Record<string, boolean>;
  expected_output: boolean;
}

export interface TruthTableContent {
  type?: "truth_table";
  expression: string;
  display_expression: string;
  variables: string[];
  rows: TruthTableRow[];
  explanation?: string;
}

export type PuzzleContent =
  | DecompositionSortContent
  | DecompositionOrderContent
  | TruthTableContent;

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

export interface TruthTableAnswer {
  outputs: boolean[];
}

export interface TruthTablePuzzle extends PuzzleBase {
  type: "truth_table";
  content: TruthTableContent;
}

export interface PuzzleResult {
  solved: boolean;
  correct_count: number;
  total_count: number;
  partial_score: number;
  feedback: string;
  incorrect_tasks?: string[];
  incorrect_rows?: string[];
}
