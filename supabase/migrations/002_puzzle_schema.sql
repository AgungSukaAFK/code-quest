CREATE TABLE IF NOT EXISTS public.puzzles (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES public.modules(id),
  type TEXT NOT NULL,
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  variation_type TEXT,
  title TEXT NOT NULL,
  context TEXT,
  goal TEXT,
  content JSONB NOT NULL,
  expected_time_sec INT DEFAULT 60,
  concepts_tested TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  module_id TEXT NOT NULL REFERENCES public.modules(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  total_attempts INT DEFAULT 0,
  total_correct INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  puzzle_id TEXT NOT NULL REFERENCES public.puzzles(id),
  state_snapshot JSONB,
  action_taken JSONB,
  reward FLOAT,
  solved BOOLEAN NOT NULL DEFAULT FALSE,
  user_answer JSONB,
  time_taken_sec INT,
  hints_used INT DEFAULT 0,
  attempts_count INT DEFAULT 1,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Puzzles are viewable by authenticated users"
  ON public.puzzles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own attempts"
  ON public.attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON public.attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts"
  ON public.attempts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_session ON public.attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_puzzles_module ON public.puzzles(module_id, difficulty);
