import type { MCOption, RoomQuestion } from "@/types/multiplayer";

type PuzzleRow = {
  id: string;
  type: string;
  module_id: string;
  content: Record<string, unknown>;
};

type GeneratedQuestion = Omit<RoomQuestion, "id" | "room_id">;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function assignOptionIds(texts: string[], correctText: string): { options: MCOption[]; correctId: string } {
  const ids = ["A", "B", "C", "D"];
  const options = texts.map((text, i) => ({ id: ids[i], text }));
  const correctId = options.find((o) => o.text === correctText)!.id;
  return { options, correctId };
}

const DECOMP_DUMMIES = ["Semua Tahap", "Tidak Relevan", "Di Luar Proses", "Opsional"];

function generateDecompositionQuestion(puzzle: PuzzleRow): GeneratedQuestion | null {
  const content = puzzle.content as {
    categories?: { id: string; label: string }[];
    tasks?: { id: string; label: string }[];
    correct_mapping?: Record<string, string>;
  };

  if (!content.categories || !content.tasks || !content.correct_mapping) return null;

  const tasks = content.tasks.filter((t) => content.correct_mapping![t.id]);
  if (tasks.length === 0) return null;

  const task = tasks[Math.floor(Math.random() * tasks.length)];
  const correctCategoryId = content.correct_mapping[task.id];
  const correctCategory = content.categories.find((c) => c.id === correctCategoryId);
  if (!correctCategory) return null;

  const otherCategories = content.categories
    .filter((c) => c.id !== correctCategoryId)
    .map((c) => c.label);

  const neededDummies = Math.max(0, 3 - otherCategories.length);
  const dummies = shuffle(DECOMP_DUMMIES).slice(0, neededDummies);

  const wrongTexts = shuffle([...otherCategories, ...dummies]).slice(0, 3);
  const allTexts = shuffle([correctCategory.label, ...wrongTexts]);

  const { options, correctId } = assignOptionIds(allTexts, correctCategory.label);

  return {
    question_order: 0,
    puzzle_id: puzzle.id,
    puzzle_type: "decomposition",
    question_text: `Langkah "${task.label}" termasuk ke tahap apa?`,
    options,
    correct_option_id: correctId,
  };
}

const BOOLEAN_DISTRACTORS = ["Tidak Dapat Ditentukan", "Bergantung Ekspresi Lain"];

function generateBooleanQuestion(puzzle: PuzzleRow): GeneratedQuestion | null {
  const content = puzzle.content as {
    display_expression?: string;
    variables?: string[];
    rows?: { inputs: Record<string, boolean>; expected_output: boolean }[];
  };

  if (!content.rows || content.rows.length === 0 || !content.display_expression) return null;

  const row = content.rows[Math.floor(Math.random() * content.rows.length)];

  const inputStr = Object.entries(row.inputs)
    .map(([k, v]) => `${k} = ${v ? "TRUE" : "FALSE"}`)
    .join(", ");

  const correctText = row.expected_output ? "TRUE" : "FALSE";
  const wrongBoolean = row.expected_output ? "FALSE" : "TRUE";

  const allTexts = shuffle([correctText, wrongBoolean, ...BOOLEAN_DISTRACTORS]);
  const { options, correctId } = assignOptionIds(allTexts, correctText);

  return {
    question_order: 0,
    puzzle_id: puzzle.id,
    puzzle_type: "boolean",
    question_text: `Jika ${inputStr}, apa hasil dari ${content.display_expression}?`,
    options,
    correct_option_id: correctId,
  };
}

export function generateQuestionsFromPuzzles(
  decompositionPuzzles: PuzzleRow[],
  booleanPuzzles: PuzzleRow[],
): GeneratedQuestion[] {
  const decomp = shuffle(decompositionPuzzles)
    .slice(0, 5)
    .map(generateDecompositionQuestion)
    .filter((q): q is GeneratedQuestion => q !== null);

  const bool = shuffle(booleanPuzzles)
    .slice(0, 5)
    .map(generateBooleanQuestion)
    .filter((q): q is GeneratedQuestion => q !== null);

  // Interleave: decomp[0], bool[0], decomp[1], bool[1], ...
  const interleaved: GeneratedQuestion[] = [];
  const maxLen = Math.max(decomp.length, bool.length);
  for (let i = 0; i < maxLen; i++) {
    if (decomp[i]) interleaved.push(decomp[i]);
    if (bool[i]) interleaved.push(bool[i]);
  }

  return interleaved.slice(0, 10).map((q, i) => ({ ...q, question_order: i }));
}
