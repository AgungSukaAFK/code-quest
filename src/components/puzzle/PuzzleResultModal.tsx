"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, X, XCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

const HYPE_MESSAGES = [
  "Gasss, lanjut terus! 🔥",
  "Nah ini dia! Mantap jiwa!",
  "GG! Otak lo lagi panas nih!",
  "Yakin deh, lo bakal jago banget!",
  "Ayo gas! Masih banyak level!",
  "Killing it! Jangan berhenti!",
  "Lo tuh serius pinter banget sih!",
  "Wkwk betul semua, respek!",
  "Streak dimulai dari sini! 💪",
  "Clean! Ngga ada yang kelewat!",
  "Pro alert! 🚨",
  "Keren parah, terusin ya!",
  "Lo lagi on fire bestie! 🔥",
  "Gampang banget toh buat lo!",
  "Ngerasa IQ naik ga? Kayaknya naik deh.",
  "Jago! Ini mah udah level dewa!",
  "Flawless! Kayak udah hapal!",
  "Ngga nyangka bisa secepet ini!",
  "Top tier! Lanjut ke berikutnya!",
  "Wah wah wah, siapa nih? 😎",
  "Beneran deh, lo bisa banget!",
  "Bisa terus, jangan nunda!",
  "Smooth! Kayak udah automatic!",
  "Mantul! Mantap betul!",
  "100% bro, clean habis!",
  "Gilak bisa semua! Lo serius?!",
  "Next puzzle nunggu, gas!",
  "Dikira susah, ternyata bisa! 💥",
  "Nggak ada yang bisa ngalahin lo hari ini!",
  "Pikiran lo tajam banget sekarang!",
  "Bisa jadi tutor nih! 😄",
  "Terus gini, jangan males!",
  "Eh btw lo emang pinter kan?",
  "Salah satu yang terbaik nih!",
  "GWS buat yang nggak bisa, lo bisa! 🫡",
  "Ngerjainnya santai tapi bener semua!",
  "Otak lo udah warm up nih!",
  "Makin ke sini makin gila skillnya!",
  "Ini mah bukan keberuntungan, ini skill!",
  "Perfect! Lo udah di jalur yang bener!",
  "Nah gitu dong, jangan tanggung!",
  "Serius deh, lo improve banget!",
  "Jawaban lo: 💯",
  "Udah kayak mesin jawab soal!",
  "Langsung ngerti, langsung bener!",
  "Ini level lo udah naik, trust!",
  "Nggak perlu hint pun bisa!",
  "Ayo ayo ayo, momentum nih!",
  "Lo ngerjain ini sambil santai ga? Keren!",
  "Next one! Jangan kasih kendor! 🚀",
];

interface PuzzleResultModalProps {
  open: boolean;
  result: {
    solved: boolean;
    correct_count: number;
    total_count: number;
    partial_score: number;
    feedback: string;
  } | null;
  onContinue: () => void;
  onRetry: () => void;
  avatarSeed?: string | null;
  username?: string | null;
}

export function PuzzleResultModal({
  open,
  result,
  onContinue,
  onRetry,
  avatarSeed,
  username,
}: PuzzleResultModalProps) {
  useEffect(() => {
    if (open && result?.solved) {
      confetti({
        particleCount: 90,
        spread: 70,
        startVelocity: 32,
        origin: { y: 0.62 },
      });
    }
  }, [open, result?.solved]);

  const hypeMessage = useMemo(
    () => HYPE_MESSAGES[Math.floor(Math.random() * HYPE_MESSAGES.length)],
    // re-roll every time the modal opens (open flips true→false→true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  if (!result) return null;

  const solved = result.solved;
  const Icon = solved ? CheckCircle2 : XCircle;
  const isPartial = !solved && result.partial_score >= 0.5;

  const ringColor = solved
    ? "ring-green-500/60"
    : isPartial
      ? "ring-amber-500/60"
      : "ring-red-500/60";

  const badgeColor = solved
    ? "bg-green-500"
    : isPartial
      ? "bg-amber-500"
      : "bg-red-500";

  const avatarUrl = avatarSeed
    ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`
    : null;

  const avatarAnimation = solved
    ? { scale: [1, 1.25, 0.92, 1.08, 1], transition: { duration: 0.6, times: [0, 0.25, 0.5, 0.75, 1] } }
    : isPartial
      ? { rotate: [-6, 6, -6, 6, 0], transition: { duration: 0.5 } }
      : { x: [-10, 10, -8, 8, -5, 5, 0], transition: { duration: 0.5 } };

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <div className="py-4 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative mx-auto mb-4 w-fit"
          >
            {avatarUrl ? (
              <>
                <motion.div
                  animate={avatarAnimation}
                  className={`h-24 w-24 overflow-hidden rounded-full ring-4 ${ringColor} bg-muted`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt={username ?? "Avatar"}
                    className="h-full w-full"
                  />
                </motion.div>
                <div
                  className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full ${badgeColor}`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </>
            ) : (
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ${
                  solved
                    ? "bg-green-500/20 text-green-500"
                    : isPartial
                      ? "bg-amber-500/20 text-amber-500"
                      : "bg-red-500/20 text-red-500"
                }`}
              >
                <Icon className="h-12 w-12" />
              </div>
            )}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-2 text-2xl font-bold"
          >
            {solved ? "Sempurna!" : isPartial ? "Hampir!" : "Coba Lagi!"}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <div className="font-mono text-3xl font-bold text-primary">
              {result.correct_count} / {result.total_count}
            </div>
            <p className="text-sm text-muted-foreground">{result.feedback}</p>
            {solved && (
              <div className="flex items-center justify-center gap-2 text-sm text-amber-500">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="font-medium">{hypeMessage}</span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex gap-2"
          >
            {!solved && (
              <Button variant="outline" onClick={onRetry} className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Coba Lagi
              </Button>
            )}
            <Button onClick={onContinue} className="flex-1">
              {solved ? "Lanjut" : "Skip"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
