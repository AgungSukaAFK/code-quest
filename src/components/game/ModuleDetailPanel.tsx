"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Lock, Play, Swords, X } from "lucide-react";
import type { MapNode } from "@/lib/game/world-map-config";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModuleDetailPanelProps {
  node: MapNode | null;
  onClose: () => void;
  isLocked?: boolean;
  m2Done?: boolean;
  l1Done?: boolean;
}

const BADGE_LABEL: Record<string, string> = {
  computational_thinking: "Berpikir Komputasional",
  logic_math: "Logika Matematika",
  multiplayer: "Mode Multiplayer",
};

export function ModuleDetailPanel({ node, onClose, isLocked = false, m2Done = false, l1Done = false }: ModuleDetailPanelProps) {
  return (
    <AnimatePresence>
      {node && node.type !== "locked" && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 z-30 sm:left-1/2 sm:max-w-md sm:-translate-x-1/2"
        >
          <Card className="border-2 p-4 shadow-2xl sm:p-6">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge
                  variant="secondary"
                  className={cn(
                    "mb-2 text-xs",
                    node.type === "multiplayer" && "bg-rose-100 text-rose-700",
                  )}
                >
                  {BADGE_LABEL[node.type] ?? node.type}
                </Badge>
                <h3 className="text-lg font-bold sm:text-xl">{node.name}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">{node.description}</p>

            {node.type === "multiplayer" && isLocked ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>Tuntaskan kedua babak untuk membuka Arena</span>
                </div>
                {[
                  { label: "Lembah Dekomposisi", done: m2Done, href: "/play/M2" },
                  { label: "Menara Logika Boolean", done: l1Done, href: "/play/L1" },
                ].map(({ label, done, href }) => (
                  <div key={label} className="rounded-xl border px-3 py-2">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium">{label}</span>
                      {done ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          Selesai
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Belum selesai</span>
                      )}
                    </div>
                    {!done && (
                      <Link
                        href={href}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2 w-full justify-center")}
                      >
                        <Play className="mr-1.5 h-3 w-3" />
                        Mainkan sekarang
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : node.type === "multiplayer" ? (
              <Link
                href="/multiplayer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full justify-center bg-rose-600 hover:bg-rose-700",
                )}
              >
                <Swords className="mr-2 h-4 w-4" />
                Masuk Arena
              </Link>
            ) : isLocked ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>Selesaikan Lembah Dekomposisi (3 soal) dulu untuk membuka babak ini.</span>
                </div>
                <Link
                  href="/play/M2"
                  className={cn(buttonVariants({ size: "lg" }), "w-full justify-center")}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Ke Lembah Dekomposisi
                </Link>
              </div>
            ) : (
              <Link
                href={`/play/${node.id}`}
                className={cn(buttonVariants({ size: "lg" }), "w-full justify-center")}
              >
                <Play className="mr-2 h-4 w-4" />
                Mulai Petualangan
              </Link>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
