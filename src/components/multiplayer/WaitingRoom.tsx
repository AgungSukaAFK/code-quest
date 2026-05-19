"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Crown, Loader2, Users, Swords, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MultiplayerRoom, RoomPlayer } from "@/types/multiplayer";

interface Props {
  room: MultiplayerRoom;
  players: RoomPlayer[];
  isHost: boolean;
  currentPlayerId: string;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Mudah", medium: "Menengah", hard: "Sulit", random: "Acak",
};

export function WaitingRoom({ room, players, isHost, currentPlayerId }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  async function handleLeave() {
    setLeaving(true);
    try {
      const res = await fetch("/api/multiplayer/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: room.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal keluar"); return; }
      router.push("/multiplayer");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLeaving(false);
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Kode disalin!");
  }

  async function handleStart() {
    setStarting(true);
    try {
      const res = await fetch("/api/multiplayer/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: room.id }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error ?? "Gagal memulai");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setStarting(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-4"
      >
        {/* Room code */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-purple-400">Kode Room</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-bold tracking-[0.25em] text-white">{room.code}</span>
            <button
              onClick={copyCode}
              className="rounded-lg bg-white/10 p-2 text-purple-300 transition-colors hover:bg-white/20 hover:text-white"
            >
              {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-purple-400">Bagikan kode ke temanmu</p>
        </div>

        {/* Settings */}
        <div className="flex gap-2 text-sm">
          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
            <p className="text-purple-400 text-xs">Kesulitan</p>
            <p className="font-semibold text-white">{DIFFICULTY_LABEL[room.difficulty]}</p>
          </div>
          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
            <p className="text-purple-400 text-xs">Waktu/Soal</p>
            <p className="font-semibold text-white">{room.timer_seconds} dtk</p>
          </div>
          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
            <p className="text-purple-400 text-xs">Soal</p>
            <p className="font-semibold text-white">10</p>
          </div>
        </div>

        {/* Player list */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-purple-200">
              <Users className="h-4 w-4" />
              Pemain
            </div>
            <span className="rounded-full bg-purple-500/30 px-2 py-0.5 text-xs font-bold text-white">
              {players.length}/{room.max_players}
            </span>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {players.map((player) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                    player.id === currentPlayerId ? "bg-purple-500/20 ring-1 ring-purple-500/40" : "bg-white/5"
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/50 text-sm font-bold text-white">
                    {player.display_name[0].toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-medium text-white">{player.display_name}</span>
                  {player.is_host && <Crown className="h-4 w-4 text-amber-400" />}
                  {player.id === currentPlayerId && (
                    <span className="text-xs text-purple-400">(kamu)</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {players.length < 2 && (
            <p className="mt-3 text-center text-xs text-purple-400">
              Menunggu pemain lain... minimal 2 pemain untuk mulai
            </p>
          )}
        </div>

        {/* Start button (host only) */}
        {isHost && (
          <Button
            onClick={handleStart}
            disabled={players.length < 2 || starting}
            size="lg"
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
          >
            {starting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Swords className="mr-2 h-5 w-5" />
            )}
            Mulai Pertandingan!
          </Button>
        )}

        {!isHost && (
          <p className="text-center text-sm text-purple-400">
            Menunggu host memulai pertandingan...
          </p>
        )}

        <button
          onClick={handleLeave}
          disabled={leaving}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm text-purple-400 transition-colors hover:text-rose-400 disabled:opacity-50"
        >
          {leaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {isHost ? "Tutup & Keluar Room" : "Keluar Room"}
        </button>
      </motion.div>
    </main>
  );
}
