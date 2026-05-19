import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function buildStudentEmail(nisn: string) {
  return `${nisn}@students.codequest.local`;
}

function buildStudentPassword(nisn: string) {
  const secret = process.env.STUDENT_AUTH_SECRET;
  if (!secret) return null;
  return `Siswa-${nisn}-${secret}`;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const nisn = typeof body.nisn === "string" ? body.nisn.trim() : "";
  const fullName =
    typeof body.full_name === "string" ? normalizeText(body.full_name) : "";
  const className =
    typeof body.class_name === "string" ? body.class_name.trim() : "";

  if (!nisn || !fullName) {
    return NextResponse.json(
      { error: "NISN dan Nama Lengkap wajib diisi." },
      { status: 400 },
    );
  }

  const password = buildStudentPassword(nisn);
  if (!password) {
    return NextResponse.json(
      { error: "STUDENT_AUTH_SECRET belum dikonfigurasi di server." },
      { status: 500 },
    );
  }

  const admin = createAdminClient();

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .ilike("nisn", nisn)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json(
      { error: "NISN sudah terdaftar untuk siswa lain." },
      { status: 409 },
    );
  }

  const email = buildStudentEmail(nisn);
  const { data: createdUser, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: `siswa-${nisn}`,
        full_name: fullName,
        nisn,
      },
    });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  if (createdUser.user) {
    const { error: updateProfileError } = await admin
      .from("profiles")
      .update({
        role: "siswa",
        nisn,
        display_name: fullName,
        class_name: className || null,
      })
      .eq("id", createdUser.user.id);

    if (updateProfileError) {
      return NextResponse.json(
        { error: updateProfileError.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
