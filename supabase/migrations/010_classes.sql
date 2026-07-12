-- Kelas (classes): sebelumnya class_name hanya teks bebas & hardcoded di UI.
-- Tabel ini menampung daftar kelas agar bisa dikelola (tambah/edit/hapus) moderator.
-- Relasi ke siswa tetap berbasis nama (profiles.class_name), rename di-cascade via API.

CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Semua user terautentikasi boleh membaca daftar kelas (dipakai dropdown, dsb).
-- Penulisan (insert/update/delete) hanya lewat service role di API moderator.
CREATE POLICY "classes_select"
  ON public.classes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Seed dari kelas yang sudah dipakai siswa saat ini.
INSERT INTO public.classes (name)
  SELECT DISTINCT class_name
  FROM public.profiles
  WHERE class_name IS NOT NULL AND TRIM(class_name) <> ''
ON CONFLICT (name) DO NOTHING;

-- Kelas default yang sebelumnya hardcoded di UI.
INSERT INTO public.classes (name)
VALUES ('X TJKT 3')
ON CONFLICT (name) DO NOTHING;
