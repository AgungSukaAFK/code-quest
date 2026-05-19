"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Map, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RoomPlayer } from "@/types/multiplayer";

interface Props {
  players: RoomPlayer[];
  currentPlayerId: string;
  roomCode: string;
}

const MEDAL = ["🥇", "🥈", "🥉"];
const PODIUM_HEIGHTS = ["h-28", "h-20", "h-14"];
const PODIUM_COLORS = [
  "from-amber-400 to-yellow-600",
  "from-slate-400 to-slate-500",
  "from-amber-700 to-amber-800",
];

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

export function FinalPodium({ players, currentPlayerId, roomCode }: Props) {
  const top3 = players.slice(0, 3);
  // Reorder for visual podium: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumVisualIndex = [1, 0, 2]; // maps visual position to rank

  const myRank = players.findIndex((p) => p.id === currentPlayerId) + 1;
  const myScore = players.find((p) => p.id === currentPlayerId)?.score ?? 0;

  return (
    <>
      <Confetti />
      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-2 flex items-center gap-2 text-amber-400"
        >
          <Trophy className="h-8 w-8" />
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Pertandingan Selesai!</h1>
          <Trophy className="h-8 w-8" />
        </motion.div>

        <p className="mb-8 text-purple-300">
          Kamu berada di posisi ke-{myRank} dengan {myScore.toLocaleString()} poin
        </p>

        {/* Podium visual */}
        {top3.length > 0 && (
          <div className="mb-8 flex w-full items-end justify-center gap-2">
            {podiumOrder.map((player, visualIdx) => {
              const rank = podiumVisualIndex[visualIdx];
              if (!player) return null;
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: visualIdx * 0.15 + 0.3 }}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="text-2xl">{MEDAL[rank]}</div>
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white", rank === 0 ? "bg-amber-500" : rank === 1 ? "bg-slate-400" : "bg-amber-700")}>
                    {player.display_name[0].toUpperCase()}
                  </div>
                  <p className={cn("text-center text-xs font-semibold", player.id === currentPlayerId ? "text-amber-300" : "text-white")}>
                    {player.display_name}
                  </p>
                  <div className={cn("w-full rounded-t-xl bg-linear-to-b flex items-center justify-center text-white font-bold text-sm", PODIUM_HEIGHTS[rank], PODIUM_COLORS[rank])}>
                    {player.score.toLocaleString()}
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
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-purple-400">Skor Lengkap</p>
          <div className="space-y-2">
            {players.map((player, idx) => (
              <div
                key={player.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                  player.id === currentPlayerId ? "bg-purple-500/20 ring-1 ring-purple-500/40" : "bg-white/5",
                )}
              >
                <span className="w-6 text-center font-bold text-purple-400">{idx + 1}</span>
                <span className="flex-1 font-medium text-white">
                  {player.display_name}
                  {player.id === currentPlayerId && <span className="ml-1 text-purple-400 text-xs">(kamu)</span>}
                </span>
                <span className="font-bold text-amber-400">{player.score.toLocaleString()}</span>
              </div>
            ))}
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
            <Map className="mr-2 h-4 w-4" />
            Kembali ke Peta
          </Link>
        </motion.div>
      </main>
    </>
  );
}
