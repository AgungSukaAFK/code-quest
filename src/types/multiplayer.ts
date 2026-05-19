export type RoomStatus = "waiting" | "playing" | "finished";
export type Difficulty = "easy" | "medium" | "hard" | "random";

export interface MultiplayerRoom {
  id: string;
  code: string;
  host_id: string;
  host_name: string;
  status: RoomStatus;
  difficulty: Difficulty;
  timer_seconds: number;
  current_question_index: number;
  question_shown_at: string | null;
  max_players: number;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  avatar_seed: string | null;
  score: number;
  is_host: boolean;
  joined_at: string;
}

export interface MCOption {
  id: string;
  text: string;
}

export interface RoomQuestion {
  id: string;
  room_id: string;
  question_order: number;
  puzzle_id: string | null;
  puzzle_type: "decomposition" | "boolean";
  question_text: string;
  options: MCOption[];
  correct_option_id: string;
}

export interface RoomAnswer {
  id: string;
  room_id: string;
  question_id: string;
  player_id: string;
  selected_option_id: string | null;
  is_correct: boolean;
  points_earned: number;
  response_time_ms: number | null;
  answered_at: string;
}
