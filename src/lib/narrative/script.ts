// Naskah cerita Code Quest — Logikalia & The Glitch.
// Disusun untuk struktur 3 level (babak): Dekomposisi (M2) -> Boolean (L1) -> Arena.
// Tiap modul materi = 3 soal: module_open -> [soal2 -> soal3 transisi] -> module_close.
// Sumber naskah lengkap: /naskah-cerita-codequest.md (di-collapse per-modul).

export const SANG_KOMPIL = "Sang Kompil";

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
  lines: DialogLine[];
}

export const NARRATIVE_SCRIPT: Record<string, DialogScene> = {
  // ── Intro dunia ───────────────────────────────────────────────
  intro_world: {
    id: "intro_world",
    trigger: "once",
    persistColumn: "has_seen_intro_world",
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
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Nah, ini Lembah Dekomposisi. Lihat tuh, Bu Warung di sana — dia mau masak, tapi bingung mulai dari mana. Semua langkah kerjanya kebayang di kepala, tapi acak, nggak ada urutan.",
        stage: "Lembah dengan asap dapur warung; orang-orang berlarian bingung.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Ini gara-gara The Glitch. Dia bikin orang-orang lupa cara mecah masalah besar jadi langkah-langkah kecil yang masuk akal.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Tugas kamu dasarnya gampang: tiap ada masalah besar, pecah dulu jadi bagian-bagian kecil. Terus kelompokkan sesuai tahapannya — mana persiapan, mana inti kerjaan, mana penutup.",
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

  // ── Level 2: L1 Boolean (Benar-Salah) ────────────────────────
  l1_module_open: {
    id: "l1_module_open",
    trigger: "once",
    persistColumn: "has_seen_l1_open",
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Ini Menara Logika Boolean. Coba lihat lampu-lampu itu — harusnya hijau artinya BENAR, merah artinya SALAH. Tapi sekarang acak, nggak ada yang bisa nebak lagi mana yang benar.",
        stage: "Menara tinggi; lampu berkedip nggak konsisten, kadang hijau kadang merah.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "The Glitch nyerang bagian paling dasar dari cara berpikir logis: aturan AND, OR, dan NOT. Kalau ini kacau, semua keputusan yang dibuat berdasarkan aturan itu ikut kacau.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Tugas kamu: bantu nyusun ulang tabel kebenarannya. Tiap kombinasi BENAR (B) dan SALAH (S) harus pas sesuai aturannya.",
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

  // ── Level 3: Arena (Multiplayer) — dipakai pada Fase 4 ───────
  arena_intro: {
    id: "arena_intro",
    trigger: "once",
    persistColumn: "has_seen_arena_intro",
    lines: [
      {
        speaker: SANG_KOMPIL,
        text: "Ini Arena. The Glitch udah kepepet, dan sekarang dia mau ngadepin kita semua sekaligus, secepat mungkin, biar kita nggak sempat mikir panjang.",
        stage: "Arena besar; langit retak dengan pola distorsi.",
      },
      {
        speaker: SANG_KOMPIL,
        text: "Di sini nggak ada waktu mikir lama kayak di Lembah atau Menara. Semua harus cepat dan tepat. Untungnya, kamu udah latihan semua dasarnya.",
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
