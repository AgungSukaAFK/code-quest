import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      return NextResponse.json({ error: "module_id required" }, { status: 400 });
    }

    let query = supabase
      .from("puzzles")
      .select("*")
      .eq("module_id", module_id)
      .eq("type", "decomposition_sort");

    if (exclude_ids.length > 0) {
      const quotedIds = exclude_ids.map((id) => `"${id.replaceAll('"', '')}"`);
      query = query.not("id", "in", `(${quotedIds.join(",")})`);
    }

    const { data: puzzles, error } = await query.order("difficulty", {
      ascending: true,
    });

    if (error) throw error;

    if (!puzzles || puzzles.length === 0) {
      return NextResponse.json(
        { error: "No more puzzles", completed: true },
        { status: 404 },
      );
    }

    const lowestDifficulty = puzzles[0].difficulty;
    const candidates = puzzles.filter(
      (puzzle) => puzzle.difficulty === lowestDifficulty,
    );
    const selected = candidates[Math.floor(Math.random() * candidates.length)];

    return NextResponse.json({ puzzle: selected });
  } catch (error) {
    console.error("GET puzzle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
