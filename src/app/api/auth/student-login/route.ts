import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
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
  try {
    const { nisn, fullName } = await request.json();

    const normalizedNisn = typeof nisn === "string" ? nisn.trim() : "";
    const normalizedFullName =
      typeof fullName === "string" ? normalizeText(fullName) : "";

    if (!normalizedNisn || !normalizedFullName) {
      return NextResponse.json(
        { error: "NISN dan Nama Lengkap wajib diisi." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, nisn, display_name, role")
      .ilike("nisn", normalizedNisn)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      );
    }

    if (!profile || profile.role !== "siswa") {
      return NextResponse.json(
        { error: "Data siswa tidak ditemukan. Hubungi moderator." },
        { status: 404 },
      );
    }

    if (normalizeText(profile.display_name ?? "") !== normalizedFullName) {
      return NextResponse.json(
        { error: "Kombinasi NISN dan Nama Lengkap tidak sesuai." },
        { status: 401 },
      );
    }

    const password = buildStudentPassword(normalizedNisn);
    if (!password) {
      return NextResponse.json(
        { error: "STUDENT_AUTH_SECRET belum dikonfigurasi di server." },
        { status: 500 },
      );
    }

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: buildStudentEmail(normalizedNisn),
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Akun siswa belum siap login. Hubungi moderator." },
        { status: 401 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Permintaan tidak valid." },
      { status: 400 },
    );
  }
}
