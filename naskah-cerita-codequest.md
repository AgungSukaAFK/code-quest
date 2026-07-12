# Naskah Cerita — Code Quest

> Dokumen ini berisi naskah dialog lengkap untuk alur cerita Code Quest. Disusun mengikuti struktur sistem yang sudah ada (M2 Dekomposisi → L1 Logika Boolean → Arena Multiplayer), dengan penyesuaian **3 soal per level** sesuai arahan terbaru.
>
> **Catatan implementasi:** setiap blok dialog ditandai dengan ID unik (`intro_world`, `m2_level1_open`, dst) supaya mudah dipetakan ke komponen `DialogBox`/`CutsceneModal` dan kolom tracking di tabel `profiles`.
>
> **Gaya bahasa:** Indonesia natural, santai tapi tetap sopan — gaya seorang mentor yang asik, bukan formal kaku. Tidak ada istilah Inggris yang tidak perlu (kecuali istilah teknis resmi seperti "AND", "OR", "NOT", "Dekomposisi" yang memang bagian dari materi).
>
> **Karakter:**
> - **Sang Kompil** — mentor/pemandu. Suportif, kadang nyeletuk santai, tapi serius soal misi.
> - **(Opsional) Warga Lembah / Penjaga Menara** — NPC pendukung, dipakai seperlunya untuk variasi suara.

---

## 0. Intro Dunia (Tampil sekali, saat pertama masuk World Map)

**ID:** `intro_world`
**Trigger:** Pertama kali user mendarat di `/world-map` (cek kolom `profiles.has_seen_intro_world`)

```
[Layar gelap, lalu muncul pelan-pelan peta Logikalia]

Sang Kompil:
"Halo! Selamat datang di Logikalia."

Sang Kompil:
"Logikalia ini dunia yang jalan berkat logika dan cara berpikir yang
rapi. Tiap proses, tiap keputusan, semuanya jalan karena ada aturan
yang masuk akal di baliknya."

Sang Kompil:
"Tapi belakangan ini, ada gangguan namanya 'The Glitch'. Dia bikin
proses-proses di Logikalia jadi berantakan. Tugas yang harusnya
urut, jadi acak. Aturan benar-salah yang harusnya jelas, jadi
kacau."

Sang Kompil:
"Aku butuh bantuan. Kamu kelihatan punya potensi buat jadi orang
yang bisa beresin ini semua — selangkah demi selangkah."

Sang Kompil:
"Ayo kita mulai dari Lembah Dekomposisi dulu. Di sana, masalahnya
paling kelihatan: semua proses jadi berantakan, gak ada yang tau
mana yang harus dikerjain duluan."

[Tombol: "Ayo Mulai" → kembali ke world map, region M2 ter-highlight]
```

---

## 1. Modul M2 — Lembah Dekomposisi

### 1.1 Pembuka Modul

**ID:** `m2_module_open`
**Trigger:** Pertama kali masuk `/play/M2` (cek `profiles.has_seen_m2_open`)

```
[Pemandangan: lembah dengan asap dapur warung, orang-orang
berlarian bingung]

Sang Kompil:
"Nah, ini Lembah Dekomposisi. Lihat tuh, Bu Warung di sana —
dia mau masak, tapi bingung mau mulai dari mana. Semua langkah
kerjanya keliatan di kepalanya, tapi acak, gak ada urutan."

Sang Kompil:
"Ini gara-gara The Glitch. Dia bikin orang-orang lupa cara
mecah masalah besar jadi langkah-langkah kecil yang masuk akal."

Sang Kompil:
"Tugas kamu gampang kok dasarnya: tiap kali ada masalah besar,
coba pecah dulu jadi bagian-bagian kecil. Terus kelompokkan
bagian itu sesuai tahapannya — mana yang persiapan, mana yang
inti kerjaannya, mana yang penutup."

Sang Kompil:
"Yuk, kita bantu Bu Warung dulu."

[Tombol: "Siap!" → mulai puzzle pertama]
```

### 1.2 Dialog per Level (5 level, 3 soal per level)

