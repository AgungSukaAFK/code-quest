import { create } from "zustand";
import { sounds } from "@/lib/sounds";

function initialMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cq_sound_muted") === "1";
}

interface AudioState {
  /** Mute global (musik + SFX). Tersimpan di localStorage `cq_sound_muted`. */
  muted: boolean;
  /** Jumlah cutscene aktif; >0 berarti musik di-duck (dipelankan). */
  duckCount: number;
  /** URL stinger one-shot yang minta diputar (mis. kemenangan). */
  stinger: string | null;
  setMuted: (m: boolean) => void;
  toggleMuted: () => void;
  pushDuck: () => void;
  popDuck: () => void;
  playStinger: (src: string) => void;
  clearStinger: () => void;
}

function persistMuted(m: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem("cq_sound_muted", m ? "1" : "0");
  }
  sounds.muted = m;
}

export const useAudioStore = create<AudioState>((set) => ({
  muted: initialMuted(),
  duckCount: 0,
  stinger: null,
  setMuted: (m) => {
    persistMuted(m);
    set({ muted: m });
  },
  toggleMuted: () =>
    set((s) => {
      const m = !s.muted;
      persistMuted(m);
      return { muted: m };
    }),
  pushDuck: () => set((s) => ({ duckCount: s.duckCount + 1 })),
  popDuck: () => set((s) => ({ duckCount: Math.max(0, s.duckCount - 1) })),
  playStinger: (src) => set({ stinger: src }),
  clearStinger: () => set({ stinger: null }),
}));
