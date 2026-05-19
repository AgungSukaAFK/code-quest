import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function calcPoints(timerSeconds: number, responseMs: number, isCorrect: boolean): number {
  if (!isCorrect) return 0;
  const ratio = Math.min(1, responseMs / (timerSeconds * 1000));
  return Math.round(1000 - 500 * ratio); // 1000 → 500 based on speed
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { room_id, question_id, selected_option_id } = await request.json() as {
      room_id?: string;
      question_id?: string;
      selected_option_id?: string;
    };

    if (!room_id || !question_id || !selected_option_id) {
      return NextResponse.json({ error: "room_id, question_id, selected_option_id diperlukan" }, { status: 400 });
    }

    const [{ data: room }, { data: question }, { data: player }] = await Promise.all([
      supabase.from("multiplayer_rooms").select("id,status,timer_seconds,question_shown_at,current_question_index").eq("id", room_id).single(),
      supabase.from("room_questions").select("id,correct_option_id,question_order").eq("id", question_id).single(),
      supabase.from("room_players").select("id,score").eq("room_id", room_id).eq("user_id", user.id).single(),
    ]);

    if (!room || !question || !player) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    if (room.status !== "playing") {
      return NextResponse.json({ error: "Game tidak sedang berlangsung" }, { status: 409 });
    }
    if (question.question_order !== room.current_question_index) {
      return NextResponse.json({ error: "Soal tidak aktif" }, { status: 409 });
    }

    const responseMs = room.question_shown_at
      ? Date.now() - new Date(room.question_shown_at).getTime()
      : room.timer_seconds * 1000;

    const tooLate = responseMs > room.timer_seconds * 1000 + 1000;
    const isCorrect = selected_option_id === question.correct_option_id && !tooLate;
    const points = tooLate ? 0 : calcPoints(room.timer_seconds, responseMs, isCorrect);

    const { error: answerErr } = await supabase.from("room_answers").insert({
      room_id,
      question_id,
      player_id: player.id,
      selected_option_id,
      is_correct: isCorrect,
      points_earned: points,
      response_time_ms: Math.round(responseMs),
    });

    if (answerErr?.code === "23505") {
      return NextResponse.json({ error: "Sudah menjawab soal ini" }, { status: 409 });
    }
    if (answerErr) throw answerErr;

    if (points > 0) {
      await supabase
        .from("room_players")
        .update({ score: player.score + points })
        .eq("id", player.id);
    }

    return NextResponse.json({ is_correct: isCorrect, points_earned: points, response_time_ms: Math.round(responseMs) });
  } catch (err) {
    console.error("multiplayer/answer error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