> Pola: **pembuka level** (sebelum soal 1) → **micro-dialog soal 2** (transisi singkat) → **micro-dialog soal 3** (transisi singkat) → **penutup level** (setelah soal 3 selesai, sebelum lanjut level berikutnya).
>
> Supaya tidak monoton, kalimat transisi antar-soal dibuat singkat (1-2 baris saja), bukan dialog panjang.

#### Level 1 — Pemanasan

**ID:** `m2_level1_open`
```
Sang Kompil:
"Level ini paling dasar. Kamu cuma perlu liat daftar kerjaan,
terus taruh ke kotak yang pas: Persiapan, Inti Kerjaan, atau
Penutup."

Sang Kompil:
"Gampang aja, yang penting masuk akal urutannya. Coba dulu."
```

**ID:** `m2_level1_soal2_transisi`
```
Sang Kompil:
"Bagus! Satu lagi soal kayak gini, terus kita naik level."
```

**ID:** `m2_level1_soal3_transisi`
```
Sang Kompil:
"Tinggal satu lagi nih buat level ini. Semangat!"
```

**ID:** `m2_level1_close`
```
[Asap di dapur Bu Warung mulai mereda]

Sang Kompil:
"Mantap! Bu Warung udah mulai bisa kerja lagi. Tapi ini baru
permulaan — yuk lanjut, soalnya bakal makin menantang."
```

---

#### Level 2 — Mulai Ada Jebakan

**ID:** `m2_level2_open`
```
Sang Kompil:
"Sekarang agak beda. Bakal ada kerjaan yang kelihatannya masuk
ke satu kategori, tapi sebenernya enggak. The Glitch suka
nyelipin yang kayak gini buat bikin bingung."

Sang Kompil:
"Baca pelan-pelan tiap kerjaannya sebelum nentuin masuk ke mana."
```

**ID:** `m2_level2_soal2_transisi`
```
Sang Kompil:
"Nice, kamu udah mulai jeli. Lanjut ke soal berikutnya."
```

**ID:** `m2_level2_soal3_transisi`
```
Sang Kompil:
"Satu soal lagi sebelum naik level. Tetep teliti ya."
```

**ID:** `m2_level2_close`
```
Sang Kompil:
"Keren, kamu udah gak mudah ketipu sama kerjaan yang
'kelihatannya doang'. Lanjut, ya — makin ke sini makin rumit."
```

---

#### Level 3 — Lebih Banyak Tahapan

**ID:** `m2_level3_open`
```
[Latar berganti: warung sudah agak rapi, tapi sekarang ada
masalah baru — bikin konten online, organize acara, dst. sesuai
isi puzzle]

Sang Kompil:
"Kalau di level sebelumnya cuma 3 kategori, sekarang bisa jadi
4. Masalahnya juga makin kompleks — kayak bikin konten online
atau ngatur acara."

Sang Kompil:
"Inget aja prinsipnya sama: pecah dulu, baru kelompokkan."
```

**ID:** `m2_level3_soal2_transisi`
```
Sang Kompil:
"Oke, lanjut ke yang berikutnya. Masih kuat?"
```

**ID:** `m2_level3_soal3_transisi`
```
Sang Kompil:
"Terakhir buat level ini. Ayo selesaikan!"
```

**ID:** `m2_level3_close`
```
Sang Kompil:
"Solid! Kamu udah mulai jago mecah masalah yang lebih gede.
Siap buat yang lebih menantang lagi?"
```

---

#### Level 4 — Masalah Beririsan

**ID:** `m2_level4_open`
```
Sang Kompil:
"Nah, sekarang bakal ada kerjaan yang agak ambigu — bisa masuk
ke dua kategori sekaligus kalau gak diperhatiin baik-baik.
The Glitch makin pinter ngerjain ini."

Sang Kompil:
"Coba pikirin: kerjaan ini tujuannya buat apa? Itu kuncinya
buat nentuin masuk kategori mana."
```

**ID:** `m2_level4_soal2_transisi`
```
Sang Kompil:
"Bagus banget tadi. Satu lagi yang mirip-mirip nih."
```

**ID:** `m2_level4_soal3_transisi`
```
Sang Kompil:
"Hampir kelar level ini. Fokus dikit lagi."
```

