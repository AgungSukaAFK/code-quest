"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, X, XCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

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
}

export function PuzzleResultModal({
  open,
  result,
  onContinue,
  onRetry,
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

  if (!result) return null;

  const solved = result.solved;
  const Icon = solved ? CheckCircle2 : XCircle;
  const isPartial = !solved && result.partial_score >= 0.5;

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <div className="py-4 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              solved
                ? "bg-green-500/20 text-green-500"
                : isPartial
                  ? "bg-amber-500/20 text-amber-500"
                  : "bg-red-500/20 text-red-500"
            }`}
          >
            <Icon className="h-12 w-12" />
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
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">+50 XP</span>
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
