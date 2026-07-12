# Code Quest — Dokumentasi Sistem

> Dokumen ini menjelaskan keseluruhan sistem **Code Quest** secara penuh dan detail, dari konsep produk, arsitektur, alur permainan, sistem Reinforcement Learning (RL) adaptif, mode multiplayer, sampai skema database. Ditujukan sebagai bahan diskusi agar siapapun (termasuk AI/model lain) bisa memahami project ini secara utuh tanpa perlu membaca seluruh kode.

---

## 1. Ringkasan Produk

**Code Quest** adalah game edukasi berbasis web untuk mengajarkan **Computational Thinking** dan **Logika Boolean** kepada siswa. Keunikan utamanya: tingkat kesulitan soal **diatur secara adaptif** oleh agen **Q-Learning (Reinforcement Learning)** berdasarkan performa tiap siswa, sehingga setiap siswa mendapat tantangan yang sesuai kemampuannya (tidak terlalu mudah, tidak terlalu sulit).

Saat ini ada **2 modul materi**:

| ID Modul | Nama | Tipe | Materi |
|----------|------|------|--------|
| `M2` | Dekomposisi | `computational_thinking` | Memecah masalah besar menjadi sub-tugas, lalu mengelompokkannya ke kategori/tahap yang benar |
| `L1` | Logika Boolean | `logic_math` | Operasi AND, OR, NOT, implikasi — melengkapi tabel kebenaran (memakai istilah **B/S**, bukan 0/1) |

Tiga "lokasi" pada world map: **Lembah Dekomposisi (M2)** → **Menara Logika Boolean (L1)** → **Arena Pertempuran (multiplayer)**.

---

## 2. Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| Framework | **Next.js 16.2.5** (App Router, React 19.2) — *catatan: versi ini punya breaking change vs Next.js lama; selalu cek `node_modules/next/dist/docs/` sebelum menulis kode* |
| Bahasa | TypeScript 5 |
| Styling | Tailwind CSS v4, `tw-animate-css`, shadcn/ui, `@base-ui/react` |
| Animasi | Framer Motion 12, `canvas-confetti` |
| State (client) | Zustand 5 (`gameStore`, `userStore`) |
| Form & Validasi | React Hook Form 7 + Zod 4 |
| Drag & Drop | `@dnd-kit/*` (puzzle dekomposisi) |
| Database & Auth | **Supabase** (Postgres + Auth + Realtime + RLS) via `@supabase/ssr` & `@supabase/supabase-js` |
| Notifikasi UI | `sonner` |
| Ikon | `lucide-react` |
| Avatar | DiceBear (lewat `avatar_seed`) |

### Variabel Environment
- `NEXT_PUBLIC_SUPABASE_URL` — URL project Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key (client & SSR)
- `SUPABASE_SERVICE_ROLE_KEY` — service-role key (operasi admin di server: tulis q_tables, rl_events, buat user)
- `STUDENT_AUTH_SECRET` — secret untuk men-generate password siswa secara deterministik

---

## 3. Struktur Aplikasi (Routing)

App Router dengan **route groups**:

```
src/app/
├── (auth)/login/              # Halaman login (siswa via NISN+Nama, moderator via email)
├── (game)/                    # Area utama pemain (dilindungi auth)
│   ├── layout.tsx
│   ├── world-map/             # Peta dunia: pilih modul
│   ├── play/[moduleId]/       # Loop bermain puzzle adaptif (RL)
│   ├── multiplayer/           # Lobi multiplayer
│   ├── multiplayer/[code]/    # Ruang/room multiplayer (realtime)
│   ├── leaderboard/           # Papan peringkat
│   ├── profile/               # Profil & progress siswa
│   ├── rl-dashboard/          # Visualisasi Q-Table & event RL (untuk transparansi/penelitian)
│   └── rl-dashboard/simulation/  # Simulator RL (uji kebijakan tanpa siswa nyata)
├── (moderator)/moderator/     # Panel moderator/guru
│   ├── puzzles/               # CRUD soal
│   └── users/                 # Kelola siswa & moderator
└── api/                       # Route handler (lihat §4)
```

