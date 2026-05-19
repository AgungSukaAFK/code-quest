"use client";

import { motion } from "framer-motion";
import { Binary, Lock, Network, Swords, type LucideIcon } from "lucide-react";
import type { MapNode as MapNodeType } from "@/lib/game/world-map-config";
import { cn } from "@/lib/utils";

const iconMap: Record<MapNodeType["iconName"], LucideIcon> = {
  Network,
  Binary,
  Swords,
  Lock,
};

interface MapNodeProps {
  node: MapNodeType;
  isSelected: boolean;
  isCurrent?: boolean;
  onClick: () => void;
}

export function MapNode({
  node,
  isSelected,
  isCurrent,
  onClick,
}: MapNodeProps) {
  const Icon = iconMap[node.iconName];
  const isLocked = node.type === "locked";

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2",
        "group flex flex-col items-center gap-2 transition-all duration-200",
        isLocked && "cursor-not-allowed opacity-60",
      )}
      style={{
        left: `${node.position.x}%`,
        top: `${node.position.y}%`,
        zIndex: 10,
      }}
    >
      {(isSelected || isCurrent) && (
        <motion.div
          className="absolute -inset-3 rounded-full bg-primary/30"
          animate={{ scale: [1, 1.28, 1], opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div
        className={cn(
          "relative h-16 w-16 rounded-full border-4 sm:h-20 sm:w-20",
          "flex items-center justify-center transition-all duration-200 group-hover:scale-110",
          isLocked
            ? "bg-muted border-border"
            : node.type === "computational_thinking"
              ? "bg-linear-to-br from-indigo-500 to-purple-600 border-indigo-300 shadow-lg shadow-indigo-500/40"
              : node.type === "multiplayer"
                ? "bg-linear-to-br from-rose-500 to-pink-600 border-rose-300 shadow-lg shadow-rose-500/40"
                : "bg-linear-to-br from-amber-500 to-orange-600 border-amber-300 shadow-lg shadow-amber-500/40",
          isSelected && "scale-110 ring-4 ring-white/40",
        )}
      >
        <Icon
          className={cn(
            "h-7 w-7 sm:h-9 sm:w-9",
            isLocked ? "text-muted-foreground" : "text-white",
          )}
        />
      </div>

      <div
        className={cn(
          "rounded-full border bg-background/90 px-3 py-1 text-xs font-medium shadow-md backdrop-blur-sm sm:text-sm",
          "whitespace-nowrap group-hover:bg-background",
        )}
      >
        {isLocked ? "???" : node.name}
      </div>
    </motion.button>
  );
}
