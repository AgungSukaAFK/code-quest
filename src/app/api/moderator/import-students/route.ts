import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeText(v: string) {
  return v.trim().replace(/\s+/g, " ");
}

function buildEmail(nisn: string) {
  return `${nisn}@students.codequest.local`;
}

function buildPassword(nisn: string) {
  const secret = process.env.STUDENT_AUTH_SECRET;
  if (!secret) return null;
  return `Siswa-${nisn}-${secret}`;
}

async function importOne(
  admin: ReturnType<typeof createAdminClient>,
  nisn: string,
  fullName: string,
  className: string,
): Promise<{ nisn: string; name: string; status: "ok" | "skip" | "error"; message?: string }> {
  const base = { nisn, name: fullName };

  const password = buildPassword(nisn);
  if (!password) return { ...base, status: "error", message: "STUDENT_AUTH_SECRET tidak dikonfigurasi" };

  // Skip if NISN already exists
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .ilike("nisn", nisn)
    .maybeSingle();

  if (existing) return { ...base, status: "skip", message: "NISN sudah terdaftar" };

  const { data: created, error } = await admin.auth.admin.createUser({
    email: buildEmail(nisn),
    password,
    email_confirm: true,
    user_metadata: { username: `siswa-${nisn}`, full_name: fullName, nisn },
  });

  if (error || !created.user) {
    return { ...base, status: "error", message: error?.message ?? "Gagal membuat akun" };
  }

  const { error: profileErr } = await admin
    .from("profiles")
    .update({ role: "siswa", nisn, display_name: fullName, class_name: className })
    .eq("id", created.user.id);

  if (profileErr) return { ...base, status: "error", message: profileErr.message };

  return { ...base, status: "ok" };
}

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

  const body = await request.json() as {
    students?: { nisn: string; full_name: string }[];
    class_name?: string;
  };

  if (!Array.isArray(body.students) || body.students.length === 0) {
    return NextResponse.json({ error: "Data siswa tidak boleh kosong" }, { status: 400 });
  }
  if (!body.class_name?.trim()) {
    return NextResponse.json({ error: "class_name wajib diisi" }, { status: 400 });
  }
  if (body.students.length > 200) {
    return NextResponse.json({ error: "Maksimal 200 siswa per import" }, { status: 400 });
  }

  const admin = createAdminClient();
  const className = body.class_name.trim();

  // Process sequentially to avoid rate limiting
  const results = [];
  for (const s of body.students) {
    const nisn = s.nisn?.trim() ?? "";
    const fullName = normalizeText(s.full_name ?? "");
    if (!nisn || !fullName) {
      results.push({ nisn, name: fullName, status: "error" as const, message: "NISN atau nama kosong" });
      continue;
    }
    results.push(await importOne(admin, nisn, fullName, className));
  }

  return NextResponse.json({ results });
}
