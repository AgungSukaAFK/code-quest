// Naskah cerita Code Quest — Logikalia & The Glitch.
// Disusun untuk struktur 3 level (babak): Dekomposisi (M2) -> Boolean (L1) -> Arena.
// Tiap modul materi = 3 soal: module_open -> [soal2 -> soal3 transisi] -> module_close.
// Sumber naskah lengkap: /naskah-cerita-codequest.md (di-collapse per-modul).

import { BG, CHAR } from "@/lib/assets";

export const SANG_KOMPIL = "Sang Kompil";
export const THE_GLITCH = "The Glitch";

// Kolom boolean di tabel `profiles` untuk cutscene "sekali tampil".
export type NarrativeColumn =
  | "has_seen_intro_world"
  | "has_seen_m2_open"
  | "has_completed_m2"
  | "has_seen_l1_open"
  | "has_completed_l1"
  | "has_seen_arena_intro";

export interface DialogLine {
  speaker: string;
  text: string;
  /** Catatan latar/visual opsional (italic, di atas dialog). */
  stage?: string;
}

export interface DialogScene {
  id: string;
  /** once = checkpoint besar (persist ke profiles); per_session = transisi ringan. */
  trigger: "once" | "per_session";
  /** Kolom profiles yang di-set true saat scene selesai (untuk trigger "once"). */
  persistColumn?: NarrativeColumn;
  /** URL background full-screen khusus cutscene ini (opsional). */
  background?: string;
  /** URL karakter tambahan (mis. The Glitch) yang muncul di sisi berlawanan (opsional). */
  figure?: string;
  lines: DialogLine[];
}

