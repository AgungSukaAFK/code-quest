"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, BrainCircuit, Loader2, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { DecompositionSortPuzzle } from "@/components/puzzle/decomposition/DecompositionSortPuzzle";
import { BooleanPuzzle } from "@/components/puzzle/boolean/BooleanPuzzle";
import { PuzzleResultModal } from "@/components/puzzle/PuzzleResultModal";
import { InstructionModal } from "@/components/puzzle/InstructionModal";
import { RLInsightPanel } from "@/components/rl/RLInsightPanel";
import { sounds } from "@/lib/sounds";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  PuzzleBase,
  PuzzleResult,
  TruthTableAnswer,
  TruthTablePuzzle,
} from "@/types/puzzle";
import type { RLState } from "@/lib/rl/types";
import { DialogBoxLayer } from "@/components/narrative/DialogBox";
import {
  NARRATIVE_SCRIPT,
  modulePrefix,
  type DialogScene,
} from "@/lib/narrative/script";
import { markSceneSeen } from "@/lib/narrative/seen";

interface RLUpdateInfo {
  reward: number;
  q_value_before: number;
  q_value_after: number;
  td_error: number;
  state_key_before: string;
  state_key_after: string;
}

const SOAL_PER_MODULE = 3;

interface PlayClientProps {
  module: {
    id: string;
    name: string;
    description: string | null;
  };
  sessionId: string;
  userId: string;
  avatarSeed: string | null;
  username: string | null;
  role: string | null;
  initialUniqueCount?: number;
  hasSeenModuleOpen?: boolean;
}

