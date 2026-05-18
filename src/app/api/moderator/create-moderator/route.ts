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

  const { email, password, username } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username: username || email.split("@")[0] },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  if (newUser.user) {
    await admin
      .from("profiles")
      .update({ role: "moderator", username: username || email.split("@")[0] })
      .eq("id", newUser.user.id);
  }

  return NextResponse.json({ ok: true });
}
