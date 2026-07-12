"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, SkipForward } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { sounds } from "@/lib/sounds";
import type { DialogScene } from "@/lib/narrative/script";

const KOMPIL_AVATAR =
  "https://api.dicebear.com/7.x/bottts/svg?seed=sang-kompil";

const TYPE_SPEED_MS = 22;

interface DialogBoxProps {
  scene: DialogScene;
  onComplete: () => void;
}

export function DialogBox({ scene, onComplete }: DialogBoxProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const line = scene.lines[lineIndex];
  const isLastLine = lineIndex >= scene.lines.length - 1;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Catatan: komponen ini di-mount ulang via `key={scene.id}` (lihat DialogBoxLayer),
  // jadi lineIndex otomatis mulai dari 0 saat scene berganti — tak perlu reset manual.

  // Efek mesin ketik per baris.
  useEffect(() => {
    if (!line) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setTyped("");
    setIsTyping(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      setTyped(line.text.slice(0, i));
      if (i >= line.text.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsTyping(false);
      }
    }, TYPE_SPEED_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scene.id, lineIndex, line]);

  function handleAdvance() {
    if (isTyping) {
      // Selesaikan ketikan baris ini dulu.
      if (timerRef.current) clearInterval(timerRef.current);
      setTyped(line.text);
      setIsTyping(false);
      return;
    }
    sounds.click();
    if (isLastLine) {
      onComplete();
    } else {
      setLineIndex((i) => i + 1);
    }
  }

  function handleSkip() {
    sounds.click();
    if (timerRef.current) clearInterval(timerRef.current);
    onComplete();
  }

  if (!line) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={handleAdvance}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {line.stage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 text-center text-xs italic text-white/70 sm:text-sm"
          >
            {line.stage}
          </motion.p>
        )}

        <div className="relative rounded-2xl border-2 border-primary/40 bg-card/95 p-5 shadow-2xl sm:p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 shrink-0 border-2 border-primary/50 bg-background shadow-md sm:h-16 sm:w-16">
              <AvatarImage src={KOMPIL_AVATAR} alt={line.speaker} />
              <AvatarFallback>SK</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="mb-1 text-sm font-bold text-primary sm:text-base">
                {line.speaker}
              </p>
              <p className="min-h-[3.5rem] text-sm leading-relaxed sm:text-base">
                {typed}
                {isTyping && (
                  <span className="ml-0.5 inline-block animate-pulse">▍</span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex gap-1">
              {scene.lines.map((_, i) => (
                <span
                  key={i}
                  className={
                    "h-1.5 w-1.5 rounded-full transition-colors " +
                    (i === lineIndex ? "bg-primary" : "bg-muted-foreground/30")
                  }
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="gap-1 text-muted-foreground"
              >
                <SkipForward className="h-3.5 w-3.5" />
                Lewati
              </Button>
              <Button size="sm" onClick={handleAdvance} className="gap-1">
                {isTyping ? "..." : isLastLine ? "Mulai" : "Lanjut"}
                {!isTyping && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/** Wrapper opsional dengan AnimatePresence untuk transisi keluar/masuk scene. */
export function DialogBoxLayer({
  scene,
  onComplete,
}: {
  scene: DialogScene | null;
  onComplete: () => void;
}) {
  return (
    <AnimatePresence>
      {scene && (
        <DialogBox key={scene.id} scene={scene} onComplete={onComplete} />
      )}
    </AnimatePresence>
  );
}
