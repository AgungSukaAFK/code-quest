import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadAgent } from "@/lib/rl/q-table-store";
import { buildStudentState } from "@/lib/rl/state-builder";
import { stateToKey } from "@/lib/rl/state";

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
    const { module_id, exclude_ids = [] } = body as {
      module_id?: string;
      session_id?: string;
      exclude_ids?: string[];
    };

    if (!module_id) {
      return NextResponse.json(
        { error: "module_id required" },
        { status: 400 },
      );
    }

    const state = await buildStudentState(user.id, module_id);
    const agent = await loadAgent(module_id);
    const decision = agent.selectAction(state);

    let difficultyRange: number[];
    if (decision.action === 1) difficultyRange = [1, 2];
    else if (decision.action === 2) difficultyRange = [3];
    else difficultyRange = [4, 5];

    let query = supabase
      .from("puzzles")
      .select("*")
      .eq("module_id", module_id)
      .in("difficulty", difficultyRange);

    if (exclude_ids.length > 0) {
      const quotedIds = exclude_ids.map((id) => `"${id.replaceAll('"', "")}"`);
      query = query.not("id", "in", `(${quotedIds.join(",")})`);
    }

    const { data: puzzles, error } = await query.order("difficulty", {
      ascending: true,
    });

    if (error) throw error;

    let candidatePuzzles: Record<string, unknown>[] | null =
      (puzzles as Record<string, unknown>[] | null) ?? null;

    if (!candidatePuzzles || candidatePuzzles.length === 0) {
      let fallbackQuery = supabase
        .from("puzzles")
        .select("*")
        .eq("module_id", module_id);

      if (exclude_ids.length > 0) {
        const quotedIds = exclude_ids.map(
          (id) => `"${id.replaceAll('"', "")}"`,
        );
        fallbackQuery = fallbackQuery.not(
          "id",
          "in",
          `(${quotedIds.join(",")})`,
        );
      }

      const { data: fallbackPuzzles } = await fallbackQuery;
      candidatePuzzles =
        (fallbackPuzzles as Record<string, unknown>[] | null) ?? null;
    }

    if (!candidatePuzzles || candidatePuzzles.length === 0) {
      return NextResponse.json(
        { error: "No more puzzles", completed: true },
        { status: 404 },
      );
    }

    const selected =
      candidatePuzzles[Math.floor(Math.random() * candidatePuzzles.length)];

    return NextResponse.json({
      puzzle: selected,
      rl_decision: {
        ...decision,
        chosen_difficulty: selected.difficulty,
      },
      state,
      state_key: stateToKey(state),
    });
  } catch (error) {
    console.error("GET puzzle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
