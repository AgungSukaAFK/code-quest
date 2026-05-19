"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Flame,
  Info,
  Lightbulb,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sounds } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TruthTableCell } from "./TruthTableCell";
import type { TruthTableAnswer, TruthTablePuzzle } from "@/types/puzzle";

interface Props {
  puzzle: TruthTablePuzzle;
  onSubmit: (
    answer: TruthTableAnswer,
    timeSpent: number,
    hintsUsed: number,
  ) => void;
  isSubmitting?: boolean;
}

export function BooleanPuzzle({ puzzle, onSubmit, isSubmitting }: Props) {
  const totalRows = puzzle.content.rows.length;
  const [outputs, setOutputs] = useState<(boolean | null)[]>(
    Array(totalRows).fill(null),
  );
  const [startTime, setStartTime] = useState(() => Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const filledCount = outputs.filter((output) => output !== null).length;
  const allFilled = filledCount === totalRows;
  const progress = (filledCount / totalRows) * 100;

  function setOutput(rowIndex: number, value: boolean | null) {
    sounds.toggle();
    setOutputs((prev) => {
      const next = [...prev];
      next[rowIndex] = value;
      return next;
    });
  }

  function handleHint() {
    sounds.hint();
    setHintsUsed((prev) => prev + 1);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 8000);
  }

  function handleSubmit() {
    if (!allFilled) return;
    sounds.submit();
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    onSubmit({ outputs: outputs as boolean[] }, timeSpent, hintsUsed);
  }

  function handleReset() {
    sounds.click();
    setOutputs(Array(totalRows).fill(null));
    setHintsUsed(0);
    setStartTime(Date.now());
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-2 text-xl font-bold sm:text-2xl">{puzzle.title}</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          {puzzle.goal || "Lengkapi tabel kebenaran di bawah ini."}
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-lg border-2 border-primary/30 bg-linear-to-br from-primary/10 to-primary/5 p-4 text-center sm:p-6"
        >
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Ekspresi Logika
          </p>
          <p className="font-mono text-2xl font-bold tracking-wider sm:text-4xl">
            {puzzle.content.display_expression}
          </p>
        </motion.div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Progress Misi
          </span>
          <span>
            {filledCount} / {totalRows} baris
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {allFilled
              ? "Semua baris sudah terjawab. Siap submit!"
              : `Selesaikan ${totalRows - filledCount} baris lagi.`}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] text-amber-600 dark:text-amber-300">
            <Flame className="h-3 w-3" />
            Fokus
          </span>
        </div>
      </div>

      {showHint && puzzle.content.explanation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3"
        >
          <p className="text-sm">
            <strong>Hint:</strong> {puzzle.content.explanation}
          </p>
        </motion.div>
      )}

      <div className="flex justify-center overflow-x-auto">
        <table className="border-collapse">
            <thead>
              <tr>
                {puzzle.content.variables.map((variable) => (
                  <th
                    key={variable}
                    className="border-b-2 border-border px-1.5 py-2 text-center font-mono text-sm font-bold sm:px-2 sm:py-3 sm:text-base"
                  >
                    {variable}
                  </th>
                ))}
                <th className="border-b-2 border-border bg-primary/5 px-2 py-2 text-center font-mono text-sm font-bold sm:px-3 sm:py-3 sm:text-base">
                  Output
                </th>
              </tr>
            </thead>
            <tbody>
              {puzzle.content.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    "transition-colors",
                    outputs[rowIndex] !== null && "bg-emerald-500/5",
                  )}
                >
                  {puzzle.content.variables.map((variable) => (
                    <td key={variable} className="p-1.5 text-center sm:p-2">
                      <TruthTableCell value={row.inputs[variable]} isInput />
                    </td>
                  ))}
                  <td className="bg-primary/5 p-1.5 sm:p-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-xl border-2 p-1 transition-colors duration-200",
                          outputs[rowIndex] === null
                            ? "border-dashed border-muted-foreground/30 bg-card"
                            : outputs[rowIndex] === true
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "border-rose-500/50 bg-rose-500/5",
                        )}
                      >
                        <motion.button
                          type="button"
                          onClick={() =>
                            setOutput(
                              rowIndex,
                              outputs[rowIndex] === true ? null : true,
                            )
                          }
                          whileTap={{ scale: 0.9 }}
                          aria-label="Benar"
                          className={cn(
                            "flex h-9 items-center justify-center gap-1 rounded-lg px-2.5 text-xs font-bold transition-all duration-150 sm:px-3",
                            outputs[rowIndex] === true
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400",
                          )}
                        >
                          <Check className="h-3.5 w-3.5" />
                          B
                        </motion.button>

                        <div className="h-5 w-px bg-border" />

                        <motion.button
                          type="button"
                          onClick={() =>
                            setOutput(
                              rowIndex,
                              outputs[rowIndex] === false ? null : false,
                            )
                          }
                          whileTap={{ scale: 0.9 }}
                          aria-label="Salah"
                          className={cn(
                            "flex h-9 items-center justify-center gap-1 rounded-lg px-2.5 text-xs font-bold transition-all duration-150 sm:px-3",
                            outputs[rowIndex] === false
                              ? "bg-rose-500 text-white shadow-sm"
                              : "text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400",
                          )}
                        >
                          <X className="h-3.5 w-3.5" />
                          S
                        </motion.button>
                      </div>

                      <span className="text-[9px] font-medium text-muted-foreground sm:text-[10px]">
                        {outputs[rowIndex] === null
                          ? "pilih..."
                          : outputs[rowIndex]
                            ? "Benar ✓"
                            : "Salah ✗"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Pilih <strong className="text-emerald-600 dark:text-emerald-400">B (Benar)</strong> atau{" "}
          <strong className="text-rose-600 dark:text-rose-400">S (Salah)</strong> untuk tiap baris output. Klik tombol yang sama untuk membatalkan pilihan.
        </p>
      </div>

      <div className="sticky bottom-4 flex flex-wrap gap-2 rounded-lg bg-background/80 p-2 backdrop-blur-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={handleHint}
          className="gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          Hint ({hintsUsed})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <Button
          size="lg"
          disabled={!allFilled || isSubmitting}
          onClick={handleSubmit}
          className="ml-auto gap-2"
        >
          <Check className="h-4 w-4" />
          {isSubmitting
            ? "Memproses..."
            : allFilled
              ? "Submit"
              : `${totalRows - filledCount} baris lagi`}
        </Button>
      </div>
    </div>
  );
}
