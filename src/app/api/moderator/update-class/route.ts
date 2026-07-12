import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const id = typeof body.id === "string" ? body.id : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!id || !name) {
    return NextResponse.json({ error: "id dan nama kelas wajib diisi." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing, error: findError } = await admin
    .from("classes")
    .select("name")
    .eq("id", id)
    .single();

  if (findError || !existing) {
    return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
  }

  const oldName = existing.name as string;
  if (oldName === name) {
    return NextResponse.json({ ok: true });
  }

  const { error: updateError } = await admin
    .from("classes")
    .update({ name })
    .eq("id", id);

  if (updateError) {
    if (updateError.code === "23505") {
      return NextResponse.json({ error: "Kelas dengan nama itu sudah ada." }, { status: 409 });
    }
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Cascade rename ke siswa yang memakai kelas ini.
  const { error: cascadeError } = await admin
    .from("profiles")
    .update({ class_name: name })
    .eq("class_name", oldName);

  if (cascadeError) {
    return NextResponse.json({ error: cascadeError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
