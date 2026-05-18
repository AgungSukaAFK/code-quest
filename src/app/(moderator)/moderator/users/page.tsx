import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/Header";
import { UsersClient } from "@/components/moderator/UsersClient";

export interface ManagedUser {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  class_name: string | null;
  role: string;
  created_at: string;
}

export default async function ModeratorUsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, username, display_name, class_name, role, created_at")
    .order("created_at", { ascending: false });

  const { data: authUsers } = await admin.auth.admin.listUsers();

  const users: ManagedUser[] = (profiles ?? []).map((p) => {
    const authUser = authUsers?.users.find((u) => u.id === p.id);
    return {
      id: p.id,
      email: authUser?.email ?? "",
      username: p.username,
      display_name: p.display_name,
      class_name: p.class_name,
      role: p.role ?? "siswa",
      created_at: p.created_at,
    };
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        user={{
          id: user.id,
          email: user.email,
          username: currentProfile?.username,
          avatar_seed: currentProfile?.avatar_seed,
          role: currentProfile?.role,
        }}
      />
      <UsersClient users={users} currentUserId={user.id} />
    </div>
  );
}
