-- Narrative / cutscene tracking
-- Menandai checkpoint cerita besar (intro dunia, buka/selesai modul, intro arena)
-- supaya cutscene "sekali tampil" tidak diulang tiap kali siswa masuk.
-- Dialog per-soal (transisi) TIDAK dilacak di sini — cukup tampil per sesi main.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_seen_intro_world BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_seen_m2_open BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_completed_m2 BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_seen_l1_open BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_completed_l1 BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_seen_arena_intro BOOLEAN NOT NULL DEFAULT FALSE;
