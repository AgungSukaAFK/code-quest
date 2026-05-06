-- Hari 1: Minimal schema untuk start

-- Users (extend dari auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_seed TEXT, -- untuk DiceBear
  class_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules (M2 dan L1)
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY, -- 'M2', 'L1'
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'computational_thinking' | 'logic_math'
  description TEXT,
  icon_name TEXT, -- Lucide icon name
  display_order INT
);

-- Insert seed data
INSERT INTO public.modules (id, name, type, description, icon_name, display_order)
VALUES 
  ('M2', 'Dekomposisi', 'computational_thinking', 
   'Belajar memecah masalah kompleks menjadi sub-masalah yang lebih sederhana', 
   'Network', 1),
  ('L1', 'Logika Boolean', 'logic_math', 
   'Pelajari operasi AND, OR, NOT untuk pemecahan masalah algoritmik', 
   'Binary', 2)
ON CONFLICT (id) DO NOTHING;

-- Trigger untuk auto-create profile saat user baru register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_seed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.id::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies (basic untuk MVP)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Modules are viewable by everyone" 
  ON public.modules FOR SELECT 
  USING (true);