**ID:** `m2_level4_close`
```
Sang Kompil:
"Kamu udah jago banget mecah masalah yang rumit. Satu level
lagi — ini bakal jadi yang paling berat di Lembah ini."
```

---

#### Level 5 — Tantangan Akhir Lembah

**ID:** `m2_level5_open`
```
[Langit lembah sedikit gelap, tanda The Glitch lagi ngumpulin
kekuatan terakhirnya di sini]

Sang Kompil:
"Ini dia, level terakhir di Lembah Dekomposisi. Kerjaannya
banyak, tahapannya juga lebih dari biasanya."

Sang Kompil:
"Tenang aja, kamu udah latihan dari level 1. Pakai semua yang
udah kamu pelajari."
```

**ID:** `m2_level5_soal2_transisi`
```
Sang Kompil:
"Mantap, tetap di jalur yang benar. Lanjut!"
```

**ID:** `m2_level5_soal3_transisi`
```
Sang Kompil:
"Ini soal terakhir di Lembah. Habisin dengan baik!"
```

**ID:** `m2_level5_close` *(ini sekaligus jadi penutup modul, lihat 1.3)*

---

### 1.3 Penutup Modul M2

**ID:** `m2_module_close`
**Trigger:** Setelah soal terakhir level 5 selesai (cek `profiles.has_completed_m2`)

```
[Asap dapur hilang total, lembah jadi tenang, orang-orang
udah kembali kerja dengan teratur]

Sang Kompil:
"Selesai! Lembah Dekomposisi udah bener-bener pulih. Bu Warung
sekarang bisa masak tanpa bingung lagi, dan semua orang di sini
udah bisa kerja sesuai urutan yang masuk akal."

Sang Kompil:
"Tapi ini cuma satu gejala dari The Glitch. Dia juga nyerang
bagian lain dari Logikalia — bagian yang lebih dalam, soal
bener dan salah itu sendiri."

Sang Kompil:
"Ayo kita ke Menara Logika Boolean. Di sana masalahnya beda
lagi — dan menurutku, ini bakal lebih bikin kamu mikir keras."

[Tombol: "Lanjut ke Menara" → kembali ke world map, region L1
ter-highlight]
```

---

## 2. Modul L1 — Menara Logika Boolean

### 2.1 Pembuka Modul

**ID:** `l1_module_open`
**Trigger:** Pertama kali masuk `/play/L1` (cek `profiles.has_seen_l1_open`)

```
[Menara tinggi dengan lampu yang berkedip gak konsisten — kadang
hijau kadang merah, gak jelas aturannya]

Sang Kompil:
"Ini Menara Logika Boolean. Coba liat lampu-lampu itu — harusnya
hijau itu artinya BENAR, merah itu SALAH. Tapi sekarang acak,
gak ada yang bisa nebak lagi mana yang bener."

Sang Kompil:
"The Glitch nyerang bagian paling dasar dari cara berpikir logis:
aturan AND, OR, sama NOT. Kalau ini kacau, semua keputusan yang
dibuat berdasarkan aturan itu juga ikut kacau."

Sang Kompil:
"Tugas kamu di sini: bantu nyusun ulang tabel kebenarannya. Tiap
kombinasi BENAR (B) dan SALAH (S) harus pas sesuai aturannya."

Sang Kompil:
"Kedengerannya rumit, tapi kalau udah ngerti aturannya, ini
sebenernya simpel kok. Yuk, kita mulai dari yang paling dasar."

[Tombol: "Siap!" → mulai puzzle pertama]
```

### 2.2 Dialog per Level (5 level, 3 soal per level)

#### Level 1 — AND & OR Dasar

**ID:** `l1_level1_open`
```
Sang Kompil:
"Kita mulai dari dua aturan paling dasar: AND sama OR."

Sang Kompil:
"AND itu ketat — hasilnya BENAR cuma kalau semua syaratnya
BENAR. OR itu lebih santai — asal salah satu aja BENAR, hasilnya
udah BENAR."

Sang Kompil:
"Coba isi tabelnya. Klik kotak hasil buat ganti B atau S."
```

**ID:** `l1_level1_soal2_transisi`
```
Sang Kompil:
"Pas! Satu lagi soal kayak gini, jenis aturannya beda."
```

