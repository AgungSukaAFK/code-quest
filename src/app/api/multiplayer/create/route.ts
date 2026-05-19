import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateQuestionsFromPuzzles } from "@/lib/game/question-generator";
import type { Difficulty } from "@/types/multiplayer";

type PuzzleRow = { id: string; type: string; module_id: string; content: Record<string, unknown> };

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const DIFFICULTY_MAP: Record<Difficulty, number[]> = {
  easy: [1, 2],
  medium: [3],
  hard: [4, 5],
  random: [1, 2, 3, 4, 5],
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { difficulty = "random", timer_seconds = 20, display_name, avatar_seed } =
      await request.json() as {
        difficulty?: Difficulty;
        timer_seconds?: number;
        display_name?: string;
        avatar_seed?: string;
      };

    if (!display_name) return NextResponse.json({ error: "display_name required" }, { status: 400 });

    const safeTimer = Math.min(60, Math.max(15, timer_seconds));
    const difficultyLevels = DIFFICULTY_MAP[difficulty] ?? DIFFICULTY_MAP.random;

    // Fetch puzzles for both modules
    const [{ data: decompPuzzles }, { data: boolPuzzles }] = await Promise.all([
      supabase
        .from("puzzles")
        .select("id,type,module_id,content")
        .eq("module_id", "M2")
        .in("difficulty", difficultyLevels),
      supabase
        .from("puzzles")
        .select("id,type,module_id,content")
        .eq("module_id", "L1")
        .in("difficulty", difficultyLevels),
    ]);

    // Fallback to random if not enough puzzles at selected difficulty
    const [decomp, bool_] = await Promise.all([
      (decompPuzzles?.length ?? 0) >= 5
        ? Promise.resolve(decompPuzzles as PuzzleRow[])
        : supabase
            .from("puzzles")
            .select("id,type,module_id,content")
            .eq("module_id", "M2")
            .then(({ data }) => data as PuzzleRow[]),
      (boolPuzzles?.length ?? 0) >= 5
        ? Promise.resolve(boolPuzzles as PuzzleRow[])
        : supabase
            .from("puzzles")
            .select("id,type,module_id,content")
            .eq("module_id", "L1")
            .then(({ data }) => data as PuzzleRow[]),
    ]);

    const generatedQuestions = generateQuestionsFromPuzzles(decomp ?? [], bool_ ?? []);
    if (generatedQuestions.length < 6) {
      return NextResponse.json({ error: "Tidak cukup soal tersedia" }, { status: 500 });
    }

    // Generate unique room code (retry on conflict)
    let code = "";
    let room = null;
    let lastInsertError: unknown = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      code = generateCode();
      const { data, error } = await supabase
        .from("multiplayer_rooms")
        .insert({
          code,
          host_id: user.id,
          host_name: display_name,
          difficulty,
          timer_seconds: safeTimer,
        })
        .select()
        .single();
      if (!error) { room = data; break; }
      lastInsertError = error;
      // Only retry on unique constraint violation (duplicate code)
      if ((error as { code?: string }).code !== "23505") break;
    }

    if (!room) {
      console.error("multiplayer/create insert error:", lastInsertError);
      return NextResponse.json({ error: "Gagal membuat room" }, { status: 500 });
    }

    // Insert questions
    const questionsToInsert = generatedQuestions.map((q) => ({
      ...q,
      room_id: room.id,
    }));

    const { error: qErr } = await supabase.from("room_questions").insert(questionsToInsert);
    if (qErr) {
      await supabase.from("multiplayer_rooms").delete().eq("id", room.id);
      return NextResponse.json({ error: "Gagal membuat soal" }, { status: 500 });
    }

    // Add host as first player
    await supabase.from("room_players").insert({
      room_id: room.id,
      user_id: user.id,
      display_name,
      avatar_seed: avatar_seed ?? null,
      is_host: true,
    });

    return NextResponse.json({ code: room.code, room_id: room.id });
  } catch (err) {
    console.error("multiplayer/create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
