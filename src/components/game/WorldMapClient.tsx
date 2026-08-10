"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { MapNode as MapNodeType } from "@/lib/game/world-map-config";
import { MAP_NODES } from "@/lib/game/world-map-config";
import { MapNode } from "@/components/game/MapNode";
import { MapPaths } from "@/components/game/MapPaths";
import { ModuleDetailPanel } from "@/components/game/ModuleDetailPanel";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import { sounds } from "@/lib/sounds";

interface WorldMapClientProps {
  username?: string | null;
  avatarSeed?: string | null;
  l1Done?: boolean;
}

export function WorldMapClient({
  username,
  avatarSeed,
  l1Done = false,
}: WorldMapClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedNode, setSelectedNode] = useState<MapNodeType | null>(null);

  // L1 selalu terbuka; Arena terbuka setelah L1 selesai.
  const arenaLocked = !l1Done;

  function isNodeLocked(id: string) {
    if (id === "ARENA") return arenaLocked;
    return false;
  }
  function isNodeDone(id: string) {
    if (id === "L1") return l1Done;
    return false;
  }

  // Objektif terkini = node pertama yang belum selesai (buat "you are here").
  const currentNodeId = !l1Done ? "L1" : "ARENA";
  const playerPosition =
    MAP_NODES.find((node) => node.id === currentNodeId)?.position ?? {
      x: 58,
      y: 50,
    };

  // Baru kembali dari modul yang baru saja dituntaskan (?completed=L1) →
  // kasih tahu apa yang sudah bisa dilanjutkan.
  useEffect(() => {
    const completed = searchParams.get("completed");
    if (!completed) return;

    const doneNode = MAP_NODES.find((node) => node.id === completed);
    const nextId = completed === "L1" ? "ARENA" : null;
    const nextNode = nextId
      ? MAP_NODES.find((node) => node.id === nextId)
      : null;

    toast.success(
      nextNode
        ? `${doneNode?.name ?? "Modul"} selesai! Kamu sekarang bisa lanjut ke ${nextNode.name}. Mau latihan lagi di sini juga masih bisa kapan saja.`
        : `${doneNode?.name ?? "Modul"} selesai!`,
    );

    // Bersihkan query param supaya toast tidak muncul lagi saat refresh.
    router.replace("/world-map");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-indigo-950 to-slate-950">
        <div className="absolute inset-0 bg-slate-950/45" />
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
            isCurrent={node.id === currentNodeId}
            isLocked={isNodeLocked(node.id)}
            isCompleted={isNodeDone(node.id)}
            onClick={() => {
              sounds.click();
              setSelectedNode(node);
            }}
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
        isLocked={selectedNode ? isNodeLocked(selectedNode.id) : false}
        l1Done={l1Done}
      />
    </main>
  );
}
