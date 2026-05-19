"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Map as MapIcon, RotateCcw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RoomAnswer, RoomPlayer } from "@/types/multiplayer";

interface Props {
  players: RoomPlayer[];
  currentPlayerId: string;
  roomCode: string;
  allAnswers: RoomAnswer[];
  totalQuestions: number;
}

const MEDAL = ["🥇", "🥈", "🥉"];
const PODIUM_HEIGHTS = ["h-28", "h-20", "h-14"];
const PODIUM_COLORS = [
  "from-amber-400 to-yellow-600",
  "from-slate-400 to-slate-500",
  "from-amber-700 to-amber-800",
];

function getLabel(correct: number, total: number) {
  if (total === 0) return { text: "Terus Semangat! 💪", color: "text-purple-400" };
  const pct = correct / total;
  if (pct === 1)   return { text: "SEMPURNA! 🔥",       color: "text-amber-400 font-bold" };
  if (pct >= 0.8)  return { text: "Luar Biasa! ⭐",     color: "text-emerald-400" };
  if (pct >= 0.6)  return { text: "Bagus! 👍",           color: "text-blue-400" };
  if (pct >= 0.4)  return { text: "Lumayan 😊",          color: "text-purple-400" };
  if (pct >= 0.2)  return { text: "Terus Semangat! 💪", color: "text-rose-400" };
  return                   { text: "Jangan Menyerah! 📚", color: "text-rose-300" };
}

function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: ["bg-rose-400", "bg-amber-400", "bg-purple-400", "bg-emerald-400", "bg-blue-400"][i % 5],
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className={cn("absolute h-2 w-2 rounded-sm", p.color)}
          style={{ left: `${p.left}%`, top: -10 }}
          animate={{ y: "110vh", rotate: 720, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export function FinalPodium({ players, currentPlayerId, roomCode, allAnswers, totalQuestions }: Props) {
  // Correct count per player
  const correctMap = new Map<string, number>();
  for (const a of allAnswers) {
    if (a.is_correct) correctMap.set(a.player_id, (correctMap.get(a.player_id) ?? 0) + 1);
  }

  const top3 = players.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumVisualIndex = [1, 0, 2];

  const myRank = players.findIndex((p) => p.id === currentPlayerId) + 1;
  const myCorrect = correctMap.get(currentPlayerId) ?? 0;
  const myLabel = getLabel(myCorrect, totalQuestions);

  return (
    <>
      <Confetti />
      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-1 flex items-center gap-2 text-amber-400"
        >
          <Trophy className="h-8 w-8" />
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Pertandingan Selesai!</h1>
          <Trophy className="h-8 w-8" />
        </motion.div>

        {/* Personal result summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-col items-center gap-1"
        >
          <p className={cn("text-lg font-semibold", myLabel.color)}>{myLabel.text}</p>
          <p className="text-purple-300 text-sm">
            Posisi ke-<span className="font-bold text-white">{myRank}</span>
            {" · "}
            <span className="font-bold text-white">{myCorrect}</span>
            <span className="text-purple-300"> dari {totalQuestions} soal benar</span>
          </p>
        </motion.div>

        {/* Podium visual */}
        {top3.length > 0 && (
          <div className="mb-6 flex w-full items-end justify-center gap-2">
            {podiumOrder.map((player, visualIdx) => {
              const rank = podiumVisualIndex[visualIdx];
              if (!player) return null;
              const correct = correctMap.get(player.id) ?? 0;
              const isMe = player.id === currentPlayerId;
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: visualIdx * 0.15 + 0.3 }}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div className="text-2xl">{MEDAL[rank]}</div>
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ring-2",
                    isMe ? "ring-amber-400" : "ring-white/20",
                    rank === 0 ? "bg-amber-500" : rank === 1 ? "bg-slate-400" : "bg-amber-700",
                  )}>
                    {player.display_name[0].toUpperCase()}
                  </div>
                  <p className={cn("text-center text-xs font-semibold truncate max-w-[70px]", isMe ? "text-amber-300" : "text-white")}>
                    {player.display_name}
                    {isMe && <span className="block text-[10px] text-purple-400">(kamu)</span>}
                  </p>
                  {/* Podium block shows "benar" count, score is secondary */}
                  <div className={cn(
                    "w-full rounded-t-xl bg-linear-to-b flex flex-col items-center justify-center gap-0.5 px-1",
                    PODIUM_HEIGHTS[rank], PODIUM_COLORS[rank],
                  )}>
                    <span className="text-white font-bold text-sm">{correct}/{totalQuestions}</span>
                    <span className="text-white/70 text-[10px]">benar</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full scoreboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-purple-400">Hasil Lengkap</p>
          <div className="space-y-2">
            {players.map((player, idx) => {
              const correct = correctMap.get(player.id) ?? 0;
              const label = getLabel(correct, totalQuestions);
              const isMe = player.id === currentPlayerId;
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.06 }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm",
                    isMe ? "bg-purple-500/20 ring-1 ring-purple-500/40" : "bg-white/5",
                  )}
                >
                  {/* Rank */}
                  <span className="w-5 shrink-0 text-center text-base">
                    {idx < 3 ? MEDAL[idx] : <span className="text-xs font-bold text-purple-400">{idx + 1}</span>}
                  </span>

                  {/* Name */}
                  <span className="flex-1 font-medium text-white truncate">
                    {player.display_name}
                    {isMe && <span className="ml-1 text-[11px] text-purple-400">(kamu)</span>}
                  </span>

                  {/* Correct count chip */}
                  <span className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold",
                    correct >= totalQuestions * 0.8
                      ? "bg-emerald-500/20 text-emerald-400"
                      : correct >= totalQuestions * 0.5
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-white/10 text-purple-300",
                  )}>
                    ✅ {correct}/{totalQuestions}
                  </span>

                  {/* Label */}
                  <span className={cn("shrink-0 text-xs hidden sm:block", label.color)}>
                    {label.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 flex w-full gap-3"
        >
          <Link
            href="/multiplayer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex-1 border-white/20 bg-white/10 text-white hover:bg-white/20")}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Main Lagi
          </Link>
          <Link
            href="/world-map"
            className={cn(buttonVariants({ size: "lg" }), "flex-1 bg-purple-600 hover:bg-purple-500")}
          >
            <MapIcon className="mr-2 h-4 w-4" />
            Kembali ke Peta
          </Link>
        </motion.div>
      </main>
    </>
  );
}
