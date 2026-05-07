import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PuzzleResult } from "@/types/puzzle";

type PuzzleRow = {
  id: string;
  type: string;
  content: {
    correct_mapping?: Record<string, string>;
  };
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function validateAnswer(puzzle: PuzzleRow, userAnswer: unknown): PuzzleResult {
  if (puzzle.type === "decomposition_sort") {
    return validateDecompositionSort(
      puzzle.content,
      userAnswer as { mapping?: Record<string, string> },
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
  content: { correct_mapping?: Record<string, string> },
  userAnswer: { mapping?: Record<string, string> },
): PuzzleResult {
  const correctMapping = content.correct_mapping ?? {};
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
