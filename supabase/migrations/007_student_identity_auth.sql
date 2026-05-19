-- Student identity fields for moderator-provisioned login (Option B)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nisn TEXT;

-- NISN must be unique across users (case-insensitive), while allowing NULL for non-students.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_nisn_unique_idx
  ON public.profiles (LOWER(nisn))
  WHERE nisn IS NOT NULL;
