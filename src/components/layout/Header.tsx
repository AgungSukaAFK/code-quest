"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrainCircuit, LogOut, Map, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user: {
    id: string;
    email?: string;
    username?: string | null;
    avatar_seed?: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const avatarUrl = user?.avatar_seed
    ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.avatar_seed)}`
    : undefined;

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/world-map"
          className="flex items-center gap-2 font-bold text-lg"
        >
          <span>🎮</span>
          <span>CodeQuest</span>
        </Link>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted transition-colors outline-none">
              <Avatar className="h-7 w-7">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                  {user.username?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {user.username ?? "User"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/world-map")}>
                <Map className="mr-2 h-4 w-4" />
                Peta Dunia
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/rl-dashboard")}>
                <BrainCircuit className="mr-2 h-4 w-4" />
                RL Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
