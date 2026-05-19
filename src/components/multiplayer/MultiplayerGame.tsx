"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MultiplayerRoom, RoomPlayer, RoomQuestion, RoomAnswer } from "@/types/multiplayer";

interface Props {
  room: MultiplayerRoom;
  question: RoomQuestion;
  players: RoomPlayer[];
  answers: RoomAnswer[];
  myAnswer: RoomAnswer | null;
  currentPlayer: RoomPlayer;
  isHost: boolean;
  totalQuestions: number;
}

const OPTION_COLORS = [
  "from-blue-600 to-blue-700 border-blue-500 hover:from-blue-500 hover:to-blue-600",
  "from-rose-600 to-rose-700 border-rose-500 hover:from-rose-500 hover:to-rose-600",
  "from-amber-600 to-amber-700 border-amber-500 hover:from-amber-500 hover:to-amber-600",
  "from-emerald-600 to-emerald-700 border-emerald-500 hover:from-emerald-500 hover:to-emerald-600",
];

const OPTION_LABELS = ["A", "B", "C", "D"];

// ── Web Audio sounds ──────────────────────────────────────────────────────────
function useGameSounds() {
  const ctx = useRef<AudioContext | null>(null);

  function ac() {
    if (!ctx.current) ctx.current = new AudioContext();
    if (ctx.current.state === "suspended") ctx.current.resume();
    return ctx.current;
  }

  function playTick(urgent = false) {
    try {
      const a = ac();
      const osc = a.createOscillator();
      const g = a.createGain();
      osc.connect(g); g.connect(a.destination);
      osc.frequency.value = urgent ? 1100 : 820;
      g.gain.setValueAtTime(urgent ? 0.12 : 0.07, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.07);
      osc.start(a.currentTime); osc.stop(a.currentTime + 0.07);
    } catch { /* AudioContext blocked — ignore */ }
  }

  function playSelect() {
    try {
      const a = ac();
      const osc = a.createOscillator();
      const g = a.createGain();
      osc.connect(g); g.connect(a.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, a.currentTime);
      osc.frequency.exponentialRampToValueAtTime(380, a.currentTime + 0.12);
      g.gain.setValueAtTime(0.18, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.12);
      osc.start(a.currentTime); osc.stop(a.currentTime + 0.12);
    } catch { /* ignore */ }
  }

  function playCorrect() {
    try {
      const a = ac();
      // Two ascending notes: C5 → E5
      ([0, 0.13] as const).forEach((delay, i) => {
        const osc = a.createOscillator();
        const g = a.createGain();
        osc.connect(g); g.connect(a.destination);
        osc.frequency.value = i === 0 ? 523 : 659;
        g.gain.setValueAtTime(0.18, a.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + delay + 0.35);
        osc.start(a.currentTime + delay); osc.stop(a.currentTime + delay + 0.35);
      });
    } catch { /* ignore */ }
  }

  function playWrong() {
    try {
      const a = ac();
      const osc = a.createOscillator();
      const g = a.createGain();
      osc.connect(g); g.connect(a.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, a.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, a.currentTime + 0.28);
      g.gain.setValueAtTime(0.1, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.28);
      osc.start(a.currentTime); osc.stop(a.currentTime + 0.28);
    } catch { /* ignore */ }
  }

  return { playTick, playSelect, playCorrect, playWrong };
}
// ─────────────────────────────────────────────────────────────────────────────

