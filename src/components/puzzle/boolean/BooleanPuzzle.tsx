"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Info, Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TruthTableCell } from "./TruthTableCell";
import type { TruthTableAnswer, TruthTablePuzzle } from "@/types/puzzle";

interface Props {
  puzzle: TruthTablePuzzle;
  onSubmit: (answer: TruthTableAnswer, timeSpent: number, hintsUsed: number) => void;
}

export function BooleanPuzzle({ puzzle, onSubmit }: Props) {
  const totalRows = puzzle.content.rows.length;
  const [outputs, setOutputs] = useState<(boolean | null)[]>(
    Array(totalRows).fill(null),
  );
  const [startTime, setStartTime] = useState(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const filledCount = outputs.filter((output) => output !== null).length;
  const allFilled = filledCount === totalRows;
  const progress = (filledCount / totalRows) * 100;

  function toggleCell(rowIndex: number) {
    setOutputs((prev) => {
      const next = [...prev];
      if (next[rowIndex] === null) next[rowIndex] = true;
      else if (next[rowIndex] === true) next[rowIndex] = false;
      else next[rowIndex] = null;
      return next;
    });
  }

  function handleHint() {
    setHintsUsed((prev) => prev + 1);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 8000);
  }

  function handleSubmit() {
    if (!allFilled) return;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    onSubmit({ outputs: outputs as boolean[] }, timeSpent, hintsUsed);
  }

  function handleReset() {
    setOutputs(Array(totalRows).fill(null));
    setHintsUsed(0);
    setStartTime(Date.now());
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-bold sm:text-2xl">{puzzle.title}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {puzzle.goal || "Lengkapi tabel kebenaran di bawah ini."}
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center sm:p-6"
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
          <span>Progress</span>
          <span>
            {filledCount} / {totalRows} baris
          </span>
        </div>
        <Progress value={progress} className="h-2" />
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

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="mx-auto border-collapse">
            <thead>
              <tr>
                {puzzle.content.variables.map((variable) => (
                  <th
                    key={variable}
                    className="border-b-2 border-border px-2 py-3 text-center font-mono text-sm font-bold sm:text-base"
                  >
                    {variable}
                  </th>
                ))}
                <th className="border-b-2 border-border bg-primary/5 px-2 py-3 text-center font-mono text-sm font-bold sm:text-base">
                  Output
                </th>
              </tr>
            </thead>
            <tbody>
              {puzzle.content.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {puzzle.content.variables.map((variable) => (
                    <td key={variable} className="p-2 text-center">
                      <TruthTableCell value={row.inputs[variable]} isInput />
                    </td>
                  ))}
                  <td className="bg-primary/5 p-2 text-center">
                    <TruthTableCell
                      value={outputs[rowIndex]}
                      onClick={() => toggleCell(rowIndex)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Klik sel output untuk toggle: <code>?</code> -&gt; <code>T</code> -&gt; <code>F</code> -&gt; <code>?</code>
        </p>
      </div>

      <div className="sticky bottom-4 flex flex-wrap gap-2 rounded-lg bg-background/80 p-2 backdrop-blur-sm">
        <Button variant="outline" size="sm" onClick={handleHint} className="gap-2">
          <Lightbulb className="h-4 w-4" />
          Hint ({hintsUsed})
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <Button size="lg" disabled={!allFilled} onClick={handleSubmit} className="ml-auto gap-2">
          <Check className="h-4 w-4" />
          {allFilled ? "Submit" : `${totalRows - filledCount} baris lagi`}
        </Button>
      </div>
    </div>
  );
}