export function PlayClient({ module, sessionId, userId, avatarSeed, username, role, hasSeenModuleOpen = false }: PlayClientProps) {
  const isModerator = role === "moderator";
  const router = useRouter();

  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleBase | null>(null);
  const [completedPuzzleIds, setCompletedPuzzleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PuzzleResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [puzzleRenderKey, setPuzzleRenderKey] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("cq_sound_muted") === "1";
  });

  // Sync initial muted state to sounds module
  useEffect(() => {
    sounds.muted = muted;
  }, []);

  const [showRLInsight, setShowRLInsight] = useState(() => {
    if (!isModerator || typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    const demoEnabled = params.get("demo");
    return demoEnabled === "1" || demoEnabled === "true";
  });
  const [rlContext, setRlContext] = useState<{
    action: number;
    was_exploration: boolean;
    epsilon_at_decision: number;
    state: RLState;
    state_key: string;
  } | null>(null);
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<RLUpdateInfo | null>(null);
  const puzzleStartTime = useRef<number>(0);

  const currentSoalNumber = Math.min(
    SOAL_PER_MODULE,
    completedPuzzleIds.length + 1,
  );
  const progressLabel = `Soal ${currentSoalNumber}/${SOAL_PER_MODULE}`;

  // ── Cutscene / narasi ──────────────────────────────────────
  const prefix = modulePrefix(module.id);
  const [activeScene, setActiveScene] = useState<DialogScene | null>(null);
  const afterSceneRef = useRef<(() => void) | null>(null);

  function playScene(sceneId: string, after?: () => void) {
    const scene = NARRATIVE_SCRIPT[sceneId];
    if (!scene) {
      after?.();
      return;
    }
    afterSceneRef.current = after ?? null;
    setActiveScene(scene);
  }

  function handleSceneComplete() {
    const scene = activeScene;
    setActiveScene(null);
    if (scene?.persistColumn) {
      void markSceneSeen(userId, scene.persistColumn);
    }
    const after = afterSceneRef.current;
    afterSceneRef.current = null;
    after?.();
  }

  useEffect(() => {
    loadNextPuzzle();
    if (prefix && !hasSeenModuleOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      playScene(`${prefix}_module_open`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Jangan munculkan petunjuk saat cutscene sedang tampil — biar tidak menumpuk.
    if (!currentPuzzle || activeScene) return;
    const key = `cq_instructions_seen_${currentPuzzle.type}`;
    if (!localStorage.getItem(key)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowInstructions(true);
    }
  }, [currentPuzzle?.type, activeScene]);

  useEffect(() => {
    if (!isModerator) return;
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setShowRLInsight((current) => !current);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [isModerator]);

  async function loadNextPuzzle() {
    setLoading(true);

    try {
      const response = await fetch("/api/puzzle/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: module.id,
          session_id: sessionId,
          exclude_ids: completedPuzzleIds,
        }),
      });

      if (response.status === 404) {
        router.push(`/world-map?completed=${module.id}`);
        return;
      }

      if (!response.ok) {
        throw new Error("Gagal memuat puzzle berikutnya.");
      }

      const data = await response.json();
      setCurrentPuzzle(data.puzzle);
      setRlContext(
        data.rl_decision && data.state && data.state_key
          ? {
              action: data.rl_decision.action,
              was_exploration: data.rl_decision.was_exploration,
              epsilon_at_decision: data.rl_decision.epsilon_at_decision,
              state: data.state,
              state_key: data.state_key,
            }
          : null,
      );
      puzzleStartTime.current = Date.now();
      setPuzzleRenderKey((key) => key + 1);
    } catch (error) {
      console.error("Load puzzle error:", error);
      toast.error("Gagal memuat puzzle berikutnya. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (
    answer: { mapping: Record<string, string> } | TruthTableAnswer,
    overrideTimeSpent?: number,
    overrideHintsUsed?: number,
  ) => {
    if (!currentPuzzle) return;

    setSubmitting(true);
    const timeTaken =
      overrideTimeSpent ??
      Math.round((Date.now() - puzzleStartTime.current) / 1000);

    try {
      const response = await fetch("/api/puzzle/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          puzzle_id: currentPuzzle.id,
          user_answer: answer,
          time_taken_sec: timeTaken,
          hints_used: overrideHintsUsed ?? 0,
          gave_up: false,
          rl_context: rlContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengirim jawaban.");
      }

      const data = (await response.json()) as {
        result: PuzzleResult;
        rl_update?: RLUpdateInfo;
      };

      setResult(data.result);
      setLastReward(data.rl_update?.reward ?? null);
      setLastUpdate(data.rl_update ?? null);
      toast.success(
        data.result.solved
          ? "Puzzle berhasil diselesaikan."
          : "Jawaban terkirim.",
      );
      setShowResult(true);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Gagal mengirim jawaban. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    const newCompleted = currentPuzzle
      ? [...completedPuzzleIds, currentPuzzle.id]
      : completedPuzzleIds;

    setCompletedPuzzleIds(newCompleted);
    setShowResult(false);
    setResult(null);

    // Sudah 3 soal → tutup modul (cutscene), lalu kembali ke peta.
    if (newCompleted.length >= SOAL_PER_MODULE) {
      const goToMap = () =>
        router.push(`/world-map?completed=${module.id}`);
      if (prefix) {
        playScene(`${prefix}_module_close`, goToMap);
      } else {
        goToMap();
      }
      return;
    }

    // Transisi singkat sebelum soal ke-2 / ke-3.
    const upcomingSoal = newCompleted.length + 1;
    if (prefix) {
      playScene(`${prefix}_soal${upcomingSoal}`);
    }
    loadNextPuzzle();
  };

  const handleRetry = () => {
    setShowResult(false);
    setResult(null);
    puzzleStartTime.current = Date.now();
    setPuzzleRenderKey((key) => key + 1);
  };

  const toggleMute = () => {
    const next = !muted;
    sounds.muted = next;
    setMuted(next);
    localStorage.setItem("cq_sound_muted", next ? "1" : "0");
  };

  const handleCloseInstructions = () => {
    if (currentPuzzle) {
      localStorage.setItem(`cq_instructions_seen_${currentPuzzle.type}`, "1");
    }
    setShowInstructions(false);
  };

  if (loading) {
    return (
      <main className="container mx-auto min-h-100 max-w-7xl px-4 py-8">
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  if (!currentPuzzle) {
    return (
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">Selesai!</h2>
          <p className="mb-4 text-muted-foreground">
            Kamu sudah menyelesaikan semua puzzle di modul ini
          </p>
          <Link
            href="/world-map"
            className={cn(
              buttonVariants({ variant: "default" }),
              "justify-center",
            )}
          >
            Kembali ke Peta
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-7xl px-4 py-6 pb-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/world-map"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Peta
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground sm:text-sm">
            {progressLabel}
          </span>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Aktifkan suara" : "Matikan suara"}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          {currentPuzzle && (
            <button
              type="button"
              onClick={() => setShowInstructions(true)}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Petunjuk
            </button>
          )}
          {isModerator && (
            <button
              type="button"
              onClick={() => setShowRLInsight((current) => !current)}
              className={cn(
                buttonVariants({
                  variant: showRLInsight ? "default" : "outline",
                  size: "sm",
                }),
              )}
            >
              <BrainCircuit className="mr-2 h-4 w-4" />
              {showRLInsight ? "Sembunyikan RL" : "Tampilkan RL"}
            </button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4",
          showRLInsight
            ? "lg:grid-cols-[minmax(0,1fr)_320px]"
            : "mx-auto w-full max-w-2xl",
        )}
      >
        <div className="space-y-4">
          {currentPuzzle.type === "decomposition_sort" && (
            <DecompositionSortPuzzle
              key={puzzleRenderKey}
              puzzle={currentPuzzle}
              onSubmit={(answer) =>
                handleSubmit(
                  { mapping: answer.mapping },
                  undefined,
                  answer.hints_used,
                )
              }
              isSubmitting={submitting}
            />
          )}

          {currentPuzzle.type === "truth_table" && (
            <BooleanPuzzle
              key={puzzleRenderKey}
              puzzle={currentPuzzle as TruthTablePuzzle}
              isSubmitting={submitting}
              onSubmit={(answer, timeSpent, hintsUsed) =>
                handleSubmit(answer, timeSpent, hintsUsed)
              }
            />
          )}
        </div>

        {showRLInsight && (
          <div className="lg:sticky lg:top-4 lg:self-start">
            <RLInsightPanel
              state={rlContext?.state ?? null}
              decision={
                rlContext
                  ? {
                      action: rlContext.action,
                      was_exploration: rlContext.was_exploration,
                      q_value_before: lastUpdate?.q_value_before ?? 0,
                      epsilon_at_decision: rlContext.epsilon_at_decision,
                      chosen_difficulty: currentPuzzle.difficulty,
                    }
                  : null
              }
              stateKey={rlContext?.state_key ?? null}
              lastReward={lastReward}
              lastUpdate={lastUpdate}
            />
          </div>
        )}
      </div>

      <PuzzleResultModal
        open={showResult}
        result={result}
        onContinue={handleContinue}
        onRetry={handleRetry}
        avatarSeed={avatarSeed}
        username={username}
      />

      {currentPuzzle && (
        <InstructionModal
          open={showInstructions}
          onClose={handleCloseInstructions}
          puzzleType={
            currentPuzzle.type as "decomposition_sort" | "truth_table"
          }
        />
      )}

      <DialogBoxLayer scene={activeScene} onComplete={handleSceneComplete} />
    </main>
  );
}
