"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, X, XCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/sounds";

const MESSAGES = {
  // partial_score === 1 / solved
  perfect: [
    "Gasss, lanjut terus! 🔥",
    "Nah ini dia! Mantap jiwa!",
    "GG! Otak lo lagi panas nih!",
    "Yakin deh, lo bakal jago banget!",
    "Ayo gas! Masih banyak level!",
    "Lo tuh serius pinter banget sih!",
    "Wkwk betul semua, respek!",
    "Streak dimulai dari sini! 💪",
    "Clean! Ngga ada yang kelewat!",
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
    "Smooth! Kayak udah automatic!",
    "Mantul! Mantap betul!",
    "100% bro, clean habis!",
    "Gilak bisa semua! Lo serius?!",
    "Dikira susah, ternyata bisa! 💥",
    "Nggak ada yang bisa ngalahin lo hari ini!",
    "Pikiran lo tajam banget sekarang!",
    "Bisa jadi tutor nih! 😄",
    "Eh btw lo emang pinter kan?",
    "GWS buat yang nggak bisa, lo bisa! 🫡",
    "Ngerjainnya santai tapi bener semua!",
    "Otak lo udah warm up nih!",
    "Makin ke sini makin gila skillnya!",
    "Ini mah bukan keberuntungan, ini skill!",
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
    "Bisa jadi tutor nih!",
    "Terus gini, jangan males!",
    "Next puzzle nunggu, gas!",
    "Perfect! Lo udah di jalur yang bener!",
    "Salah satu yang terbaik nih!",
    "Bisa terus, jangan nunda!",
    "Semuanya bener? Semuanya bener.",
  ],

  // partial_score >= 0.75
  close: [
    "Nyaris sempurna! Satu langkah lagi nih.",
    "Wah hampir! Fokus dikit lagi pasti bisa full.",
    "Close banget! Coba sekali lagi, pasti tembus.",
    "Dikit banget kurangnya, sayang banget tuh.",
    "Hampir! Jangan nyerah, coba lagi.",
    "Sebenernya udah ngerti, tinggal lebih teliti.",
    "Tinggal sedikit lagi buat sempurna!",
    "Ngga jauh! Review jawaban lo dikit lagi.",
    "Udah bagus banget, tinggal poles terakhirnya.",
    "Hampir sempurna — lo udah di level atas!",
    "Kurang tipis banget, coba lagi pasti full!",
    "Ini mah tinggal satu salah doang, gas lagi!",
  ],

  // partial_score >= 0.5
  average: [
    "Lumayan! Tapi lo pasti bisa lebih dari ini.",
    "Setengah jalan! Terus semangat ya.",
    "Cukup baik, masih ada ruang buat improve.",
    "Udah paham sebagian, gas terus!",
    "Ini permulaan yang oke, lanjutin!",
    "Setengah bener — yuk cari yang masih salah.",
    "Bagus! Tinggal perkuat pemahamannya.",
    "Terusin ya, lo udah di jalur yang bener.",
    "Progres bagus! Coba sekali lagi.",
    "Boleh dibilang lumayan — tapi bisa lebih!",
    "Separuh udah oke, separuhnya lagi yuk dipelajari.",
  ],

  // partial_score > 0
  low: [
    "Baru sedikit yang bener, tapi udah mulai!",
    "Tenang, semua orang mulai dari bawah.",
    "Masih bingung? Coba pakai petunjuk dulu!",
    "Nggak apa-apa, yang penting mau coba lagi!",
    "Langkah awal memang susah, keep going!",
    "Yuk pelan-pelan, pelajari lagi materinya.",
    "Belajar itu proses! Coba lagi ya.",
    "Jangan nyerah! Baca soalnya pelan-pelan.",
    "Ada yang masih bingung? Coba hint dulu.",
    "Dikit-dikit lama-lama ngerti. Coba lagi!",
    "Ini baru awal, masih banyak kesempatan!",
  ],

  // partial_score === 0
  zero: [
    "Aduh, belum ada yang bener nih. Coba lagi!",
    "Yuk, baca petunjuknya dulu biar ada gambaran.",
    "Nol bukan akhir — itu tanda mau belajar!",
    "Tenang! Coba lagi dari awal, pasti ada yang bener.",
    "Hmm, coba baca soalnya sekali lagi pelan-pelan.",
    "Reset, tarik napas, coba lagi. Pasti bisa!",
    "Belum ada yang tepat, tapi lo masih di sini — itu yang penting.",
    "Boleh coba petunjuknya dulu biar ada clue!",
    "Nol hari ini, bisa banyak besok. Semangat!",
    "Semua yang jago pernah salah. Coba lagi!",
    "Belum kena satupun? Berarti ada yang perlu dipelajari dulu.",
  ],
};

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
    if (!open || !result) return;
    if (result.solved) {
      sounds.success();
      confetti({
        particleCount: 90,
        spread: 70,
        startVelocity: 32,
        origin: { y: 0.62 },
      });
    } else if (result.partial_score >= 0.5) {
      sounds.partial();
    } else {
      sounds.fail();
    }
  }, [open, result?.solved]);

  const tier = useMemo(() => {
    if (!result) return "zero" as const;
    if (result.solved) return "perfect" as const;
    if (result.partial_score >= 0.75) return "close" as const;
    if (result.partial_score >= 0.5) return "average" as const;
    if (result.partial_score > 0) return "low" as const;
    return "zero" as const;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const message = useMemo(() => {
    const pool = MESSAGES[tier];
    return pool[Math.floor(Math.random() * pool.length)];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!result) return null;

  const solved = result.solved;
  const Icon = solved ? CheckCircle2 : XCircle;

  const TIER_META = {
    perfect: {
      heading: "Sempurna!",
      ring: "ring-amber-400/80",
      badge: "bg-amber-400",
      headingClass: "bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent",
    },
    close: {
      heading: "Hampir!",
      ring: "ring-green-500/60",
      badge: "bg-green-500",
      headingClass: "",
    },
    average: {
      heading: "Lumayan!",
      ring: "ring-amber-500/60",
      badge: "bg-amber-500",
      headingClass: "",
    },
    low: {
      heading: "Terus Semangat!",
      ring: "ring-orange-500/60",
      badge: "bg-orange-500",
      headingClass: "",
    },
    zero: {
      heading: "Yuk Coba Lagi!",
      ring: "ring-red-500/60",
      badge: "bg-red-500",
      headingClass: "",
    },
  };

  const meta = TIER_META[tier];
  const ringColor = meta.ring;
  const badgeColor = meta.badge;

  const avatarUrl = avatarSeed
    ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`
    : null;

  const avatarAnimation =
    tier === "perfect"
      ? { scale: [1, 1.25, 0.92, 1.08, 1], transition: { duration: 0.6, times: [0, 0.25, 0.5, 0.75, 1] } }
      : tier === "close" || tier === "average"
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
                  tier === "perfect"
                    ? "bg-amber-400/20 text-amber-400"
                    : tier === "close" || tier === "average"
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
            className={`mb-2 text-2xl font-bold ${meta.headingClass}`}
          >
            {meta.heading}
          </motion.h2>

          {solved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-3 flex justify-center gap-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 300 }}
                  className="text-2xl"
                >
                  ⭐
                </motion.span>
              ))}
            </motion.div>
          )}

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
            <div className="flex items-center justify-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="font-medium">{message}</span>
            </div>
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
