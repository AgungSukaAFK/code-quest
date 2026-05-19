"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Play, Swords, X } from "lucide-react";
import type { MapNode } from "@/lib/game/world-map-config";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModuleDetailPanelProps {
  node: MapNode | null;
  onClose: () => void;
}

const BADGE_LABEL: Record<string, string> = {
  computational_thinking: "Berpikir Komputasional",
  logic_math: "Logika Matematika",
  multiplayer: "Mode Multiplayer",
};

export function ModuleDetailPanel({ node, onClose }: ModuleDetailPanelProps) {
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

            {node.type === "multiplayer" ? (
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
