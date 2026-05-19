"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/app/(game)/leaderboard/page";

interface LeaderboardClientProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  viewerRole: string | null;
  viewerClassName: string | null;
}

const MEDALS = ["🥇", "🥈", "🥉"];

function getTier(totalCorrect: number) {
  if (totalCorrect >= 50) return { label: "Ahli",        emoji: "🔥", bg: "bg-amber-500/15",  text: "text-amber-600 dark:text-amber-400" };
  if (totalCorrect >= 25) return { label: "Mahir",       emoji: "⭐", bg: "bg-purple-500/15", text: "text-purple-600 dark:text-purple-400" };
  if (totalCorrect >= 10) return { label: "Berkembang",  emoji: "📈", bg: "bg-blue-500/15",   text: "text-blue-600 dark:text-blue-400" };
  if (totalCorrect >= 3)  return { label: "Pemula",      emoji: "🌱", bg: "bg-emerald-500/15",text: "text-emerald-600 dark:text-emerald-400" };
  return                         { label: "Baru Mulai",  emoji: "✨", bg: "bg-muted",          text: "text-muted-foreground" };
}

const medalCard: Record<number, string> = {
  1: "border-amber-400/50 bg-amber-400/5",
  2: "border-slate-400/50 bg-slate-400/5",
  3: "border-orange-400/50 bg-orange-500/5",
};

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

export function LeaderboardClient({ entries, currentUserId, viewerRole, viewerClassName }: LeaderboardClientProps) {
  const [classFilter, setClassFilter] = useState<string>("__all__");
  const isStudentView = viewerRole === "siswa";

  const classes = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => { if (e.className) set.add(e.className); });
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    if (isStudentView) return entries;
    if (classFilter === "__all__") return entries;
    return entries.filter((e) => e.className === classFilter).map((e, i) => ({ ...e, rank: i + 1 }));
  }, [entries, classFilter, isStudentView]);

  const myEntry = filtered.find((e) => e.userId === currentUserId);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🏆 {isStudentView && viewerClassName ? `Papan Peringkat ${viewerClassName}` : "Papan Peringkat"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isStudentView
            ? `Peringkat siswa di ${viewerClassName ?? "kelasmu"} berdasarkan soal yang berhasil dijawab`
            : "Peringkat siswa berdasarkan soal yang berhasil dijawab"}
        </p>
      </div>

      {/* My position highlight */}
      {myEntry && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 px-4 py-3 flex items-center gap-3">
          <span className="text-xl shrink-0">{myEntry.rank <= 3 ? MEDALS[myEntry.rank - 1] : `#${myEntry.rank}`}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Posisimu saat ini</p>
            <p className="text-xs text-muted-foreground">
              ✅ {myEntry.totalCorrect} soal benar
              {myEntry.totalAttempts > 0 && (
                <> · {Math.round((myEntry.totalCorrect / myEntry.totalAttempts) * 100)}% akurasi</>
              )}
            </p>
          </div>
          <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", getTier(myEntry.totalCorrect).bg, getTier(myEntry.totalCorrect).text)}>
            {getTier(myEntry.totalCorrect).emoji} {getTier(myEntry.totalCorrect).label}
          </span>
        </div>
      )}

      {/* Class filter (moderator only) */}
      {!isStudentView && classes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setClassFilter("__all__")}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              classFilter === "__all__" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
            )}
          >
            Semua Kelas
          </button>
          {classes.map((cls) => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                classFilter === cls ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
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
          {filtered.map((entry, listIdx) => {
            const isMe = entry.userId === currentUserId;
            const isMedal = entry.rank <= 3;
            const name = entry.displayName || entry.username || "Petualang";
            const tier = getTier(entry.totalCorrect);
            const accuracy = entry.totalAttempts > 0
              ? Math.round((entry.totalCorrect / entry.totalAttempts) * 100)
              : 0;

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: listIdx * 0.04 }}
              >
                <Card className={cn(
                  "transition-shadow",
                  isMedal && medalCard[entry.rank],
                  isMe && !isMedal && "border-primary/40 bg-primary/5",
                )}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className="w-8 shrink-0 text-center">
                        {isMedal ? (
                          <span className="text-xl">{MEDALS[entry.rank - 1]}</span>
                        ) : (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                            {entry.rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={entry.avatarSeed ? avatarUrl(entry.avatarSeed) : undefined} />
                        <AvatarFallback>{name[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                      </Avatar>

                      {/* Name + class + tier */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-sm truncate">{name}</span>
                          {isMe && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/50 text-primary">
                              Kamu
                            </Badge>
                          )}
                          <span className={cn("text-[11px] font-medium px-1.5 py-0.5 rounded-full", tier.bg, tier.text)}>
                            {tier.emoji} {tier.label}
                          </span>
                        </div>
                        {entry.className && (
                          <Badge variant="secondary" className="mt-0.5 text-[10px] px-1.5 py-0">
                            {entry.className}
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="shrink-0 text-right">
                        <p className="text-base font-bold leading-tight">
                          {entry.totalCorrect}
                          <span className="text-xs font-normal text-muted-foreground"> benar</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {entry.totalAttempts > 0
                            ? `dari ${entry.totalAttempts} soal · ${accuracy}%`
                            : "belum ada soal"}
                        </p>
                      </div>
                    </div>

                    {/* Accuracy bar */}
                    {entry.totalAttempts > 0 && (
                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${accuracy}%` }}
                          transition={{ duration: 0.6, delay: listIdx * 0.04 + 0.2, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full",
                            entry.rank === 1 ? "bg-amber-400" :
                            entry.rank === 2 ? "bg-slate-400" :
                            entry.rank === 3 ? "bg-orange-400" :
                            accuracy >= 70 ? "bg-emerald-500" : "bg-primary",
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-center text-xs text-muted-foreground pb-4">
          {filtered.length} siswa
          {isStudentView
            ? viewerClassName ? ` di ${viewerClassName}` : ""
            : classFilter !== "__all__" ? ` di kelas ${classFilter}` : ""}
        </p>
      )}
    </main>
  );
}