**Middleware** (`src/lib/supabase/middleware.ts`) menjaga route. Route terproteksi: `/world-map`, `/play`, `/profile`, `/leaderboard`, `/rl-dashboard`, `/moderator`. Bila belum login → redirect `/login`. Bila sudah login & buka `/login` → redirect `/world-map`.

### Klien Supabase (`src/lib/supabase/`)
- `client.ts` — browser client (anon key)
- `server.ts` — server client berbasis cookie (anon key, untuk Server Components & route handler atas nama user)
- `admin.ts` — admin client (service-role key, **bypass RLS**, hanya di server)
- `middleware.ts` — refresh sesi + guard route

---

## 4. API Routes (Server)

### Inti gameplay (RL)
| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/api/puzzle/next` | POST | **Pilih soal berikutnya** lewat agen RL (atau cold-start). Mengembalikan puzzle + `rl_decision` + `state`. |
| `/api/puzzle/submit` | POST | **Validasi jawaban**, catat attempt, hitung reward, update Q-Table & skill siswa, simpan rl_event. |

### Multiplayer
| Endpoint | Fungsi |
|----------|--------|
| `/api/multiplayer/create` | Buat room (kode unik, host) |
| `/api/multiplayer/join` | Gabung room via kode |
| `/api/multiplayer/leave` | Keluar room |
| `/api/multiplayer/start` | Host mulai game; generate 10 soal pilihan ganda |
| `/api/multiplayer/next` | Host maju ke soal berikutnya |
| `/api/multiplayer/answer` | Pemain submit jawaban; hitung skor berbasis kecepatan |

### Moderator (butuh service-role, validasi peran moderator)
`create-moderator`, `create-student`, `import-students` (impor massal), `update-user`, `delete-user`, `upsert-puzzle`, `delete-puzzle`.

### Auth & RL lainnya
- `/api/auth/student-login` — login siswa via **NISN + Nama Lengkap** (lihat §8)
- `/api/rl/simulate` — jalankan simulasi RL untuk dashboard penelitian

---

## 5. Tipe Puzzle & Konten

Tipe puzzle (`src/types/puzzle.ts`): `decomposition_sort`, `decomposition_order`, `truth_table`, `circuit_eval`. Yang **aktif diimplementasikan**: `decomposition_sort` dan `truth_table`.

Konten soal disimpan sebagai **JSONB** di kolom `puzzles.content`.

### 5.1 Decomposition Sort (M2)
Siswa menyeret/menempatkan daftar **tugas** ke **kategori** yang benar.
```json
{
  "type": "decomposition_sort",
  "categories": [{"id": "prep", "label": "Persiapan", "color": "blue"}, ...],
  "tasks": [{"id": "t1", "label": "Iris bawang merah"}, ...],
  "correct_mapping": { "t1": "prep", "t2": "cook", ... }
}
```
Contoh soal: *"Bikin Nasi Goreng"* — kelompokkan langkah ke Persiapan / Memasak / Penyajian.

**Validasi** (`validateDecompositionSort`): hitung berapa task yang kategorinya benar. `partial_score = benar/total`. `solved` hanya bila `partial_score === 1`.

### 5.2 Truth Table / Boolean (L1)
Siswa melengkapi output tabel kebenaran untuk sebuah ekspresi logika.
```json
{
  "type": "truth_table",
  "expression": "P && Q",
  "display_expression": "P ∧ Q",
  "variables": ["P", "Q"],
  "rows": [
    {"inputs": {"P": true, "Q": false}, "expected_output": false}, ...
  ],
  "explanation": "AND hanya menghasilkan TRUE jika kedua input TRUE."
}
```
UI menampilkan nilai sebagai **B (Benar)** / **S (Salah)** — bukan 0/1 — pada tombol output maupun sel input (`BooleanPuzzle.tsx`, `TruthTableCell.tsx`).

**Validasi** (`evaluateTruthTable`): bandingkan `answer.outputs[i]` dengan `rows[i].expected_output`. `partial_score = benar/total`, `solved` bila semua baris benar.

> **Catatan konsistensi istilah:** UI tabel kebenaran sudah memakai B/S. Namun teks `explanation` (di seed) dan generator soal multiplayer masih memakai `TRUE/FALSE` — kandidat penyeragaman bila diperlukan.

Tiap puzzle punya: `difficulty` (1–5), `expected_time_sec`, `variation_type`, `concepts_tested[]`, `title`, `context`, `goal`.

---

## 6. Sistem Reinforcement Learning (Inti Adaptif)

Tujuan RL: **memilih tingkat kesulitan soal berikutnya** agar siswa tetap di "zona belajar optimal". Algoritma: **Q-Learning tabular** dengan kebijakan **ε-greedy**. Satu Q-Table **per modul** (M2 & L1), dibagikan lintas siswa (kebijakan global yang belajar dari semua siswa).

### 6.1 State (kondisi siswa) — `src/lib/rl/state.ts`, `state-builder.ts`
State adalah diskretisasi dari performa terkini siswa, terdiri dari 4 dimensi → **54 kemungkinan state**:

| Dimensi | Bin | Aturan diskretisasi |
|---------|-----|---------------------|
| `skill_bin` | low / medium / high | skill < 0.4 / < 0.7 / ≥ 0.7 |
| `accuracy_bin` | low / medium / high | akurasi 5 attempt terakhir < 0.4 / < 0.75 / ≥ 0.75 |
| `streak_bin` | negative / neutral / positive | streak ≤ −2 / antara / ≥ 2 |
| `hint_bin` | low / high | rata-rata hint < 1 / ≥ 1 |

State key berformat string: `"skill|accuracy|streak|hint"`, contoh `"medium|high|positive|low"`.

`buildStudentState()` membaca `student_skills.skill_level` + 5 attempt terakhir (dari sessions modul terkait) untuk menghitung akurasi, streak, dan rata-rata hint.

### 6.2 Action (tingkat kesulitan) — `src/lib/rl/q-learning.ts`
Tiga aksi:

| Action | Arti | Rentang difficulty soal yang diambil |
|--------|------|--------------------------------------|
| `1` | Mudahkan | difficulty 1–2 |
| `2` | Sedang | difficulty 3 |
| `3` | Sulitkan | difficulty 4–5 |

Pemilihan aksi (`selectAction`): dengan probabilitas `ε` → **eksplorasi** (acak); selain itu → **eksploitasi** (argmax Q, tie-break acak).

### 6.3 Reward — `src/lib/rl/reward.ts`
Reward total = jumlah dari 3 komponen:

1. **outcome_component** (hasil):
   - Solved & cepat (`time_ratio < 0.5`): `+0.3` (terlalu mudah → reward kecil)
   - Solved & wajar (`0.5 ≤ time_ratio ≤ 1.5`): `+1.0` (ideal)
   - Solved & lambat (`> 1.5`): `+0.7`
   - Menyerah (`gave_up`): `−1.5`
   - Gagal tapi progress ≥ 0.5: `+0.2`
   - Gagal & progress rendah: `−0.8`
2. **skill_growth_component**: `(skill_after − skill_before) × 3.0` — menghargai pertumbuhan skill.
3. **hint_penalty**: `−0.15 × jumlah_hint`.

Filosofi: reward tertinggi saat siswa berhasil dengan usaha yang **wajar** (bukan terlalu mudah/terlalu sulit), dan saat skill bertumbuh.

### 6.4 Update Q-Learning
Rumus standar:
```
TD_error = reward + γ · max_a' Q(s', a') − Q(s, a)
Q(s, a) ← Q(s, a) + α · TD_error
```
Hyperparameter (default di tabel `q_tables`):
- `learning_rate` (α) = 0.1
- `discount_factor` (γ) = 0.9
- `epsilon` (ε) awal = 1.0, `epsilon_min` = 0.1, `epsilon_decay` = 0.995 per episode

Setiap submit: agent `update()` → `incrementEpisode()` → `decayEpsilon()` → disimpan kembali. Q-Table dimuat/disimpan via `loadAgent`/`saveAgent` (`q-table-store.ts`) memakai **admin client** (karena penulisan q_tables tidak terikat satu user).

`ensureAllStatesInitialized` memastikan ke-54 state ada di Q-Table dengan nilai awal `{1:0, 2:0, 3:0}`.

### 6.5 Skill update
Skill siswa (`student_skills.skill_level`, 0–1, default 0.5) diperbarui tiap attempt di `submit/route.ts`:
- Bila solved: `+ (0.04 + partial_score × 0.02)`
- Bila gagal: `+ (partial_score − 0.5) × 0.04`
- Di-clamp ke [0, 1].

### 6.6 Cold-start
Akun baru (0 attempt total) **melewati RL** dan langsung diberi soal **difficulty 2** (mudah tapi bukan termudah), supaya pengalaman awal stabil. Setelah ada attempt, alur RL normal berlaku.

### 6.7 Observability / Penelitian
Setiap keputusan & update RL dicatat detail di tabel `rl_events` (state sebelum/sesudah, action, eksplorasi/tidak, reward, q_value sebelum/sesudah, td_error, epsilon). Inilah sumber data untuk `rl-dashboard` dan analisis penelitian. Ada pula `/api/rl/simulate` + halaman simulasi untuk menguji kebijakan tanpa siswa nyata.

---

## 7. Mode Multiplayer (Arena)

Kuis real-time **10 soal pilihan ganda** (campuran Dekomposisi + Boolean), bergaya Kahoot. Berbasis **Supabase Realtime** (tabel di-`REPLICA IDENTITY FULL` dan ditambahkan ke `supabase_realtime` publication).

**Alur:**
1. Host `create` room → dapat **kode unik** (8 char), status `waiting`.
2. Pemain `join` via kode (maks `max_players`, default 10).
3. Host `start` → status `playing`, generate 10 soal (`generateQuestionsFromPuzzles` di `question-generator.ts`: ambil ~5 soal dekomposisi + ~5 boolean, di-*interleave*, lalu pilih 10).
4. Soal ditampilkan satu per satu; `current_question_index` & `question_shown_at` dikontrol host; timer 15–60 detik (default 20).
5. Pemain `answer` → skor dihitung berbasis kecepatan: **benar = `round(1000 − 500 × ratio)`** (1000 poin instan → 500 poin saat mepet timer); jawaban telat/salah = 0. Satu jawaban per soal (unik per `question_id` + `player_id`).
6. Setelah 10 soal → status `finished`, tampil podium (`FinalPodium`).

**Generasi soal MCQ** (`question-generator.ts`):
- Dekomposisi: *"Langkah X termasuk ke tahap apa?"* + distraktor (kategori lain + dummy).
- Boolean: *"Jika P = TRUE, Q = FALSE, apa hasil dari (ekspresi)?"* opsi TRUE/FALSE + distraktor (`"Tidak Dapat Ditentukan"`, `"Bergantung Ekspresi Lain"`).

---

## 8. Autentikasi & Peran

Dua jalur login (Supabase Auth, akun email/password di belakang layar):

1. **Siswa** — login via **NISN + Nama Lengkap** (`/api/auth/student-login`). Server:
   - Cari profil dengan `nisn` (case-insensitive) & `role = 'siswa'`.
   - Cocokkan `display_name` (dinormalisasi) dengan nama yang diinput.
   - Bangun email deterministik `{nisn}@students.codequest.local` & password deterministik `Siswa-{nisn}-{STUDENT_AUTH_SECRET}`, lalu `signInWithPassword`.
   - Akun siswa **disediakan oleh moderator** (provisioning), siswa tidak mendaftar sendiri.
2. **Moderator/Guru** — login email+password biasa; mengakses panel `(moderator)`.

`profiles` punya kolom `role` (`'siswa'` / `'moderator'`) yang membedakan akses. Trigger `handle_new_user` otomatis membuat baris `profiles` saat user `auth.users` dibuat.

---

## 9. Skema Database (Supabase / Postgres)

Migrasi berurutan di `supabase/migrations/`. RLS (Row Level Security) aktif di semua tabel.

### 9.1 `profiles` — extend `auth.users`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID PK | FK → `auth.users(id)` |
| `username` | TEXT UNIQUE | |
| `display_name` | TEXT | dicocokkan saat login siswa |
| `avatar_seed` | TEXT | seed DiceBear |
| `class_name` | TEXT | kelas siswa |
| `nisn` | TEXT | unik (case-insensitive, partial index utk non-null) |
| `role` | TEXT | `'siswa'` / `'moderator'` |
| `created_at` | TIMESTAMPTZ | |

RLS: profil hanya bisa dilihat/diupdate pemiliknya (`auth.uid() = id`).

### 9.2 `modules` — daftar modul materi
`id` (TEXT PK, mis. `M2`/`L1`), `name`, `type`, `description`, `icon_name`, `display_order`. Seed: M2 & L1. Bisa dibaca semua orang.

### 9.3 `puzzles` — bank soal
| Kolom | Tipe |
|-------|------|
| `id` | TEXT PK (mis. `M2-D1-001`, `L1-T3-001`) |
| `module_id` | TEXT FK → modules |
| `type` | TEXT (`decomposition_sort`, `truth_table`, ...) |
| `difficulty` | INT 1–5 (CHECK) |
| `variation_type` | TEXT |
| `title`, `context`, `goal` | TEXT |
| `content` | **JSONB** (struktur soal, lihat §5) |
| `expected_time_sec` | INT (default 60) |
| `concepts_tested` | TEXT[] |
| `created_at` | TIMESTAMPTZ |

Index: `(module_id, difficulty)`. Seed: `003` (dekomposisi), `005` (boolean dasar AND/OR/NOT), `006` (implikasi). RLS: terbaca oleh user terautentikasi.

### 9.4 `sessions` — sesi bermain per modul
`id` UUID PK, `user_id` FK, `module_id` FK, `started_at`, `ended_at`, `total_attempts`, `total_correct`. RLS per pemilik. Fungsi RPC `increment_session_correct` & `increment_session_attempts` (`004_session_helpers.sql`) memperbarui agregat.

### 9.5 `attempts` — tiap percobaan soal
| Kolom | Keterangan |
|-------|-----------|
| `id` UUID PK | |
| `session_id` FK (ON DELETE CASCADE) | |
| `user_id` FK | |
| `puzzle_id` FK | |
| `state_snapshot` JSONB | state RL saat mengerjakan |
| `action_taken` JSONB | `{difficulty, action, state_key}` |
| `reward` FLOAT | reward yang dihitung |
| `solved` BOOLEAN | |
| `user_answer` JSONB | jawaban siswa |
| `time_taken_sec` INT | |
| `hints_used` INT | |
| `attempts_count` INT | |
| `attempted_at` TIMESTAMPTZ | |

Index: `(user_id)`, `(session_id)`. RLS per pemilik.

### 9.6 `student_skills` — estimasi skill per (siswa, modul)
`user_id` + `module_id` (UNIQUE), `skill_level` FLOAT 0–1 (default 0.5, CHECK), `updated_at`. Dipakai RL sebagai input state. RLS per pemilik.

### 9.7 `q_tables` — Q-Table per modul (kebijakan RL)
| Kolom | Default |
|-------|---------|
| `module_id` TEXT UNIQUE FK | |
| `q_values` JSONB | `{}` → diisi `{ "state_key": {1:q,2:q,3:q} }` |
| `total_updates`, `total_episodes` | INT |
| `learning_rate` | 0.1 |
| `discount_factor` | 0.9 |
| `epsilon` / `epsilon_min` / `epsilon_decay` | 1.0 / 0.1 / 0.995 |

Seed: baris untuk M2 & L1. RLS: **SELECT** untuk semua user terautentikasi (transparansi dashboard); **penulisan** lewat admin client (service-role).

### 9.8 `rl_events` — log keputusan & update RL (penelitian)
Menyimpan: `user_id`, `module_id`, `attempt_id`, `state_before`/`state_key_before`, `action_taken`, `was_exploration`, `state_after`/`state_key_after`, `reward`, `q_value_before`, `q_value_after`, `td_error`, `epsilon_at_decision`, `created_at`. Index: user, module, attempt. RLS: user lihat event sendiri.

### 9.9 Tabel Multiplayer (`008_multiplayer.sql`)
- **`multiplayer_rooms`** — `code` (UNIQUE), `host_id`, `host_name`, `status` (`waiting`/`playing`/`finished`), `difficulty` (`easy`/`medium`/`hard`/`random`), `timer_seconds` (15–60), `current_question_index`, `question_shown_at`, `max_players`, timestamps.
- **`room_players`** — `room_id`, `user_id` (UNIQUE bersama room), `display_name`, `avatar_seed`, `score`, `is_host`, `joined_at`.
- **`room_questions`** — `room_id`, `question_order` (UNIQUE bersama room), `puzzle_id`, `puzzle_type`, `question_text`, `options` JSONB, `correct_option_id`.
- **`room_answers`** — `room_id`, `question_id`, `player_id`, `selected_option_id`, `is_correct`, `points_earned`, `response_time_ms`, `answered_at`; UNIQUE `(question_id, player_id)` (anti jawab ganda).

RLS: SELECT untuk user terautentikasi; INSERT/UPDATE/DELETE dibatasi host/pemilik. Ketiga tabel (rooms, players, answers) `REPLICA IDENTITY FULL` & masuk publication realtime.

### 9.10 Diagram Relasi (ringkas)
```
auth.users ─1:1─ profiles
modules ─1:N─ puzzles
modules ─1:N─ sessions ─1:N─ attempts ─0:1─ rl_events
modules ─1:1─ q_tables
(user,module) ─1:1─ student_skills
multiplayer_rooms ─1:N─ room_players
multiplayer_rooms ─1:N─ room_questions ─1:N─ room_answers
room_players ─1:N─ room_answers
```

---

## 10. Alur End-to-End (Single Player)

```
1. Siswa login (NISN+Nama) → middleware verifikasi sesi → /world-map
2. Pilih modul (mis. L1) → /play/L1
3. Client POST /api/puzzle/next { module_id, exclude_ids }
     → cold-start? difficulty 2 : buildStudentState → agent.selectAction (ε-greedy)
     → kembalikan puzzle (sesuai rentang difficulty dari action) + rl_decision + state