**ID:** `l1_level1_soal3_transisi`
```
Sang Kompil:
"Terakhir buat level ini. Yakin udah ngerti bedanya AND sama OR?"
```

**ID:** `l1_level1_close`
```
[Satu lampu di Menara mulai stabil — hijau-merah-nya udah bener]

Sang Kompil:
"Satu lampu udah stabil! Kamu udah ngerti dasar AND dan OR.
Lanjut ke yang lebih menantang."
```

---

#### Level 2 — Kenalan dengan NOT

**ID:** `l1_level2_open`
```
Sang Kompil:
"Sekarang kenalan sama NOT. Ini aturannya simpel: dia cuma
membalik. Kalau awalnya BENAR, NOT bikin jadi SALAH. Kalau
SALAH, NOT bikin jadi BENAR."

Sang Kompil:
"Yang bikin tricky: NOT bisa digabung sama AND atau OR. Jadi
perhatiin urutannya — mana yang di-NOT duluan."
```

**ID:** `l1_level2_soal2_transisi`
```
Sang Kompil:
"Bener! Lanjut, masih soal NOT yang digabung sama aturan lain."
```

**ID:** `l1_level2_soal3_transisi`
```
Sang Kompil:
"Satu soal lagi. Tetep fokus sama urutan NOT-nya ya."
```

**ID:** `l1_level2_close`
```
Sang Kompil:
"Bagus, NOT udah gak bikin kamu bingung lagi. Sekarang kita
gabungin lebih dari dua aturan sekaligus."
```

---

#### Level 3 — Gabungan dengan Tanda Kurung

**ID:** `l1_level3_open`
```
Sang Kompil:
"Di level ini, ekspresinya pakai tanda kurung. Inget: yang di
dalam kurung itu dikerjain duluan, baru digabung sama bagian
luar."

Sang Kompil:
"Kayak matematika biasa — kerjain yang di dalam kurung dulu."
```

**ID:** `l1_level3_soal2_transisi`
```
Sang Kompil:
"Mantap! Lanjut, ekspresinya agak beda susunan kurungnya."
```

**ID:** `l1_level3_soal3_transisi`
```
Sang Kompil:
"Satu soal lagi buat level ini. Pelan-pelan aja gak masalah."
```

**ID:** `l1_level3_close`
```
Sang Kompil:
"Keren, kamu udah lancar baca ekspresi yang pakai kurung.
Sekarang lampu Menara makin banyak yang stabil."
```

---

#### Level 4 — Tiga Variabel

**ID:** `l1_level4_open`
```
Sang Kompil:
"Sekarang naik ke 3 variabel sekaligus: P, Q, sama R. Tabelnya
jadi lebih panjang, tapi caranya tetep sama — kerjain bagian
per bagian."

Sang Kompil:
"Jangan buru-buru. Cek satu-satu baris di tabelnya."
```

**ID:** `l1_level4_soal2_transisi`
```
Sang Kompil:
"Sip, tetep teliti ya buat soal berikutnya."
```

**ID:** `l1_level4_soal3_transisi`
```
Sang Kompil:
"Hampir kelar level ini. Ayo selesaikan!"
```

**ID:** `l1_level4_close`
```
Sang Kompil:
"Tiga variabel pun udah bisa kamu taklukin. Satu level lagi —
ini yang paling rumit di Menara."
```

---

#### Level 5 — Tantangan Akhir Menara

**ID:** `l1_level5_open`
```
[Menara bergetar pelan, lampu-lampu berkedip makin cepat — The
Glitch lagi nyoba pertahanan terakhirnya]

Sang Kompil:
"Ini level terakhir di Menara. Ekspresinya berlapis-lapis, ada
yang sampai 3 tingkat kurung."

Sang Kompil:
"Tarik napas dulu. Kerjain selapis-selapis, dari yang paling
dalam dulu. Kamu pasti bisa."
```

**ID:** `l1_level5_soal2_transisi`
```
Sang Kompil:
"Bener! Satu lagi yang sama tingkat kesulitannya."
```

**ID:** `l1_level5_soal3_transisi`
```
Sang Kompil:
"Soal terakhir di Menara ini. Habisin sampai tuntas!"
```

---

### 2.3 Penutup Modul L1

