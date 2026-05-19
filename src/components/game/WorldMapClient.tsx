"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { MapNode as MapNodeType } from "@/lib/game/world-map-config";
import { MAP_NODES } from "@/lib/game/world-map-config";
import { MapNode } from "@/components/game/MapNode";
import { MapPaths } from "@/components/game/MapPaths";
import { ModuleDetailPanel } from "@/components/game/ModuleDetailPanel";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";

const ARENA_REQUIRED = 10;

interface WorldMapClientProps {
  username?: string | null;
  avatarSeed?: string | null;
  m2Progress?: number;
  l1Progress?: number;
}

export function WorldMapClient({ username, avatarSeed, m2Progress = 0, l1Progress = 0 }: WorldMapClientProps) {
  const [selectedNode, setSelectedNode] = useState<MapNodeType | null>(null);
  const playerPosition = MAP_NODES.find((node) => node.id === "M2")
    ?.position || { x: 25, y: 70 };

  const arenaLocked = m2Progress < ARENA_REQUIRED || l1Progress < ARENA_REQUIRED;

  const stars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 2,
      })),
    [],
  );

  return (
    <main className="relative flex-1 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pointer-events-none absolute left-1/2 top-5 z-30 -translate-x-1/2 text-center sm:top-6"
      >
        <h1 className="text-2xl font-bold text-white drop-shadow-lg sm:text-4xl">
          World of Logikalia
        </h1>
        <p className="text-sm text-white/80 drop-shadow sm:text-base">
          Pilih region untuk memulai petualangan
        </p>
      </motion.div>

      <div className="absolute inset-0 bg-linear-to-br from-indigo-950 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-30">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute h-1 w-1 rounded-full bg-white"
              style={{ left: `${star.left}%`, top: `${star.top}%` }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
              }}
            />
          ))}
        </div>

        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative h-full min-h-150 w-full">
        <MapPaths />

        {MAP_NODES.map((node) => (
          <MapNode
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            isCurrent={node.id === "M2"}
            isLocked={node.id === "ARENA" && arenaLocked}
            onClick={() => setSelectedNode(node)}
          />
        ))}

        <PlayerAvatar
          position={playerPosition}
          avatarSeed={avatarSeed}
          username={username}
        />
      </div>

      <ModuleDetailPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        isLocked={selectedNode?.id === "ARENA" && arenaLocked}
        m2Progress={m2Progress}
        l1Progress={l1Progress}
      />
    </main>
  );
}
