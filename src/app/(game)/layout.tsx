"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { AudioManager } from "@/components/audio/AudioManager";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <AudioManager />
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex min-h-screen flex-col"
      >
        {children}
      </motion.div>
    </div>
  );
}
