import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, class_name } = await request.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ class_name: class_name ?? null })
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
