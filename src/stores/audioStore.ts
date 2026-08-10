import { create } from "zustand";
import { sounds } from "@/lib/sounds";

function initialMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cq_sound_muted") === "1";
}

interface AudioState {
  /** Mute global untuk suara efek (SFX). Tersimpan di localStorage `cq_sound_muted`. */
  muted: boolean;
  setMuted: (m: boolean) => void;
  toggleMuted: () => void;
}

function persistMuted(m: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem("cq_sound_muted", m ? "1" : "0");
  }
  sounds.muted = m;
}

export const useAudioStore = create<AudioState>((set) => ({
  muted: initialMuted(),
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
}));
