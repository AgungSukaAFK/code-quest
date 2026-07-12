"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  BrainCircuit,
  LogOut,
  Map,
  Settings2,
  Trophy,
  User as UserIcon,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAudioStore } from "@/stores/audioStore";
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
    display_name?: string | null;
    username?: string | null;
    avatar_seed?: string | null;
    role?: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const muted = useAudioStore((s) => s.muted);
  const toggleMuted = useAudioStore((s) => s.toggleMuted);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const avatarUrl = user?.avatar_seed
    ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.avatar_seed)}`
    : undefined;
  const userDisplayName = user?.display_name || user?.username || "User";
  const userInitial = userDisplayName[0]?.toUpperCase() ?? "U";

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 h-14 flex items-center">
        <div className="flex-1">
          <Link href="/world-map" className="flex items-center">
            <Image
              src="/images/codequest.webp"
              alt="CodeQuest"
              width={180}
              height={40}
              style={{ height: "40px", width: "auto" }}
              unoptimized
              loading="eager"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Image
            src="/images/kemdikbud.webp"
            alt="Kemdikbud"
            width={100}
            height={28}
            className="opacity-80"
            style={{ height: "28px", width: "auto" }}
            unoptimized
          />
          <span className="text-border">|</span>
          <Image
            src="/images/diktisaintek.webp"
            alt="DIKTISAINTEK"
            width={100}
            height={28}
            className="opacity-80"
            style={{ height: "28px", width: "auto" }}
            unoptimized
          />
          <span className="text-border">|</span>
          <Image
            src="/images/bima.webp"
            alt="BIMA"
            width={100}
            height={28}
            className="opacity-80"
            style={{ height: "28px", width: "auto" }}
            unoptimized
          />
          <span className="text-border">|</span>
          <Image
            src="/images/uniba.webp"
            alt="Universitas Bina Bangsa"
            width={100}
            height={28}
            className="opacity-80"
            style={{ height: "28px", width: "auto" }}
            unoptimized
          />
          <span className="text-border">|</span>
          <Image
            src="/images/unbaja.webp"
            alt="Universitas Banten Jaya"
            width={100}
            height={28}
            className="opacity-80"
            style={{ height: "28px", width: "auto" }}
            unoptimized
          />
          <span className="text-border">|</span>
          <Image
            src="/images/smk.webp"
            alt="SMK PGRI 3"
            width={100}
            height={28}
            className="opacity-80"
            style={{ height: "28px", width: "auto" }}
            unoptimized
          />
        </div>

        <div className="flex-1 flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={toggleMuted}
            aria-label={muted ? "Aktifkan suara" : "Matikan suara"}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted transition-colors outline-none">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">
                  {userDisplayName}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  className="py-2.5"
                  onClick={() => router.push("/world-map")}
                >
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
                <DropdownMenuItem
                  className="py-2.5"
                  onClick={() => router.push("/leaderboard")}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Leaderboard
                </DropdownMenuItem>
                {user?.role === "moderator" && (
                  <DropdownMenuItem
                    className="py-2.5"
                    onClick={() => router.push("/rl-dashboard")}
                  >
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    RL Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="py-2.5"
                  onClick={() => router.push("/profile")}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                {user?.role === "moderator" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="py-2.5"
                      onClick={() => router.push("/moderator/users")}
                    >
                      <Settings2 className="mr-2 h-4 w-4" />
                      Manajemen Sistem
                    </DropdownMenuItem>
                  </>
                )}
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

      {/* Strip logo sponsor untuk layar mobile (di desktop tampil di dalam bar) */}
      <div className="md:hidden border-t">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-1.5">
          {[
            { src: "/images/kemdikbud.webp", alt: "Kemdikbud" },
            { src: "/images/diktisaintek.webp", alt: "DIKTISAINTEK" },
            { src: "/images/bima.webp", alt: "BIMA" },
            { src: "/images/uniba.webp", alt: "Universitas Bina Bangsa" },
            { src: "/images/unbaja.webp", alt: "Universitas Banten Jaya" },
            { src: "/images/smk.webp", alt: "SMK PGRI 3" },
          ].map((logo) => (
            <Image
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={80}
              height={20}
              className="shrink-0 opacity-70"
              style={{ height: "20px", width: "auto" }}
              unoptimized
            />
          ))}
        </div>
      </div>
    </header>
  );
}
