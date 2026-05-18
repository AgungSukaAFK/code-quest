"use client";

import Link from "next/link";
import { BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeratorNavProps {
  active: "users" | "puzzles";
}

const LINKS = [
  { key: "users",   href: "/moderator/users",   label: "Pengguna", icon: Users },
  { key: "puzzles", href: "/moderator/puzzles",  label: "Soal",     icon: BookOpen },
] as const;

export function ModeratorNav({ active }: ModeratorNavProps) {
  return (
    <nav className="flex gap-1 border-b pb-0 -mx-4 px-4 overflow-x-auto">
      {LINKS.map(({ key, href, label, icon: Icon }) => (
        <Link
          key={key}
          href={href}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            active === key
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
