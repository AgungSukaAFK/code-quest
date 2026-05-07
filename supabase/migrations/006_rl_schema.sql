CREATE TABLE IF NOT EXISTS public.student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES public.modules(id),
  skill_level FLOAT NOT NULL DEFAULT 0.5 CHECK (skill_level >= 0 AND skill_level <= 1),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.q_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT REFERENCES public.modules(id) NOT NULL UNIQUE,
  q_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_updates INT DEFAULT 0,
  total_episodes INT DEFAULT 0,
  learning_rate FLOAT DEFAULT 0.1,
  discount_factor FLOAT DEFAULT 0.9,
  epsilon FLOAT DEFAULT 1.0,
  epsilon_min FLOAT DEFAULT 0.1,
  epsilon_decay FLOAT DEFAULT 0.995,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.q_tables (module_id, q_values)
VALUES
  ('M2', '{}'::jsonb),
  ('L1', '{}'::jsonb)
ON CONFLICT (module_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.rl_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id TEXT REFERENCES public.modules(id) NOT NULL,
  attempt_id UUID REFERENCES public.attempts(id) ON DELETE CASCADE,
  state_before JSONB NOT NULL,
  state_key_before TEXT NOT NULL,
  action_taken INT NOT NULL,
  was_exploration BOOLEAN NOT NULL,
  state_after JSONB,
  state_key_after TEXT,
  reward FLOAT,
  q_value_before FLOAT,
  q_value_after FLOAT,
  td_error FLOAT,
  epsilon_at_decision FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rl_events_user ON public.rl_events(user_id);
CREATE INDEX IF NOT EXISTS idx_rl_events_module ON public.rl_events(module_id);
CREATE INDEX IF NOT EXISTS idx_rl_events_attempt ON public.rl_events(attempt_id);

ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.q_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rl_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skills"
  ON public.student_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills"
  ON public.student_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON public.student_skills FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Q-tables viewable by authenticated"
  ON public.q_tables FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users see own RL events"
  ON public.rl_events FOR SELECT
  USING (auth.uid() = user_id);
