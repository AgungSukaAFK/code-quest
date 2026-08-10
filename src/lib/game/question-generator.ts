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

const QUESTIONS_PER_ROOM = 10;

export function generateQuestionsFromPuzzles(
  booleanPuzzles: PuzzleRow[],
): GeneratedQuestion[] {
  if (booleanPuzzles.length === 0) return [];

  const questions: GeneratedQuestion[] = [];
  let cycle = shuffle(booleanPuzzles);
  let cycleIndex = 0;
  let guard = 0;

  // Pool boolean bisa lebih kecil dari 10 soal — cycle ulang (dengan urutan
  // acak baru) dan andalkan generateBooleanQuestion memilih baris kebenaran
  // acak tiap kali, supaya soal yang berulang tetap bervariasi.
  while (questions.length < QUESTIONS_PER_ROOM && guard < 200) {
    guard++;
    if (cycleIndex >= cycle.length) {
      cycle = shuffle(booleanPuzzles);
      cycleIndex = 0;
    }
    const question = generateBooleanQuestion(cycle[cycleIndex++]);
    if (question) questions.push(question);
  }

  return questions.map((q, i) => ({ ...q, question_order: i }));
}
