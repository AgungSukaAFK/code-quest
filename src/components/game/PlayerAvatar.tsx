'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface PlayerAvatarProps {
  position: { x: number; y: number }
  avatarSeed?: string | null
  username?: string | null
}

export function PlayerAvatar({ position, avatarSeed, username }: PlayerAvatarProps) {
  const avatarUrl = avatarSeed
    ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`
    : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute -translate-x-1/2 pointer-events-none"
      style={{ left: `${position.x}%`, top: `${position.y + 8}%`, zIndex: 20 }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-1"
      >
        <Avatar className="h-10 w-10 border-4 border-white shadow-xl sm:h-12 sm:w-12">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{username?.[0]?.toUpperCase() || 'P'}</AvatarFallback>
        </Avatar>
        <div className="whitespace-nowrap text-xs font-bold text-white drop-shadow-lg">
          {username || 'Petualang'}
        </div>
      </motion.div>
    </motion.div>
  )
}
