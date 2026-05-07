import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PuzzleResult, TruthTableAnswer, TruthTableContent } from "@/types/puzzle";

type PuzzleRow = {
  id: string;
  type: string;
  content: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      session_id,
      puzzle_id,
      user_answer,
      time_taken_sec,
      hints_used = 0,
    } = body as {
      session_id?: string;
      puzzle_id?: string;
      user_answer?: unknown;
      time_taken_sec?: number;
      hints_used?: number;
    };

    if (!session_id || !puzzle_id || !user_answer) {
      return NextResponse.json(
        { error: "session_id, puzzle_id, user_answer are required" },
        { status: 400 },
      );
    }

    const { data: puzzle, error: puzzleError } = await supabase
      .from("puzzles")
      .select("id,type,content")
      .eq("id", puzzle_id)
      .single<PuzzleRow>();

    if (puzzleError || !puzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    const result = validateAnswer(puzzle, user_answer);

    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .insert({
        session_id,
        user_id: user.id,
        puzzle_id,
        solved: result.solved,
        user_answer,
        time_taken_sec: time_taken_sec ?? null,
        hints_used,
        state_snapshot: null,
        action_taken: null,
        reward: null,
      })
      .select("id")
      .single();

    if (attemptError) throw attemptError;

    if (result.solved) {
      await supabase.rpc("increment_session_correct", {
        session_id_param: session_id,
      });
    } else {
      await supabase.rpc("increment_session_attempts", {
        session_id_param: session_id,
      });
    }

    return NextResponse.json({ result, attempt_id: attempt.id });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function validateAnswer(puzzle: PuzzleRow, userAnswer: unknown): PuzzleResult {
  if (puzzle.type === "decomposition_sort") {
    return validateDecompositionSort(
      puzzle.content,
      userAnswer as { mapping?: Record<string, string> },
    );
  }

  if (puzzle.type === "truth_table") {
    return evaluateTruthTable(
      puzzle.content as unknown as TruthTableContent,
      userAnswer as TruthTableAnswer,
    );
  }

  return {
    solved: false,
    correct_count: 0,
    total_count: 0,
    partial_score: 0,
    feedback: "Unknown puzzle type",
  };
}

function validateDecompositionSort(
  content: Record<string, unknown>,
  userAnswer: { mapping?: Record<string, string> },
): PuzzleResult {
  const correctMapping =
    (content.correct_mapping as Record<string, string> | undefined) ?? {};
  const userMapping = userAnswer.mapping ?? {};

  let correctCount = 0;
  const totalCount = Object.keys(correctMapping).length;
  const incorrectTasks: string[] = [];

  for (const [taskId, correctCategory] of Object.entries(correctMapping)) {
    if (userMapping[taskId] === correctCategory) {
      correctCount += 1;
    } else {
      incorrectTasks.push(taskId);
    }
  }

  const partialScore = totalCount > 0 ? correctCount / totalCount : 0;
  const solved = partialScore === 1;

  let feedback = "";
  if (solved) {
    feedback = "Sempurna! Semua task ada di kategori yang tepat.";
  } else if (partialScore >= 0.7) {
    feedback = `Hampir! ${correctCount}/${totalCount} benar. Cek lagi yang masih salah.`;
  } else if (partialScore >= 0.4) {
    feedback = `Lumayan, tapi masih perlu diperhatikan. ${correctCount}/${totalCount} benar.`;
  } else {
    feedback = `Belum tepat. Coba pikirkan lagi tahapan setiap task. ${correctCount}/${totalCount} benar.`;
  }

  return {
    solved,
    correct_count: correctCount,
    total_count: totalCount,
    partial_score: partialScore,
    feedback,
    incorrect_tasks: incorrectTasks,
  };
}

function evaluateTruthTable(
  content: TruthTableContent,
  answer: TruthTableAnswer,
): PuzzleResult {
  const total = content.rows.length;
  let correctCount = 0;
  const incorrectRows: string[] = [];

  content.rows.forEach((row, index) => {
    if (answer.outputs[index] === row.expected_output) {
      correctCount += 1;
    } else {
      incorrectRows.push(`row_${index}`);
    }
  });

  const partialScore = total > 0 ? correctCount / total : 0;
  const solved = correctCount === total;

  let feedback = "";
  if (solved) {
    feedback = `Sempurna! Semua ${total} baris benar!`;
  } else if (partialScore >= 0.75) {
    feedback = `Hampir! ${correctCount} dari ${total} baris benar. Cek lagi yang salah.`;
  } else if (partialScore >= 0.5) {
    feedback = `Lumayan, ${correctCount}/${total} benar. Pikirkan urutan operasi.`;
  } else {
    feedback = `Coba lagi! ${correctCount}/${total} benar. Review konsep AND/OR/NOT.`;
  }

  return {
    solved,
    correct_count: correctCount,
    total_count: total,
    partial_score: partialScore,
    feedback,
    incorrect_rows: incorrectRows,
  };
}