export const NARRATIVE_SCRIPT: Record<string, DialogScene> = {
  // ── Intro dunia ───────────────────────────────────────────────
  intro_world: {
    id: "intro_world",
    trigger: "once",
    persistColumn: "has_seen_intro_world",
    background: BG.worldmap,
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Halo! Selamat datang di Logikalia.",
        stage: "Layar gelap, lalu peta Logikalia muncul pelan-pelan.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Logikalia ini dunia yang jalan berkat logika dan cara berpikir yang rapi. Tiap proses, tiap keputusan, semuanya jalan karena ada aturan yang masuk akal di baliknya.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Tapi belakangan ini ada gangguan namanya 'The Glitch'. Dia bikin proses-proses di Logikalia jadi berantakan. Tugas yang harusnya urut jadi acak. Aturan benar-salah yang harusnya jelas jadi kacau.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Aku butuh bantuan. Kamu kelihatan punya potensi buat beresin ini semua — selangkah demi selangkah.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Ayo kita mulai dari Lembah Dekomposisi dulu. Di sana masalahnya paling kelihatan: semua proses berantakan, nggak ada yang tahu mana yang harus dikerjain duluan.",
      },
    ],
  },

  // ── Level 1: M2 Dekomposisi ──────────────────────────────────
  m2_module_open: {
    id: "m2_module_open",
    trigger: "once",
    persistColumn: "has_seen_m2_open",
    background: BG.lembahGlitched,
    figure: CHAR.glitch,
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Nah, ini Lembah Dekomposisi. Lihat tuh, Bu Warung di sana — dia mau masak, tapi bingung mulai dari mana. Semua langkah kerjanya kebayang di kepala, tapi acak, nggak ada urutan.",
        stage: "Lembah dengan asap dapur warung; orang-orang berlarian bingung.",
      },
      {
        speaker: THE_GLITCH,
        text: "Hehehe... kacau, kan? Aku suka banget lihat semuanya berantakan begini. Nggak ada urutan, nggak ada yang beres. Sempurna!",
      },
      {
        speaker: SANG_KOMPIL,
        text: "The Glitch! Jadi ini ulahmu. Kamu bikin orang-orang lupa cara mecah masalah besar jadi langkah-langkah kecil.",
      },
      {
        speaker: THE_GLITCH,
        text: "Dan kamu mau membetulkannya? Silakan coba, bocah. Kalau bisa. Ha!",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Tenang, kita hadapi bareng. Caranya gampang: tiap ada masalah besar, pecah dulu jadi bagian kecil, terus kelompokkan sesuai tahapannya — mana persiapan, mana inti kerjaan, mana penutup.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Kamu bakal kerjain 3 soal di sini. Yuk, kita bantu Bu Warung dulu!",
      },
    ],
  },
  m2_soal2: {
    id: "m2_soal2",
    trigger: "per_session",
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Bagus! Satu beres. Lanjut, masih ada soal lagi di Lembah ini.",
      },
    ],
  },
  m2_soal3: {
    id: "m2_soal3",
    trigger: "per_session",
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Tinggal satu soal terakhir di Lembah. Semangat, kamu pasti bisa!",
      },
    ],
  },
  m2_module_close: {
    id: "m2_module_close",
    trigger: "once",
    persistColumn: "has_completed_m2",
    background: BG.lembah,
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Selesai! Lembah Dekomposisi udah pulih. Bu Warung sekarang bisa masak tanpa bingung, dan semua orang di sini udah kerja sesuai urutan yang masuk akal.",
        stage: "Asap dapur hilang, lembah tenang, orang-orang kembali bekerja teratur.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Tapi ini cuma satu gejala The Glitch. Dia juga nyerang bagian lain Logikalia — bagian yang lebih dalam, soal benar dan salah itu sendiri.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Ayo lanjut ke Menara Logika Boolean. Di sana masalahnya beda lagi — dan menurutku ini bakal lebih bikin kamu mikir keras.",
      },
    ],
  },
  m2_replay: {
    id: "m2_replay",
    trigger: "per_session",
    background: BG.lembah,
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Hei, selamat datang lagi di Lembah Dekomposisi! Berkat kamu, di sini udah aman — semua orang kerja rapi dan urutannya masuk akal lagi.",
        stage: "Lembah tenang, dapur Bu Warung mengepul santai.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Nggak ada misi wajib di sini sekarang. Tapi kalau kamu mau terus mengasah, silakan — aku siapin soal sebanyak yang kamu mau. Latihan bebas, tanpa batas!",
      },
    ],
  },

  // ── Level 2: L1 Boolean (Benar-Salah) ────────────────────────
  l1_module_open: {
    id: "l1_module_open",
    trigger: "once",
    persistColumn: "has_seen_l1_open",
    background: BG.menara,
    figure: CHAR.glitch,
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Ini Menara Logika Boolean. Coba lihat lampu-lampu itu — harusnya hijau artinya BENAR, merah artinya SALAH. Tapi sekarang acak, nggak ada yang bisa nebak lagi mana yang benar.",
        stage: "Menara tinggi; lampu berkedip nggak konsisten, kadang hijau kadang merah.",
      },
      {
        speaker: THE_GLITCH,
        text: "Benar jadi salah, salah jadi benar... siapa sih yang peduli? Aturan itu membosankan. Aku cuma bikin sedikit lebih 'seru'!",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Seru katamu? Kalau logika dasar — AND, OR, NOT — dibikin kacau, semua keputusan ikut kacau. Kita betulkan, sekarang juga.",
      },
      {
        speaker: THE_GLITCH,
        text: "Cih. Lihat saja berapa lama kamu bertahan di menaraku ini...",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Tugas kamu: bantu susun ulang tabel kebenarannya. Tiap kombinasi BENAR (B) dan SALAH (S) harus pas sesuai aturannya.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Kedengerannya rumit, tapi kalau udah ngerti aturannya, sebenernya simpel kok. 3 soal lagi — yuk mulai dari yang paling dasar!",
      },
    ],
  },
  l1_soal2: {
    id: "l1_soal2",
    trigger: "per_session",
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Pas! Lanjut ke soal berikutnya — jenis aturannya beda lagi.",
      },
    ],
  },
  l1_soal3: {
    id: "l1_soal3",
    trigger: "per_session",
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Soal terakhir di Menara. Tetap fokus sama urutan operasinya ya!",
      },
    ],
  },
  l1_module_close: {
    id: "l1_module_close",
    trigger: "once",
    persistColumn: "has_completed_l1",
    background: BG.menaraStabil,
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Selesai juga! Menara Logika Boolean udah pulih. Sistem kebenarannya jelas lagi — nggak ada yang ketuker antara BENAR dan SALAH.",
        stage: "Semua lampu Menara stabil: hijau untuk BENAR, merah untuk SALAH.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Kamu udah benerin dua gejala besar The Glitch: dekomposisi di Lembah, dan logika di Menara. Tapi The Glitch sendiri belum bener-bener kalah.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Dia bakal nyerang balik — kali ini langsung, lebih cepat, lebih berani. Untungnya kamu nggak sendirian. Ayo kumpulin teman-teman, kita hadapi The Glitch bareng-bareng di Arena!",
      },
    ],
  },
  l1_replay: {
    id: "l1_replay",
    trigger: "per_session",
    background: BG.menaraStabil,
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Selamat datang kembali di Menara Logika Boolean! Lampunya udah stabil semua — hijau BENAR, merah SALAH, konsisten. Semua berkat kamu.",
        stage: "Menara tenang, lampu berkedip teratur.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Nggak ada yang perlu dibetulin lagi di sini. Tapi kalau mau terus latihan tabel kebenaran, ayo aja — soalnya nggak terbatas kok. Santai, nikmatin!",
      },
    ],
  },

  // ── Level 3: Arena (Multiplayer) — dipakai pada Fase 4 ───────
  arena_intro: {
    id: "arena_intro",
    trigger: "once",
    persistColumn: "has_seen_arena_intro",
    background: BG.arena,
    figure: CHAR.glitch,
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Ini Arena. Kamu udah benerin Lembah dan Menara — The Glitch kepepet sekarang.",
        stage: "Arena besar; langit retak dengan pola distorsi.",
      },
      {
        speaker: THE_GLITCH,
        text: "Kepepet?! Justru sekarang aku baru serius! Akan kuhadapi kalian semua sekaligus — secepat mungkin, biar kalian nggak sempat berpikir!",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Nah, itu dia. Di sini nggak ada waktu mikir lama kayak di Lembah atau Menara — semua harus cepat dan tepat. Untung kamu udah latihan semua dasarnya.",
      },
      {
        speaker: THE_GLITCH,
        text: "Kecepatan? Ketepatan? Kita lihat siapa yang tumbang duluan. Bersiaplah!",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Ajak teman-temanmu, buat atau gabung ke ruangan, dan kita hadapi bareng-bareng. Semangat!",
      },
    ],
  },
  arena_room_start: {
    id: "arena_room_start",
    trigger: "per_session",
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "The Glitch udah di depan kalian. 10 tantangan, waktu terbatas tiap soal. Yang paling cepat dan tepat, paling besar pukulannya ke The Glitch. Ayo!",
      },
    ],
  },
  arena_victory: {
    id: "arena_victory",
    trigger: "per_session",
    background: BG.arenaVictory,
    figure: CHAR.glitch,
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Berhasil! The Glitch kepukul mundur. Logikalia aman buat sekarang.",
        stage: "The Glitch mengecil; retak di langit Arena mulai menutup.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Tapi jujur, dia nggak akan bener-bener hilang. The Glitch itu kayak bug yang selalu nunggu kesempatan buat muncul lagi.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Untungnya, sekarang udah ada lebih banyak orang seperti kamu yang siap ngadepin dia. Terima kasih udah jadi salah satunya.",
      },
    ],
  },
};

/** Prefix scene per modul materi. */
export function modulePrefix(moduleId: string): "m2" | "l1" | null {
  const id = moduleId.toLowerCase();
  if (id === "m2") return "m2";
  if (id === "l1") return "l1";
  return null;
}
