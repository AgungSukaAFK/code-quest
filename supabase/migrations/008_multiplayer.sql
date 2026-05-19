-- Multiplayer mode tables

CREATE TABLE public.multiplayer_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) UNIQUE NOT NULL,
  host_id UUID NOT NULL REFERENCES auth.users(id),
  host_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  difficulty TEXT NOT NULL DEFAULT 'random' CHECK (difficulty IN ('easy', 'medium', 'hard', 'random')),
  timer_seconds INTEGER NOT NULL DEFAULT 20 CHECK (timer_seconds BETWEEN 15 AND 60),
  current_question_index INTEGER NOT NULL DEFAULT -1,
  question_shown_at TIMESTAMPTZ,
  max_players INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE TABLE public.room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  avatar_seed TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE public.room_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  puzzle_id TEXT REFERENCES public.puzzles(id),
  puzzle_type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_id TEXT NOT NULL,
  UNIQUE(room_id, question_order)
);

CREATE TABLE public.room_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.room_questions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.room_players(id) ON DELETE CASCADE,
  selected_option_id TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  points_earned INTEGER NOT NULL DEFAULT 0,
  response_time_ms INTEGER,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, player_id)
);

-- Indexes
CREATE INDEX ON public.room_players(room_id);
CREATE INDEX ON public.room_players(user_id);
CREATE INDEX ON public.room_questions(room_id, question_order);
CREATE INDEX ON public.room_answers(question_id);
CREATE INDEX ON public.room_answers(player_id);
CREATE INDEX ON public.room_answers(room_id);
CREATE INDEX ON public.multiplayer_rooms(code);

-- RLS
ALTER TABLE public.multiplayer_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_select" ON public.multiplayer_rooms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "rooms_insert" ON public.multiplayer_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "rooms_update" ON public.multiplayer_rooms FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "rooms_delete" ON public.multiplayer_rooms FOR DELETE USING (auth.uid() = host_id);

CREATE POLICY "players_select" ON public.room_players FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "players_insert" ON public.room_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "players_update" ON public.room_players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "players_delete" ON public.room_players FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "questions_select" ON public.room_questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "questions_insert" ON public.room_questions FOR INSERT WITH CHECK (
  auth.uid() = (SELECT host_id FROM public.multiplayer_rooms WHERE id = room_id)
);

CREATE POLICY "answers_select" ON public.room_answers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "answers_insert" ON public.room_answers FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.room_players WHERE id = player_id)
);

-- Replica identity full needed for realtime filters (room_id=eq.xxx etc.)
ALTER TABLE public.multiplayer_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_players REPLICA IDENTITY FULL;
ALTER TABLE public.room_answers REPLICA IDENTITY FULL;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_answers;
