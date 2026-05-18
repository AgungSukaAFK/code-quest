"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, BrainCircuit, LogOut, Map, Trophy, User as UserIcon } from "lucide-react";
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
      <div className="container mx-auto px-4 h-14 flex items-center">
        <div className="flex-1">
          <Link href="/world-map" className="flex items-center">
            <Image
              src="/images/codequest.webp"
              alt="CodeQuest"
              width={180}
              height={44}
              className="h-10 w-auto"
              style={{ width: "auto" }}
              unoptimized
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Image
            src="/images/kemdikbud.webp"
            alt="Kemdikbud"
            width={80}
            height={28}
            className="h-7 w-auto object-contain opacity-80"
            style={{ width: "auto" }}
            unoptimized
          />
          <span className="text-border">|</span>
          <Image
            src="/images/unbaja.webp"
            alt="Universitas Banten Jaya"
            width={80}
            height={28}
            className="h-7 w-auto object-contain opacity-80"
            style={{ width: "auto" }}
            unoptimized
          />
          <span className="text-border">|</span>
          <Image
            src="/images/uniba.webp"
            alt="Universitas Bina Bangsa"
            width={80}
            height={28}
            className="h-7 w-auto object-contain opacity-80"
            style={{ width: "auto" }}
            unoptimized
          />
        </div>

        <div className="flex-1 flex justify-end">
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
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem className="py-2.5" onClick={() => router.push("/world-map")}>
                <Map className="mr-2 h-4 w-4" />
                Peta Dunia
              </DropdownMenuItem>
              <DropdownMenuItem
                className="py-2.5"
                onClick={() =>
                  window.open(
                    "/files/Modul Hibah Penelitian.pdf",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Modul Pembelajaran
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2.5" onClick={() => router.push("/leaderboard")}>
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2.5" onClick={() => router.push("/rl-dashboard")}>
                <BrainCircuit className="mr-2 h-4 w-4" />
                RL Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2.5" onClick={() => router.push("/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-2.5" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        </div>
      </div>
    </header>
  );
}
