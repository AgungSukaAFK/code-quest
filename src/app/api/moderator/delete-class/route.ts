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
  if (!id) {
    return NextResponse.json({ error: "id kelas wajib diisi." }, { status: 400 });
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

  const className = existing.name as string;

  // Lepas siswa dari kelas ini (jadi tanpa kelas), lalu hapus kelasnya.
  const { error: detachError } = await admin
    .from("profiles")
    .update({ class_name: null })
    .eq("class_name", className);

  if (detachError) {
    return NextResponse.json({ error: detachError.message }, { status: 500 });
  }

  const { error: deleteError } = await admin.from("classes").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
