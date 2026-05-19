let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    _ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
  }
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.25,
  delay = 0,
) {
  if (sounds.muted) return;
  const c = getCtx();
  if (!c) return;

  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(c.destination);

  const t = c.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);

  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const sounds = {
  muted: false,

  /** Klik tombol biasa */
  click() {
    tone(700, 0.06, "square", 0.08);
  },

  /** Mengangkat task (drag start / tap select) */
  pick() {
    tone(440, 0.07, "sine", 0.18);
    tone(660, 0.1, "sine", 0.14, 0.05);
  },

  /** Menaruh task ke kategori */
  place() {
    tone(300, 0.08, "sine", 0.22);
    tone(220, 0.14, "sine", 0.16, 0.07);
  },

  /** Toggle B/S di tabel kebenaran */
  toggle() {
    tone(650, 0.07, "triangle", 0.14);
  },

  /** Tombol petunjuk */
  hint() {
    tone(880, 0.08, "sine", 0.16);
    tone(1100, 0.2, "sine", 0.12, 0.09);
  },

  /** Kirim / submit jawaban */
  submit() {
    tone(440, 0.08, "sine", 0.18);
    tone(660, 0.14, "sine", 0.15, 0.08);
  },

  /** Jawaban benar semua — arpeggio C5-E5-G5-C6 */
  success() {
    tone(523, 0.18, "sine", 0.3);
    tone(659, 0.18, "sine", 0.25, 0.13);
    tone(784, 0.2, "sine", 0.28, 0.26);
    tone(1047, 0.4, "sine", 0.3, 0.39);
  },

  /** Jawaban sebagian benar */
  partial() {
    tone(440, 0.15, "sine", 0.22);
    tone(370, 0.28, "sine", 0.18, 0.15);
  },

  /** Jawaban salah */
  fail() {
    tone(300, 0.18, "square", 0.18);
    tone(220, 0.3, "square", 0.14, 0.17);
  },
};
