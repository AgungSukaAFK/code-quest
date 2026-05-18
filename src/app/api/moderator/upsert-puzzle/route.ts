import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "moderator")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, module_id, type, difficulty, title, goal, content, expected_time_sec } = body;

  if (!module_id || !type || !difficulty || !title || !goal || !content) {
    return NextResponse.json({ error: "Field tidak lengkap." }, { status: 400 });
  }

  let parsedContent: unknown;
  try {
    parsedContent = typeof content === "string" ? JSON.parse(content) : content;
  } catch {
    return NextResponse.json({ error: "Format JSON content tidak valid." }, { status: 400 });
  }

  const admin = createAdminClient();

  const payload = {
    module_id,
    type,
    difficulty: Number(difficulty),
    title,
    goal,
    content: parsedContent,
    expected_time_sec: expected_time_sec ? Number(expected_time_sec) : null,
  };

  let error;
  if (id) {
    ({ error } = await admin.from("puzzles").update(payload).eq("id", id));
  } else {
    ({ error } = await admin.from("puzzles").insert(payload));
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
