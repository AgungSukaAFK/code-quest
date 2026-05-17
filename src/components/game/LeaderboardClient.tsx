"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/app/(game)/leaderboard/page";

interface LeaderboardClientProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

const medalStyle: Record<number, string> = {
  1: "border-amber-400/60 bg-amber-400/5",
  2: "border-slate-400/60 bg-slate-400/5",
  3: "border-orange-400/60 bg-orange-500/5",
};

const rankBadgeStyle: Record<number, string> = {
  1: "bg-amber-400/20 text-amber-600 dark:text-amber-400",
  2: "bg-slate-400/20 text-slate-600 dark:text-slate-300",
  3: "bg-orange-400/20 text-orange-600 dark:text-orange-400",
};

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

export function LeaderboardClient({
  entries,
  currentUserId,
}: LeaderboardClientProps) {
  const [classFilter, setClassFilter] = useState<string>("__all__");

  const classes = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.className) set.add(e.className);
    });
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    if (classFilter === "__all__") return entries;
    return entries
      .filter((e) => e.className === classFilter)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  }, [entries, classFilter]);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🏆 Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ranking berdasarkan rata-rata skill level semua modul
        </p>
      </div>

      {/* Class filter */}
      {classes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setClassFilter("__all__")}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              classFilter === "__all__"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            Semua Kelas
          </button>
          {classes.map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => setClassFilter(cls)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                classFilter === cls
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {cls}
            </button>
          ))}
        </div>
      )}

      {/* Entries */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <p className="text-4xl mb-3">🏜️</p>
            <p className="font-medium">Belum ada siswa di kelas ini.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => {
            const isCurrentUser = entry.userId === currentUserId;
            const isMedal = entry.rank <= 3;
            const displayName =
              entry.displayName || entry.username || "Petualang";
            const initials = displayName[0]?.toUpperCase() ?? "?";

            return (
              <Card
                key={entry.userId}
                className={cn(
                  "transition-shadow",
                  isMedal && medalStyle[entry.rank],
                  isCurrentUser &&
                    !isMedal &&
                    "border-primary/40 bg-primary/5",
                )}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div
                      className={cn(
                        "w-9 shrink-0 text-center font-bold",
                        isMedal ? "text-xl" : "text-sm text-muted-foreground",
                      )}
                    >
                      {isMedal ? (
                        MEDALS[entry.rank - 1]
                      ) : (
                        <span
                          className={cn(
                            "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs",
                            rankBadgeStyle[entry.rank] ??
                              "bg-muted text-muted-foreground",
                          )}
                        >
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage
                        src={
                          entry.avatarSeed
                            ? avatarUrl(entry.avatarSeed)
                            : undefined
                        }
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>

                    {/* Name + class */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-sm truncate">
                          {displayName}
                        </span>
                        {isCurrentUser && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-primary/50 text-primary"
                          >
                            Kamu
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        {entry.username && (
                          <span className="text-[11px] text-muted-foreground">
                            @{entry.username}
                          </span>
                        )}
                        {entry.className && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {entry.className}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-right min-w-[72px]">
                      <p className="text-lg font-bold leading-none">
                        {entry.score}
                        <span className="text-xs font-normal text-muted-foreground">
                          %
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {entry.totalCorrect} solved
                      </p>
                    </div>
                  </div>

                  {/* Score bar */}
                  <Progress
                    value={entry.score}
                    className={cn(
                      "mt-2.5 h-1.5",
                      entry.rank === 1 && "[&>div]:bg-amber-400",
                      entry.rank === 2 && "[&>div]:bg-slate-400",
                      entry.rank === 3 && "[&>div]:bg-orange-400",
                    )}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-center text-xs text-muted-foreground pb-4">
          {filtered.length} siswa terdaftar
          {classFilter !== "__all__" ? ` di kelas ${classFilter}` : ""}
        </p>
      )}
    </main>
  );
}