**ID:** `l1_module_close`
**Trigger:** Setelah soal terakhir level 5 selesai (cek `profiles.has_completed_l1`)

```
[Semua lampu Menara akhirnya stabil — hijau buat BENAR, merah
buat SALAH, konsisten]

Sang Kompil:
"Selesai juga! Menara Logika Boolean udah bener-bener pulih.
Sekarang sistem kebenarannya udah jelas lagi — gak ada yang
ketuker antara BENAR sama SALAH."

Sang Kompil:
"Kamu udah berhasil benerin dua gejala besar The Glitch:
masalah dekomposisi di Lembah, sama masalah logika di Menara.
Tapi The Glitch sendiri belum bener-bener kalah."

Sang Kompil:
"Dia bakal coba nyerang balik — kali ini langsung, lebih cepat,
dan lebih berani. Untungnya, kamu gak akan sendirian ngadepin
ini."

Sang Kompil:
"Ayo kumpulin Logikalian* lain, terus kita hadapi The Glitch
bareng-bareng di Arena."

[Tombol: "Lanjut ke Arena" → kembali ke world map, region Arena
ter-highlight]
```

> *Catatan: "Logikalian" dipakai sebagai sebutan informal untuk sesama pemain/siswa lain — bukan istilah asing, lebih ke "nama warga Logikalia". Bisa diganti istilah lain kalau dirasa kurang pas, misalnya "teman seperjuangan" atau "sesama penjaga Logikalia".

---

## 3. Arena Pertempuran (Multiplayer)

### 3.1 Sebelum Masuk Lobby

**ID:** `arena_intro`
**Trigger:** Pertama kali masuk halaman `/multiplayer` (cek `profiles.has_seen_arena_intro`)

```
[Arena besar, langit retak dengan pola distorsi — efek visual
"glitch" sederhana]

Sang Kompil:
"Ini Arena. The Glitch udah kepepet, dan sekarang dia mau
ngadepin kita semua sekaligus, secepat mungkin, biar kita gak
sempat berpikir panjang."

Sang Kompil:
"Di sini gak ada waktu buat mikir lama-lama kayak di Lembah
atau Menara. Semua harus cepat dan tepat. Untungnya, kamu udah
latihan semua dasarnya."

Sang Kompil:
"Ajak teman-teman kamu, buat atau gabung ke ruangan, dan kita
hadapi bareng-bareng. Semangat!"

[Tombol: "Masuk Arena" → masuk ke halaman lobby multiplayer]
```

### 3.2 Saat Game Dimulai (opsional, di room sebelum soal pertama)

**ID:** `arena_room_start`
**Trigger:** Saat host menekan "Mulai" (status room jadi `playing`)

```
Sang Kompil:
"The Glitch udah di depan kalian. 10 tantangan, waktu terbatas
tiap soal. Yang paling cepat dan tepat, paling besar pukulannya
ke The Glitch. Ayo!"
```

### 3.3 Kemenangan (Podium)

**ID:** `arena_victory`
**Trigger:** Status room `finished`, podium ditampilkan

```
[The Glitch mengecil, retak di langit Arena mulai menutup]

Sang Kompil:
"Berhasil! The Glitch kepukul mundur. Logikalia aman buat
sekarang."

Sang Kompil:
"Tapi jujur aja — dia gak akan bener-bener hilang. The Glitch
itu kayak bug yang selalu ada di mana-mana, nunggu kesempatan
buat muncul lagi."

Sang Kompil:
"Untungnya, sekarang udah ada lebih banyak orang seperti kamu
yang siap ngadepin dia. Terima kasih udah jadi salah satunya."

[Tampilkan podium dengan skor pemain]
```

---

## 4. Implementasi Teknis (Catatan untuk Developer)

### 4.1 Skema Tracking Cutscene

