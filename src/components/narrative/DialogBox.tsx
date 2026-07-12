"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sounds } from "@/lib/sounds";
import { useAudioStore } from "@/stores/audioStore";
import { CHAR } from "@/lib/assets";
import { THE_GLITCH, type DialogScene } from "@/lib/narrative/script";

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
  const isGlitchSpeaking = line?.speaker === THE_GLITCH;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pushDuck = useAudioStore((s) => s.pushDuck);
  const popDuck = useAudioStore((s) => s.popDuck);

  // Pelankan musik selama cutscene tampil.
  useEffect(() => {
    pushDuck();
    return () => popDuck();
  }, [pushDuck, popDuck]);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      onClick={handleAdvance}
    >
      {/* Backdrop: background cutscene bila ada, atau gelap polos */}
      {scene.background ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${scene.background}')` }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/55 to-black/35" />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      )}

      {/* Sang Kompil di kiri bawah — di-mirror (scaleX negatif) supaya menghadap
          kanan; membesar sedikit saat dia bicara, meredup saat diam. */}
      <motion.img
        src={CHAR.kompil}
        alt="Sang Kompil"
        initial={{ opacity: 0, x: -40, scaleX: -1, scaleY: 1 }}
        animate={{
          opacity: isGlitchSpeaking ? 0.5 : 1,
          x: 0,
          scaleX: isGlitchSpeaking ? -0.92 : -1.08,
          scaleY: isGlitchSpeaking ? 0.92 : 1.08,
        }}
        transition={{ duration: 0.35 }}
        style={{ transformOrigin: "bottom center" }}
        className={cn(
          "pointer-events-none absolute bottom-24 left-0 h-[42vh] object-contain object-bottom drop-shadow-2xl transition-[filter] duration-300 sm:bottom-28 sm:left-6 sm:h-128",
          isGlitchSpeaking && "grayscale",
        )}
      />

      {/* The Glitch di kanan bawah (menghadap kiri) — menyala & membesar saat bicara */}
      {scene.figure && (
        <motion.img
          src={scene.figure}
          alt="The Glitch"
          initial={{ opacity: 0, x: 40 }}
          animate={{
            opacity: isGlitchSpeaking ? 0.98 : 0.45,
            x: 0,
            scale: isGlitchSpeaking ? 1.08 : 0.92,
          }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={{ transformOrigin: "bottom center" }}
          className={cn(
            "pointer-events-none absolute bottom-24 right-0 h-[36vh] object-contain object-bottom drop-shadow-2xl transition-[filter] duration-300 sm:bottom-28 sm:right-6 sm:h-112",
            !isGlitchSpeaking && "grayscale",
          )}
        />
      )}

      {/* Kartu dialog di bawah */}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        {line.stage && (
          <p className="mx-auto mb-2 max-w-2xl text-center text-xs italic text-white/70 sm:text-sm">
            {line.stage}
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "mx-auto w-full max-w-2xl rounded-2xl border-2 bg-card/95 p-4 shadow-2xl sm:p-5",
            isGlitchSpeaking ? "border-rose-500/50" : "border-primary/40",
          )}
        >
          <p
            className={cn(
              "mb-1 text-sm font-bold sm:text-base",
              isGlitchSpeaking ? "text-rose-400" : "text-primary",
            )}
          >
            {line.speaker}
          </p>
          <p className="min-h-14 text-sm leading-relaxed sm:text-base">
            {typed}
            {isTyping && (
              <span className="ml-0.5 inline-block animate-pulse">▍</span>
            )}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
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

            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
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
        </motion.div>
      </div>
    </motion.div>
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
