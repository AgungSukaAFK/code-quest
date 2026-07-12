"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAudioStore } from "@/stores/audioStore";
import { sounds } from "@/lib/sounds";
import { BGM } from "@/lib/assets";

const BASE_VOLUME = 0.7;
const DUCK_VOLUME = 0.6;

function trackForPath(path: string): string | null {
  if (path.startsWith("/world-map")) return BGM.worldmap;
  if (path.startsWith("/play/L1")) return BGM.menara;
  if (path.startsWith("/play/M2")) return BGM.lembah;
  if (path.startsWith("/play/")) return BGM.lembah;
  if (path.startsWith("/multiplayer")) return BGM.arena;
  return null;
}

/**
 * Mesin musik latar tunggal. Dipasang sekali di layout game (di luar area yang
 * di-remount per navigasi) supaya musik menyambung antar-halaman.
 *
 * Pola tahan-banting:
 * - `applyPlayback()` = satu sumber kebenaran: selalu menyamakan pemutaran dgn
 *   state terkini (track sesuai route, mute, duck). Bisa dipanggil kapan saja.
 * - Autoplay policy: browser memblokir play() sebelum ada interaksi user. Kita
 *   pasang listener gesture (pointerdown/keydown/touchstart) yang tetap aktif,
 *   sehingga interaksi apa pun akan me-retry → musik langsung jalan begitu boleh.
 * - Ref menyimpan state terbaru agar listener & retry selalu memutar track yang
 *   benar (bukan yang basi).
 */
export function AudioManager() {
  const pathname = usePathname();
  const muted = useAudioStore((s) => s.muted);
  const ducked = useAudioStore((s) => s.duckCount > 0);
  const stinger = useAudioStore((s) => s.stinger);
  const clearStinger = useAudioStore((s) => s.clearStinger);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const stingerRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef({ track: null as string | null, muted, ducked });

  const stopStinger = useCallback(() => {
    const st = stingerRef.current;
    if (st) {
      st.pause();
      st.currentTime = 0;
      st.src = "";
    }
  }, []);

  const fadeTo = useCallback((target: number, onDone?: () => void) => {
    const bgm = bgmRef.current;
    if (!bgm) return;
    if (fadeRef.current) clearInterval(fadeRef.current);
    const start = bgm.volume;
    const steps = 12;
    let i = 0;
    fadeRef.current = setInterval(() => {
      i += 1;
      bgm.volume = Math.max(
        0,
        Math.min(1, start + (target - start) * (i / steps)),
      );
      if (i >= steps) {
        if (fadeRef.current) clearInterval(fadeRef.current);
        fadeRef.current = null;
        onDone?.();
      }
    }, 25);
  }, []);

  const applyPlayback = useCallback(() => {
    const bgm = bgmRef.current;
    if (!bgm || typeof window === "undefined") return;

    const { track, muted, ducked } = stateRef.current;

    // Tidak ada track untuk halaman ini, atau di-mute → hentikan.
    if (!track || muted) {
      if (!bgm.paused) fadeTo(0, () => bgm.pause());
      else {
        bgm.volume = 0;
        bgm.pause();
      }
      stopStinger();
      return;
    }

    const wanted = new URL(track, window.location.origin).href;
    const srcChanged = bgm.src !== wanted;
    if (srcChanged) bgm.src = track;

    const target = ducked ? DUCK_VOLUME : BASE_VOLUME;

    if (srcChanged || bgm.paused) {
      const p = bgm.play();
      if (p !== undefined) {
        p.then(() => fadeTo(target)).catch(() => {
          // Diblokir autoplay → akan di-retry saat user berinteraksi.
        });
      } else {
        fadeTo(target);
      }
    } else if (Math.abs(bgm.volume - target) > 0.01) {
      fadeTo(target);
    }

    stopStinger();
  }, [fadeTo, stopStinger]);

  // Inisialisasi elemen audio + unlock autoplay pada interaksi pertama (persisten).
  useEffect(() => {
    const bgm = new Audio();
    bgm.loop = true;
    bgm.preload = "auto";
    bgm.volume = 0;
    bgmRef.current = bgm;

    const st = new Audio();
    st.preload = "auto";
    stingerRef.current = st;

    const retry = () => applyPlayback();
    window.addEventListener("pointerdown", retry);
    window.addEventListener("keydown", retry);
    window.addEventListener("touchstart", retry);

    return () => {
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
      window.removeEventListener("touchstart", retry);
      bgm.pause();
      st.pause();
      if (fadeRef.current) clearInterval(fadeRef.current);
    };
  }, [applyPlayback]);

  // Jaga agar mute SFX (Web Audio) ikut sinkron.
  useEffect(() => {
    sounds.muted = muted;
  }, [muted]);

  // Sinkronkan pemutaran tiap kali route / mute / duck berubah.
  useEffect(() => {
    stateRef.current = { track: trackForPath(pathname), muted, ducked };
    stopStinger();
    applyPlayback();
  }, [pathname, muted, ducked, applyPlayback, stopStinger]);

  // Stinger one-shot (kemenangan dll).
  useEffect(() => {
    if (!stinger) {
      stopStinger();
      applyPlayback();
      return;
    }

    const bgm = bgmRef.current;
    if (bgm && !bgm.paused) {
      fadeTo(0, () => {
        bgm.pause();
        bgm.currentTime = 0;
      });
    } else if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
      bgm.volume = 0;
    }

    const st = stingerRef.current;
    if (st && !muted) {
      st.src = stinger;
      st.volume = Math.min(1, BASE_VOLUME + 0.2);
      st.currentTime = 0;
      st.play().catch(() => {});
    }
    clearStinger();
  }, [stinger, muted, clearStinger, fadeTo, stopStinger, applyPlayback]);

  return null;
}