export function MultiplayerGame({
  room,
  question,
  players,
  answers,
  myAnswer,
  currentPlayer,
  isHost,
  totalQuestions,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(room.timer_seconds);
  const [phase, setPhase] = useState<"answering" | "revealing" | "transitioning">("answering");
  const [submitting, setSubmitting] = useState(false);
  const [nextCountdown, setNextCountdown] = useState(5);
  // Optimistic: show selection immediately without waiting for realtime
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);

  const hasCalledNext = useRef(false);
  const lastTickSecond = useRef(-1);
  const hasPlayedReveal = useRef(false);
  const { playTick, playSelect, playCorrect, playWrong } = useGameSounds();

  // Reset per question
  useEffect(() => {
    hasCalledNext.current = false;
    hasPlayedReveal.current = false;
    lastTickSecond.current = -1;
    setPhase("answering");
    setNextCountdown(5);
    setLocalSelectedId(null);
  }, [question.id]);

  // Sync timer + tick sounds
  useEffect(() => {
    if (!room.question_shown_at) return;

    const tick = () => {
      const elapsed = (Date.now() - new Date(room.question_shown_at!).getTime()) / 1000;
      const remaining = Math.max(0, room.timer_seconds - elapsed);
      setTimeLeft(remaining);

      const secs = Math.ceil(remaining);
      if (remaining > 0 && secs !== lastTickSecond.current) {
        lastTickSecond.current = secs;
        playTick(secs <= 5);
      }

      if (remaining <= 0) setPhase("revealing");
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [room.question_shown_at, room.timer_seconds, question.id]);

  // Reveal sound when phase changes
  useEffect(() => {
    if (phase !== "revealing" || hasPlayedReveal.current) return;
    if (!myAnswer) return;
    hasPlayedReveal.current = true;
    if (myAnswer.is_correct) playCorrect(); else playWrong();
  }, [phase, myAnswer]);

  // Also play reveal sound if myAnswer arrives while already in revealing phase
  useEffect(() => {
    if (phase !== "revealing" || !myAnswer || hasPlayedReveal.current) return;
    hasPlayedReveal.current = true;
    if (myAnswer.is_correct) playCorrect(); else playWrong();
  }, [myAnswer]);

  // Auto-advance for host after reveal
  useEffect(() => {
    if (phase !== "revealing" || !isHost || hasCalledNext.current) return;

    let countdown = 5;
    setNextCountdown(countdown);

    const id = setInterval(async () => {
      countdown -= 1;
      setNextCountdown(countdown);
      if (countdown <= 0) {
        clearInterval(id);
        if (hasCalledNext.current) return;
        hasCalledNext.current = true;
        setPhase("transitioning");
        await fetch("/api/multiplayer/next", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room_id: room.id }),
        });
      }
    }, 1000);

    return () => clearInterval(id);
  }, [phase, isHost, room.id]);

  // Reveal when all players answered
  useEffect(() => {
    if (answers.length >= players.length && players.length > 0) setPhase("revealing");
  }, [answers.length, players.length]);

  async function handleAnswer(optionId: string) {
    if (myAnswer || localSelectedId || submitting || phase !== "answering") return;
    setLocalSelectedId(optionId); // optimistic — instant feedback
    playSelect();
    setSubmitting(true);
    try {
      const res = await fetch("/api/multiplayer/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: room.id, question_id: question.id, selected_option_id: optionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLocalSelectedId(null); // rollback
        toast.error(data.error ?? "Gagal menjawab");
      }
    } catch {
      setLocalSelectedId(null);
      toast.error("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  const timerPct = (timeLeft / room.timer_seconds) * 100;
  const timerColor = timerPct > 50 ? "bg-emerald-500" : timerPct > 25 ? "bg-amber-500" : "bg-rose-500";
  const typeLabel = question.puzzle_type === "decomposition" ? "🧩 Dekomposisi" : "⚡ Boolean";

  // Use local selection for immediate feedback; fall back to server answer
  const displaySelected = myAnswer?.selected_option_id ?? localSelectedId;

  function getOptionState(optId: string) {
    if (phase === "answering") return displaySelected === optId ? "selected" : "idle";
    if (optId === question.correct_option_id) return "correct";
    if (displaySelected === optId) return "wrong";
    return "dimmed";
  }

  // Which players have answered (for dot indicators)
  const answeredIds = new Set(answers.map((a) => a.player_id));
  const myPoints = myAnswer?.points_earned ?? 0;

  return (
    <main className="flex-1 flex flex-col px-4 py-4 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="rounded-full bg-white/10 px-3 py-1 text-purple-200 font-medium">
          Soal {room.current_question_index + 1}/{totalQuestions}
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-purple-200">{typeLabel}</span>
      </div>

      {/* Timer bar */}
      <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={cn("h-full rounded-full transition-colors duration-300", timerColor)}
          style={{ width: `${timerPct}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <div className="mb-3 flex items-center justify-between">
        <span className={cn(
          "text-sm font-bold tabular-nums transition-colors",
          timeLeft <= 5 && phase === "answering" ? "text-rose-400 animate-pulse" : "text-white",
        )}>
          {phase === "answering" ? `${Math.ceil(timeLeft)} dtk` : phase === "revealing" ? "Waktu habis!" : ""}
        </span>

        {/* Per-player answered dots */}
        <div className="flex items-center gap-1.5">
          {players.map((p) => (
            <motion.div
              key={p.id}
              initial={false}
              animate={answeredIds.has(p.id) ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.25 }}
              title={p.display_name}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300",
                answeredIds.has(p.id)
                  ? "bg-emerald-500 text-white"
                  : "bg-white/15 text-purple-400",
              )}
            >
              {p.display_name[0].toUpperCase()}
            </motion.div>
          ))}
          <span className="ml-1 text-xs text-purple-400">
            {answers.length}/{players.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm">
        <p className="text-lg font-semibold text-white sm:text-xl leading-relaxed">
          {question.question_text}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {question.options.map((opt, idx) => {
          const state = getOptionState(opt.id);
          const isDisabled = !!(displaySelected) || phase !== "answering" || submitting;
          return (
            <motion.button
              key={opt.id}
              whileTap={!isDisabled ? { scale: 0.94 } : {}}
              onClick={() => handleAnswer(opt.id)}
              disabled={isDisabled}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center font-semibold text-white transition-all duration-150",
                state === "idle" &&
                  cn("bg-gradient-to-br border cursor-pointer active:brightness-90", OPTION_COLORS[idx % 4]),
                state === "selected" &&
                  cn("bg-gradient-to-br border ring-4 ring-white/50 scale-[1.03] brightness-110", OPTION_COLORS[idx % 4]),
                state === "correct" &&
                  "bg-emerald-500 border-emerald-300 ring-4 ring-emerald-300/60 scale-[1.03]",
                state === "wrong" &&
                  "bg-rose-800 border-rose-600 opacity-90",
                state === "dimmed" &&
                  "bg-white/5 border-white/10 opacity-35",
                isDisabled && state === "idle" && "cursor-default",
              )}
            >
              <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-xs font-bold">
                {OPTION_LABELS[idx]}
              </span>
              <span className="text-sm leading-snug">{opt.text}</span>

              {phase === "revealing" && state === "correct" && (
                <Check className="absolute right-3 top-3 h-5 w-5 text-white drop-shadow" />
              )}
              {phase === "revealing" && state === "wrong" && (
                <X className="absolute right-3 top-3 h-5 w-5 text-white" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Result overlay after reveal */}
      <AnimatePresence>
        {phase === "revealing" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
          >
            {myAnswer ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {myAnswer.is_correct ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <X className="h-5 w-5 text-rose-400" />
                  )}
                  <span className="font-semibold text-white">
                    {myAnswer.is_correct ? "Benar!" : "Salah"}
                  </span>
                </div>
                {myPoints > 0 && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Zap className="h-4 w-4" />
                    +{myPoints} poin
                  </span>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-purple-300">Waktu habis! Tidak ada jawaban.</p>
            )}

            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="mb-2 text-xs font-medium text-purple-300 uppercase tracking-wider">Papan Skor</p>
              <div className="space-y-1">
                {players.slice(0, 5).map((p, i) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center justify-between text-sm",
                      p.id === currentPlayer.id && "text-amber-300 font-semibold",
                    )}
                  >
                    <span>{i + 1}. {p.display_name}{p.id === currentPlayer.id ? " (kamu)" : ""}</span>
                    <span>{p.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {isHost && (
              <p className="mt-2 text-center text-xs text-purple-400">
                Soal berikutnya dalam {nextCountdown} dtk...
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
