"use client";

import { cn } from "@/lib/utils";
import { getAllStateKeys, keyToState } from "@/lib/rl/state";

interface QTableHeatmapProps {
  qValues: Record<string, Record<number, number>>;
}

const ACTIONS = [1, 2, 3] as const;
const ACTION_LABELS = ["Easy", "Medium", "Hard"];

export function QTableHeatmap({ qValues }: QTableHeatmapProps) {
  const states = getAllStateKeys();

  const allValues = states.flatMap((state) =>
    ACTIONS.map((action) => qValues[state]?.[action] ?? 0),
  );
  const minQ = Math.min(...allValues, 0);
  const maxQ = Math.max(...allValues, 0);
  const absMax = Math.max(Math.abs(minQ), Math.abs(maxQ), 0.001);

  const getColor = (value: number) => {
    const normalized = value / absMax;

    if (normalized > 0) {
      return `rgba(34, 197, 94, ${Math.min(normalized, 1) * 0.72})`;
    }

    if (normalized < 0) {
      return `rgba(239, 68, 68, ${Math.min(Math.abs(normalized), 1) * 0.72})`;
    }

    return "rgba(148, 163, 184, 0.12)";
  };

  const formatState = (key: string) => {
    const state = keyToState(key);
    return `${abbr(state.skill_bin)}/${abbr(state.accuracy_bin)}/${abbr(state.streak_bin)}/${abbr(state.hint_bin)}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <LegendSwatch
          color="rgba(239, 68, 68, 0.72)"
          label={`Negative Q (${minQ.toFixed(2)})`}
        />
        <LegendSwatch color="rgba(148, 163, 184, 0.12)" label="Zero" />
        <LegendSwatch
          color="rgba(34, 197, 94, 0.72)"
          label={`Positive Q (${maxQ.toFixed(2)})`}
        />
      </div>

      <div className="max-h-[580px] overflow-auto rounded-lg border">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-card">
            <tr>
              <th className="sticky left-0 z-20 border-b bg-card px-3 py-2 text-left font-mono font-semibold">
                State (S/A/St/H)
              </th>
              {ACTIONS.map((action, index) => (
                <th
                  key={action}
                  className="border-b px-3 py-2 text-center font-semibold"
                >
                  Action {action}
                  <div className="text-[10px] font-normal text-muted-foreground">
                    {ACTION_LABELS[index]}
                  </div>
                </th>
              ))}
              <th className="border-b px-3 py-2 text-center font-semibold">
                Best
              </th>
            </tr>
          </thead>
          <tbody>
            {states.map((state) => {
              const stateQ = qValues[state] ?? {};
              const bestAction = ACTIONS.reduce((best, action) => {
                const candidate = stateQ[action] ?? 0;
                const current = stateQ[best] ?? 0;
                return candidate > current ? action : best;
              }, 1);

              return (
                <tr key={state} className="border-b last:border-b-0">
                  <td className="sticky left-0 z-10 border-b bg-card px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
                    {formatState(state)}
                  </td>
                  {ACTIONS.map((action) => {
                    const value = stateQ[action] ?? 0;
                    const isBest = action === bestAction && value !== 0;

                    return (
                      <td
                        key={action}
                        className={cn(
                          "border-b px-3 py-1.5 text-center font-mono text-[11px] transition-colors",
                          isBest && "ring-2 ring-inset ring-primary",
                        )}
                        style={{ backgroundColor: getColor(value) }}
                        title={`State ${state}, Action ${action}: ${value.toFixed(4)}`}
                      >
                        {value === 0 ? "0.000" : value.toFixed(3)}
                      </td>
                    );
                  })}
                  <td className="border-b px-3 py-1.5 text-center font-semibold text-primary">
                    {stateQ[bestAction] !== 0 ? bestAction : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        State key: Skill / Accuracy / Streak / Hint
      </p>
    </div>
  );
}

function abbr(value: string) {
  return value.slice(0, 1).toUpperCase();
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-4 rounded" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}
