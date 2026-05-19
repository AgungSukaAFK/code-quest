"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Users, ArrowRight, ArrowLeft, Loader2, HelpCircle, Clock, Ban, Zap, ListChecks, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types/multiplayer";

const INSTRUCTIONS = [
  {
    icon: ListChecks,
    color: "text-purple-400",
    bg: "bg-purple-500/15",
    title: "10 Soal Pilihan Ganda",
    desc: "Campuran soal Dekomposisi dan Logika Boolean dari berbagai tingkat kesulitan.",
  },
  {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    title: "Waktu Terbatas per Soal",
    desc: "Setiap soal punya timer. Jawab sebelum waktu habis atau tidak mendapat poin.",
  },
  {
    icon: Ban,
    color: "text-rose-400",
    bg: "bg-rose-500/15",
    title: "Jawaban Tidak Bisa Diubah",
    desc: "Setelah kamu mengetuk satu pilihan, jawabanmu langsung terkunci. Pikir dulu sebelum memilih!",
    highlight: true,
  },
  {
    icon: Zap,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    title: "Makin Cepat, Makin Banyak Poin",
    desc: "Jawaban benar yang lebih cepat menghasilkan poin lebih tinggi. Kecepatan dan ketepatan sama-sama penting.",
  },
];

function InstructionsModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-500/20 p-2.5">
              <Swords className="h-5 w-5 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Cara Bermain</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-purple-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {INSTRUCTIONS.map(({ icon: Icon, color, bg, title, desc, highlight }) => (
            <div
              key={title}
              className={cn(
                "flex gap-3 rounded-2xl p-3.5",
                highlight
                  ? "border border-rose-500/40 bg-rose-500/10"
                  : "border border-white/5 bg-white/5",
              )}
            >
              <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", highlight ? "text-rose-300" : "text-white")}>
                  {title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-purple-300">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-rose-600 hover:bg-rose-500 font-semibold"
          size="lg"
        >
          Siap Bertanding!
        </Button>
      </motion.div>
    </motion.div>
  );
}

interface Props {
  displayName: string;
  avatarSeed: string | null;
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: "easy", label: "Mudah", desc: "Soal level 1-2", color: "bg-emerald-500 hover:bg-emerald-400 border-emerald-400" },
  { value: "medium", label: "Menengah", desc: "Soal level 3", color: "bg-amber-500 hover:bg-amber-400 border-amber-400" },
  { value: "hard", label: "Sulit", desc: "Soal level 4-5", color: "bg-rose-500 hover:bg-rose-400 border-rose-400" },
  { value: "random", label: "Acak", desc: "Semua level", color: "bg-purple-500 hover:bg-purple-400 border-purple-400" },
];

type View = "home" | "create" | "join";

export function MultiplayerLobbyClient({ displayName, avatarSeed }: Props) {
  const router = useRouter();
  const [view, setView] = useState<View>("home");
  const [difficulty, setDifficulty] = useState<Difficulty>("random");
  const [timer, setTimer] = useState(20);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("mp_instructions_seen");
    if (!seen) setShowInstructions(true);
  }, []);

  function closeInstructions() {
    localStorage.setItem("mp_instructions_seen", "1");
    setShowInstructions(false);
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, timer_seconds: timer, display_name: displayName, avatar_seed: avatarSeed }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal membuat room"); return; }
      router.push(`/multiplayer/${data.code}`);
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (joinCode.trim().length < 6) { toast.error("Masukkan kode 6 karakter"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim(), display_name: displayName, avatar_seed: avatarSeed }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal bergabung"); return; }
      router.push(`/multiplayer/${data.code}`);
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <AnimatePresence>
        {showInstructions && <InstructionsModal onClose={closeInstructions} />}
      </AnimatePresence>

      {/* Floating particles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-purple-400/40"
            style={{ left: `${(i * 8.3) % 100}%`, top: `${(i * 13 + 10) % 90}%` }}
            animate={{ y: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mb-3 flex justify-center">
          <div className="rounded-full bg-rose-500/20 p-4 ring-4 ring-rose-500/30">
            <Swords className="h-10 w-10 text-rose-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Arena Pertempuran</h1>
        <p className="mt-1 text-purple-300">Tantang temanmu dalam kuis seru!</p>
        <button
          onClick={() => setShowInstructions(true)}
          className="mt-3 flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-200 transition-colors mx-auto"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Cara bermain
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex w-full max-w-sm flex-col gap-4"
          >
            <button
              onClick={() => setView("create")}
              className="group relative overflow-hidden rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-left transition-all hover:border-rose-400/70 hover:bg-rose-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-rose-500/20 p-3">
                  <Swords className="h-6 w-6 text-rose-400" />
                </div>
                <div>
                  <p className="font-bold text-white">Buat Room</p>
                  <p className="text-sm text-purple-300">Jadi host, pilih pengaturan</p>
                </div>
                <ArrowRight className="ml-auto h-5 w-5 text-rose-400 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            <button
              onClick={() => setView("join")}
              className="group relative overflow-hidden rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-6 text-left transition-all hover:border-indigo-400/70 hover:bg-indigo-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-indigo-500/20 p-3">
                  <Users className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="font-bold text-white">Gabung Room</p>
                  <p className="text-sm text-purple-300">Masukkan kode dari temanmu</p>
                </div>
                <ArrowRight className="ml-auto h-5 w-5 text-indigo-400 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </motion.div>
        )}

        {view === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <button onClick={() => setView("home")} className="flex items-center gap-1 text-sm text-purple-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Kembali
            </button>

            <div>
              <p className="mb-3 text-sm font-medium text-purple-200">Kesulitan Soal</p>
              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDifficulty(opt.value)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      difficulty === opt.value
                        ? cn(opt.color, "text-white")
                        : "border-white/10 bg-white/5 text-purple-300 hover:bg-white/10",
                    )}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs opacity-80">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-purple-200">Waktu per Soal</p>
                <span className="rounded-full bg-purple-500/30 px-3 py-0.5 text-sm font-bold text-white">{timer} dtk</span>
              </div>
              <input
                type="range"
                min={15}
                max={60}
                step={5}
                value={timer}
                onChange={(e) => setTimer(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="mt-1 flex justify-between text-xs text-purple-400">
                <span>15 dtk</span>
                <span>60 dtk</span>
              </div>
            </div>

            <Button onClick={handleCreate} disabled={loading} className="w-full bg-rose-600 hover:bg-rose-500" size="lg">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Swords className="mr-2 h-4 w-4" />}
              Buat Room
            </Button>
          </motion.div>
        )}

        {view === "join" && (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <button onClick={() => setView("home")} className="flex items-center gap-1 text-sm text-purple-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Kembali
            </button>

            <div>
              <p className="mb-2 text-sm font-medium text-purple-200">Kode Room</p>
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                placeholder="Contoh: ABC123"
                maxLength={6}
                className="border-white/20 bg-white/10 text-center text-xl font-bold uppercase tracking-[0.3em] text-white placeholder:text-purple-400/50"
                autoFocus
              />
            </div>

            <Button onClick={handleJoin} disabled={loading || joinCode.length < 6} className="w-full bg-indigo-600 hover:bg-indigo-500" size="lg">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
              Gabung Room
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
