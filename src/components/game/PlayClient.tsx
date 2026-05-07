"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import type {
  PuzzleBase,
  PuzzleResult,
  TruthTableAnswer,
  TruthTablePuzzle,
} from "@/types/puzzle";
import type { RLState } from "@/lib/rl/types";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DecompositionSortPuzzle } from "@/components/puzzle/decomposition/DecompositionSortPuzzle";
import { BooleanPuzzle } from "@/components/puzzle/boolean/BooleanPuzzle";
import { PuzzleResultModal } from "@/components/puzzle/PuzzleResultModal";

interface PlayClientProps {
  module: {
    id: string;
    name: string;
    description: string | null;
  };
  sessionId: string;
}

export function PlayClient({ module, sessionId }: PlayClientProps) {
  const router = useRouter();

  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleBase | null>(null);
  const [completedPuzzleIds, setCompletedPuzzleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PuzzleResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [puzzleRenderKey, setPuzzleRenderKey] = useState(0);
  const [rlContext, setRlContext] = useState<{
    action: number;
    was_exploration: boolean;
    epsilon_at_decision: number;
    state: RLState;
    state_key: string;
  } | null>(null);
  const puzzleStartTime = useRef<number>(Date.now());

  const progressLabel = useMemo(
    () => `Puzzle selesai: ${completedPuzzleIds.length}`,
    [completedPuzzleIds.length],
  );

  useEffect(() => {
    loadNextPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNextPuzzle = async () => {
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
    } finally {
      setLoading(false);
    }
  };

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

      const data = await response.json();
      setResult(data.result as PuzzleResult);
      setShowResult(true);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (currentPuzzle) {
      setCompletedPuzzleIds((prev) => [...prev, currentPuzzle.id]);
    }

    setShowResult(false);
    setResult(null);

    loadNextPuzzle();
  };

  const handleRetry = () => {
    setShowResult(false);
    setResult(null);
    puzzleStartTime.current = Date.now();
    setPuzzleRenderKey((key) => key + 1);
  };

  if (loading) {
    return (
      <main className="container mx-auto min-h-[400px] max-w-4xl px-4 py-8">
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  if (!currentPuzzle) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-8">
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
    <main className="container mx-auto max-w-4xl px-4 py-6 pb-24">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Link
          href="/world-map"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Peta
        </Link>
        <span className="text-xs text-muted-foreground sm:text-sm">
          {progressLabel}
        </span>
      </div>

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
          onSubmit={(answer, timeSpent, hintsUsed) =>
            handleSubmit(answer, timeSpent, hintsUsed)
          }
        />
      )}

      <PuzzleResultModal
        open={showResult}
        result={result}
        onContinue={handleContinue}
        onRetry={handleRetry}
      />
    </main>
  );
}
