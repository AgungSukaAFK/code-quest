// Path aset statis (public/). Dipakai untuk background level, karakter cutscene,
// dan musik latar. File di public/ diakses dari root URL (tanpa "public").

export const BG = {
  worldmap: "/images/bg/bg-worldmap.webp",
  lembah: "/images/bg/bg-m2-lembah.webp",
  menara: "/images/bg/bg-l1-menara.webp",
  arena: "/images/bg/bg-arena.webp",
  lembahGlitched: "/images/bg/bg-m2-glitched.webp",
  menaraStabil: "/images/bg/bg-l1-stabilized.webp",
  arenaVictory: "/images/bg/bg-arena-victory.webp",
  hero: "/images/bg/bg-hero.webp",
  cta: "/images/bg/bg-cta.webp",
  pattern: "/images/bg/pattern-batik.webp",
} as const;

export const CHAR = {
  kompil: "/images/char/char-sang-kompil.webp",
  glitch: "/images/char/char-the-glitch.webp",
} as const;

export const BGM = {
  worldmap: "/audio/bgm-worldmap.mp3",
  lembah: "/audio/bgm-lembah.mp3",
  menara: "/audio/bgm-menara.mp3",
  arena: "/audio/bgm-arena.mp3",
  dialog: "/audio/bgm-dialog.mp3",
  victory: "/audio/stinger-victory.mp3",
} as const;

  export const SPONSORS = [
    {
      id: 1,
      src: "/images/kemdikbud.webp",
      alt: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
      link: "https://kemdiktisaintek.go.id",
    },
    {
      id: 2,
      src: "/images/diktisaintek.webp",
      alt: "DIKTISAINTEK",
      link: "https://dikti.kemdiktisaintek.go.id/",
    },
    {
      id: 3,
      src: "/images/bima.webp",
      alt: "BIMA",
      link: "https://bima.kemdiktisaintek.go.id/",
    },
    {
      id: 4,
      src: "/images/uniba.webp",
      alt: "Universitas Bina Bangsa",
      link: "https://binabangsa.ac.id"
    },
    {
      id: 5,
      src: "/images/unbaja.webp",
      alt: "Universitas Banten Jaya",
      link: "https://unbaja.ac.id"
    },
    {
      id: 6,
      src: "/images/smk.webp",
      alt: "SMK PGRI 3",
      link: "https://www.smkpgri3kotaserang.sch.id/"
    },
  ];