Tambahkan kolom boolean ke tabel `profiles` (migration baru), satu kolom per checkpoint cerita utama:

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_seen_intro_world BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_seen_m2_open BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_completed_m2 BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_seen_l1_open BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_completed_l1 BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_seen_arena_intro BOOLEAN DEFAULT FALSE;
```

**Catatan:** dialog **per-level** dan **per-soal** (level open/close, transisi soal 2 & 3) **tidak perlu tracking DB** — cukup tampil tiap kali user masuk level itu dalam satu sesi main (state lokal di komponen, reset tiap kali load `/play/[moduleId]`). Hanya checkpoint cerita besar (intro world, module open/close, arena) yang perlu persist di DB supaya tidak diulang tiap kali masuk modul yang sama.

### 4.2 Struktur Data Naskah

Simpan seluruh naskah ini sebagai objek terstruktur (bukan hardcode di komponen), supaya mudah dipanggil dinamis:

```typescript
// src/lib/narrative/script.ts
export interface DialogLine {
  speaker: string
  text: string
}

export interface DialogScene {
  id: string
  lines: DialogLine[]
  trigger: 'once' | 'per_session' // once = cek kolom profiles, per_session = tampil tiap masuk
}

export const NARRATIVE_SCRIPT: Record<string, DialogScene> = {
  intro_world: {
    id: 'intro_world',
    trigger: 'once',
    lines: [
      { speaker: 'Sang Kompil', text: 'Halo! Selamat datang di Logikalia.' },
      // ...
    ],
  },
  m2_level1_open: {
    id: 'm2_level1_open',
    trigger: 'per_session',
    lines: [
      { speaker: 'Sang Kompil', text: 'Level ini paling dasar...' },
    ],
  },
  // ... dst untuk semua ID di atas
}
```

### 4.3 Titik Pemanggilan di Flow Existing

Berdasarkan alur end-to-end yang sudah ada (`/api/puzzle/next` → solve → `/api/puzzle/submit` → next), dialog disisipkan di titik-titik berikut tanpa mengubah loop inti:

```
Masuk /play/[moduleId]
  → cek has_seen_{module}_open di profiles
  → kalau belum: tampilkan module_open, lalu set flag true
  → kalau level baru dimulai (level berubah dari puzzle sebelumnya):
      tampilkan {module}_level{N}_open
  → tampilkan puzzle (soal ke-1 di level ini)
  → submit → next
  → kalau ini soal ke-2 di level: tampilkan {module}_level{N}_soal2_transisi sebelum render puzzle
  → kalau ini soal ke-3 di level: tampilkan {module}_level{N}_soal3_transisi sebelum render puzzle
  → submit soal ke-3 → kalau level terakhir (5) & modul selesai:
      tampilkan {module}_level5_close → lanjut ke {module}_module_close
      → set has_completed_{module} = true
    kalau bukan level terakhir:
      tampilkan {module}_level{N}_close → lanjut ke level berikutnya
```

**Penting:** karena soal per level sekarang 3 (bukan 5), pastikan logic "next puzzle" tahu kapan soal ke-1/2/3 dalam 1 level — bisa pakai counter sederhana di state client (`questionIndexInLevel`), reset setiap kali level/difficulty berubah.

### 4.4 Komponen UI yang Dibutuhkan

```
<DialogBox />
  - Props: scene (DialogScene), onComplete (callback)
  - Render avatar Sang Kompil (DiceBear seed tetap, mis. "sang-kompil")
  - Render lines satu-satu dengan tombol "Lanjut" (atau auto-advance kalau mau)
  - Tombol "Lewati" (skip) untuk siswa yang sudah pernah lihat (terutama versi per_session)
```

---

## 5. Ringkasan Jumlah Konten yang Perlu Ditulis/Dipakai

| Bagian | Jumlah scene dialog |
|--------|---------------------|
| Intro world | 1 |
| M2 — module open/close | 2 |
| M2 — per level (open + 2 transisi + close) × 5 level | 20 |
| L1 — module open/close | 2 |
| L1 — per level (open + 2 transisi + close) × 5 level | 20 |
| Arena — intro + room start + victory | 3 |
| **Total** | **48 scene** |

Semua sudah didraft lengkap di atas. Tidak ada yang perlu ditulis ulang dari nol — tinggal dipindahkan ke struktur data/komponen.

---

*Naskah ini bisa direvisi bebas — kalau ada bagian yang kurang pas dengan nada/karakter yang Anda mau, tinggal kasih tahu bagian mana, saya revisi targeted tanpa perlu nulis ulang semua.*