4. Siswa mengerjakan (drag tugas / isi B-S) → submit
5. Client POST /api/puzzle/submit { session_id, puzzle_id, user_answer, time, hints, rl_context }
     → validateAnswer (partial_score, solved)
     → catat attempt + update agregat session
     → update skill → hitung reward → agent.update + decayEpsilon → simpan q_tables
     → catat rl_events
     → kembalikan result + rl_update (reward, td_error, q sebelum/sesudah)
6. Tampilkan hasil/feedback → ulang ke langkah 3 untuk soal berikutnya
```

---

## 11. Catatan & Konvensi Penting

- **Next.js 16 berbeda** dari versi yang umum diketahui — wajib cek `node_modules/next/dist/docs/` sebelum menulis kode baru (lihat `AGENTS.md`).
- **Istilah Boolean memakai B/S** (Benar/Salah), bukan 0/1, sesuai arahan dosen. UI tabel kebenaran sudah mengikuti; teks penjelasan & soal multiplayer masih `TRUE/FALSE` (kandidat penyeragaman).
- **Belum ada alur cerita/narasi** — game baru memberi tema lokasi pada world map. Ini revisi yang sedang dipertimbangkan (menambah framing cerita agar pengalaman bermain lebih terasa).
- Penulisan ke `q_tables` & `rl_events` memakai **admin client** (service-role) karena bukan operasi atas nama satu user; sisanya menghormati RLS per user.
- Satu Q-Table per modul = **kebijakan global** yang belajar dari seluruh siswa (bukan per-siswa). State-lah yang mempersonalisasi keputusan untuk tiap siswa.

---

*Dokumen ini dibuat sebagai ringkasan arsitektur untuk keperluan diskusi. Untuk detail implementasi, rujuk file sumber yang disebutkan di tiap bagian.*
