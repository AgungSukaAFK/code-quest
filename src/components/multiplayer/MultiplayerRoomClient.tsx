"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { MultiplayerRoom, RoomPlayer, RoomQuestion, RoomAnswer } from "@/types/multiplayer";
import { WaitingRoom } from "@/components/multiplayer/WaitingRoom";
import { MultiplayerGame } from "@/components/multiplayer/MultiplayerGame";
import { FinalPodium } from "@/components/multiplayer/FinalPodium";
import { DialogBoxLayer } from "@/components/narrative/DialogBox";
import { NARRATIVE_SCRIPT, type DialogScene } from "@/lib/narrative/script";
import { useAudioStore } from "@/stores/audioStore";
import { BGM } from "@/lib/assets";

interface Props {
  initialRoom: MultiplayerRoom;
  initialPlayers: RoomPlayer[];
  questions: RoomQuestion[];
  currentPlayer: RoomPlayer;
  userId: string;
}

export function MultiplayerRoomClient({ initialRoom, initialPlayers, questions, currentPlayer, userId }: Props) {
  const router = useRouter();
  const [room, setRoom] = useState<MultiplayerRoom>(initialRoom);
  const [players, setPlayers] = useState<RoomPlayer[]>(initialPlayers);
  const [answers, setAnswers] = useState<RoomAnswer[]>([]);
  // allAnswers accumulates across all questions (never reset) for stats
  const [allAnswers, setAllAnswers] = useState<RoomAnswer[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "multiplayer_rooms", filter: `id=eq.${room.id}` },
        ({ new: updated }) => setRoom(updated as MultiplayerRoom),
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "multiplayer_rooms", filter: `id=eq.${room.id}` },
        () => {
          toast.error("Room telah ditutup oleh host");
          router.push("/multiplayer");
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_players", filter: `room_id=eq.${room.id}` },
        ({ new: newPlayer }) =>
          setPlayers((prev) =>
            prev.find((p) => p.id === (newPlayer as RoomPlayer).id) ? prev : [...prev, newPlayer as RoomPlayer],
          ),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "room_players", filter: `room_id=eq.${room.id}` },
        ({ new: updated }) =>
          setPlayers((prev) => prev.map((p) => (p.id === (updated as RoomPlayer).id ? (updated as RoomPlayer) : p))),
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "room_players", filter: `room_id=eq.${room.id}` },
        ({ old: deleted }) => {
          const deletedId = (deleted as { id?: string }).id;
          if (deletedId === currentPlayer.id) {
            toast.error("Kamu telah keluar dari room");
            router.push("/multiplayer");
          } else {
            setPlayers((prev) => prev.filter((p) => p.id !== deletedId));
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_answers", filter: `room_id=eq.${room.id}` },
        ({ new: newAnswer }) => {
          const a = newAnswer as RoomAnswer;
          setAnswers((prev) => prev.find((x) => x.id === a.id) ? prev : [...prev, a]);
          setAllAnswers((prev) => prev.find((x) => x.id === a.id) ? prev : [...prev, a]);
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [room.id, currentPlayer.id, router]);

  // Reset answers when question changes
  useEffect(() => {
    setAnswers([]);
  }, [room.current_question_index]);

  // Cutscene kemenangan: tampil sekali saat pertandingan selesai (per sesi).
  const [activeScene, setActiveScene] = useState<DialogScene | null>(null);
  const [victoryShown, setVictoryShown] = useState(false);
  const playStinger = useAudioStore((s) => s.playStinger);

  useEffect(() => {
    if (room.status === "finished" && !victoryShown) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setVictoryShown(true);
      setActiveScene(NARRATIVE_SCRIPT.arena_victory);
      /* eslint-enable react-hooks/set-state-in-effect */
      playStinger(BGM.victory);
    }
  }, [room.status, victoryShown, playStinger]);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const isHost = currentPlayer.is_host;
  const currentQuestion = questions[room.current_question_index] ?? null;
  const myAnswer = answers.find(
    (a) => players.find((p) => p.user_id === userId)?.id === a.player_id,
  ) ?? null;

  let content;
  if (room.status === "waiting") {
    content = (
      <WaitingRoom
        room={room}
        players={sortedPlayers}
        isHost={isHost}
        currentPlayerId={currentPlayer.id}
      />
    );
  } else if (room.status === "playing" && currentQuestion) {
    content = (
      <MultiplayerGame
        room={room}
        question={currentQuestion}
        players={sortedPlayers}
        answers={answers}
        allAnswers={allAnswers}
        myAnswer={myAnswer}
        currentPlayer={currentPlayer}
        isHost={isHost}
        totalQuestions={questions.length}
      />
    );
  } else {
    content = (
      <FinalPodium
        players={sortedPlayers}
        currentPlayerId={currentPlayer.id}
        roomCode={room.code}
        allAnswers={allAnswers}
        totalQuestions={questions.length}
      />
    );
  }

  return (
    <>
      {content}
      <DialogBoxLayer
        scene={activeScene}
        onComplete={() => setActiveScene(null)}
      />
    </>
  );
}
