"use client";

import { MAP_NODES, MAP_PATHS } from "@/lib/game/world-map-config";

export function MapPaths() {
  const getPosition = (id: string) =>
    MAP_NODES.find((node) => node.id === id)?.position;

  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ zIndex: 1 }}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {MAP_PATHS.map((path) => {
        const from = getPosition(path.from);
        const to = getPosition(path.to);

        if (!from || !to) return null;

        return (
          <line
            key={`${path.from}-${path.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="currentColor"
            strokeWidth="0.3"
            strokeDasharray="1 1"
            className="text-primary/40"
          />
        );
      })}
    </svg>
  );
}
