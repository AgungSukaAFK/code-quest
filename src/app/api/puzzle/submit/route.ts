import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadAgent, saveAgent } from "@/lib/rl/q-table-store";
import { buildStudentState } from "@/lib/rl/state-builder";
import { stateToKey } from "@/lib/rl/state";
import { calculateReward } from "@/lib/rl/reward";
import type { AttemptOutcome, RLAction, RLState } from "@/lib/rl/types";
import type {
  PuzzleResult,
  TruthTableAnswer,
  TruthTableContent,
} from "@/types/puzzle";

type PuzzleRow = {
  id: string;
  type: string;
  module_id: string;
  difficulty: number;
  expected_time_sec: number | null;
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
      gave_up = false,
      rl_context,
    } = body as {
      session_id?: string;
      puzzle_id?: string;
      user_answer?: unknown;
      time_taken_sec?: number;
      hints_used?: number;
      gave_up?: boolean;
      rl_context?: {
        action?: number;
        was_exploration?: boolean;
        epsilon_at_decision?: number;
        state?: RLState;
        state_key?: string;
      };
    };

    if (!session_id || !puzzle_id || !user_answer) {
      return NextResponse.json(
        { error: "session_id, puzzle_id, user_answer are required" },
        { status: 400 },
      );
    }

    const { data: puzzle, error: puzzleError } = await supabase
      .from("puzzles")
      .select("id,type,module_id,difficulty,expected_time_sec,content")
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

    try {
      const rlUpdate = await runRlUpdate({
        userId: user.id,
        attemptId: attempt.id,
        puzzle,
        result,
        timeTakenSec: time_taken_sec ?? puzzle.expected_time_sec ?? 60,
        hintsUsed: hints_used,
        gaveUp: gave_up,
        rlContext: rl_context,
      });

      return NextResponse.json({
        result,
        attempt_id: attempt.id,
        rl_update: rlUpdate,
      });
    } catch (rlError) {
      console.error("RL update error:", rlError);
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

async function runRlUpdate(params: {
  userId: string;
  attemptId: string;
  puzzle: PuzzleRow;
  result: PuzzleResult;
  timeTakenSec: number;
  hintsUsed: number;
  gaveUp: boolean;
  rlContext?: {
    action?: number;
    was_exploration?: boolean;
    epsilon_at_decision?: number;
    state?: RLState;
    state_key?: string;
  };
}): Promise<{
  reward: number;
  q_value_before: number;
  q_value_after: number;
  td_error: number;
  state_key_before: string;
  state_key_after: string;
}> {
  const {
    userId,
    attemptId,
    puzzle,
    result,
    timeTakenSec,
    hintsUsed,
    gaveUp,
    rlContext,
  } = params;

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: existingSkill } = await supabase
    .from("student_skills")
    .select("skill_level")
    .eq("user_id", userId)
    .eq("module_id", puzzle.module_id)
    .maybeSingle();

  const skillBefore = existingSkill?.skill_level ?? 0.5;
  const rawDelta = result.solved
    ? 0.04 + result.partial_score * 0.02
    : (result.partial_score - 0.5) * 0.04;
  const skillAfter = clamp(skillBefore + rawDelta, 0, 1);

  await supabase.from("student_skills").upsert(
    {
      user_id: userId,
      module_id: puzzle.module_id,
      skill_level: skillAfter,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,module_id" },
  );

  const stateBefore =
    rlContext?.state ?? (await buildStudentState(userId, puzzle.module_id));
  const stateKeyBefore = rlContext?.state_key ?? stateToKey(stateBefore);
  const stateAfter = await buildStudentState(userId, puzzle.module_id);
  const stateKeyAfter = stateToKey(stateAfter);

  const actionTaken = toAction(rlContext?.action, puzzle.difficulty);

  const expectedTime = puzzle.expected_time_sec ?? 60;
  const outcome: AttemptOutcome = {
    solved: result.solved,
    progress_score: result.partial_score,
    time_ratio: timeTakenSec / expectedTime,
    hints_used: hintsUsed,
    gave_up: gaveUp,
    difficulty_taken: puzzle.difficulty,
    skill_before: skillBefore,
    skill_after: skillAfter,
  };

  const rewardResult = calculateReward(outcome);

  const agent = await loadAgent(puzzle.module_id);
  const updateResult = agent.update(
    stateBefore,
    actionTaken,
    rewardResult.total,
    stateAfter,
  );
  agent.incrementEpisode();
  agent.decayEpsilon();
  await saveAgent(agent);

  await admin.from("rl_events").insert({
    user_id: userId,
    module_id: puzzle.module_id,
    attempt_id: attemptId,
    state_before: stateBefore,
    state_key_before: stateKeyBefore,
    action_taken: actionTaken,
    was_exploration: rlContext?.was_exploration ?? false,
    state_after: stateAfter,
    state_key_after: stateKeyAfter,
    reward: rewardResult.total,
    q_value_before: updateResult.q_value_before,
    q_value_after: updateResult.q_value_after,
    td_error: updateResult.td_error,
    epsilon_at_decision:
      rlContext?.epsilon_at_decision ?? agent.getMetadata().epsilon,
  });

  await supabase
    .from("attempts")
    .update({
      reward: rewardResult.total,
      state_snapshot: stateBefore,
      action_taken: {
        difficulty: puzzle.difficulty,
        action: actionTaken,
        state_key: stateKeyBefore,
      },
    })
    .eq("id", attemptId);

  return {
    reward: rewardResult.total,
    q_value_before: updateResult.q_value_before,
    q_value_after: updateResult.q_value_after,
    td_error: updateResult.td_error,
    state_key_before: stateKeyBefore,
    state_key_after: stateKeyAfter,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toAction(rawAction: number | undefined, difficulty: number): RLAction {
  if (rawAction === 1 || rawAction === 2 || rawAction === 3) {
    return rawAction;
  }
  if (difficulty <= 2) return 1;
  if (difficulty === 3) return 2;
  return 3;
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
