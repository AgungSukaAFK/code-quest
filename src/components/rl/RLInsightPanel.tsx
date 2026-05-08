"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, Brain, EyeOff, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { RLState } from "@/lib/rl/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RLDecisionSnapshot {
  action: number;
  was_exploration: boolean;
  q_value_before: number;
  epsilon_at_decision: number;
  chosen_difficulty?: number;
}

interface RLUpdateSnapshot {
  reward: number;
  q_value_before: number;
  q_value_after: number;
  td_error: number;
  state_key_before: string;
  state_key_after: string;
}

interface RLInsightPanelProps {
  state: RLState | null;
  decision: RLDecisionSnapshot | null;
  stateKey: string | null;
  lastReward?: number | null;
  lastUpdate?: RLUpdateSnapshot | null;
}

export function RLInsightPanel({
  state,
  decision,
  stateKey,
  lastReward,
  lastUpdate,
}: RLInsightPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!state || !decision) {
    return null;
  }

  const actionLabels = ["", "Easy (1-2)", "Medium (3)", "Hard (4-5)"];
  const binColors: Record<string, string> = {
    low: "text-red-500 bg-red-500/10",
    medium: "text-amber-500 bg-amber-500/10",
    high: "text-emerald-500 bg-emerald-500/10",
    negative: "text-red-500 bg-red-500/10",
    neutral: "text-slate-500 bg-slate-500/10",
    positive: "text-emerald-500 bg-emerald-500/10",
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="h-4 w-4 text-primary" />
            <span>RL Insight</span>
            <Badge variant="outline" className="text-[10px]">
              DEV
            </Badge>
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand RL panel" : "Collapse RL panel"}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="rl-insight-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="space-y-4 pt-0">
              <section>
                <div className="mb-2 flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Current State
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <StateBin
                    label="Skill"
                    value={state.skill_bin}
                    colorClass={binColors[state.skill_bin]}
                  />
                  <StateBin
                    label="Accuracy"
                    value={state.accuracy_bin}
                    colorClass={binColors[state.accuracy_bin]}
                  />
                  <StateBin
                    label="Streak"
                    value={state.streak_bin}
                    colorClass={binColors[state.streak_bin]}
                  />
                  <StateBin
                    label="Hint"
                    value={state.hint_bin}
                    colorClass={
                      binColors[state.hint_bin] ??
                      "text-slate-500 bg-slate-500/10"
                    }
                  />
                </div>
                {stateKey && (
                  <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">
                    {stateKey}
                  </p>
                )}
              </section>

              <section className="border-t pt-3">
                <div className="mb-2 flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Action Selected
                  </span>
                </div>
                <div className="rounded-lg border bg-muted/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">
                        Action {decision.action}:{" "}
                        {actionLabels[decision.action]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {decision.chosen_difficulty
                          ? `Difficulty served: ${decision.chosen_difficulty}`
                          : "Difficulty served: -"}
                      </div>
                    </div>
                    {decision.was_exploration ? (
                      <Badge
                        variant="outline"
                        className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-200"
                      >
                        Explore
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-sky-500/30 bg-sky-500/10 text-[10px] text-sky-700 dark:text-sky-200"
                      >
                        Exploit
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                    <div>
                      Q-value:{" "}
                      <span className="font-mono">
                        {decision.q_value_before.toFixed(3)}
                      </span>
                    </div>
                    <div>
                      ε:{" "}
                      <span className="font-mono">
                        {decision.epsilon_at_decision.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {lastUpdate && (
                <section className="border-t pt-3">
                  <div className="mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Last Update
                    </span>
                  </div>
                  <div className="rounded-lg border bg-card p-3 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={cn(
                          "font-mono text-base font-semibold",
                          lastUpdate.reward >= 0
                            ? "text-emerald-500"
                            : "text-red-500",
                        )}
                      >
                        {lastUpdate.reward >= 0 ? "+" : ""}
                        {lastUpdate.reward.toFixed(3)}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        ΔQ{" "}
                        {lastUpdate.q_value_after >= lastUpdate.q_value_before
                          ? "+"
                          : ""}
                        {(
                          lastUpdate.q_value_after - lastUpdate.q_value_before
                        ).toFixed(3)}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-1 text-muted-foreground">
                      <div>
                        Q before:{" "}
                        <span className="font-mono">
                          {lastUpdate.q_value_before.toFixed(3)}
                        </span>
                      </div>
                      <div>
                        Q after:{" "}
                        <span className="font-mono">
                          {lastUpdate.q_value_after.toFixed(3)}
                        </span>
                      </div>
                      <div>
                        TD error:{" "}
                        <span className="font-mono">
                          {lastUpdate.td_error.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {lastReward !== null &&
                lastReward !== undefined &&
                !lastUpdate && (
                  <section className="border-t pt-3">
                    <div className="mb-2 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Last Reward
                      </span>
                    </div>
                    <div
                      className={cn(
                        "text-lg font-mono font-semibold",
                        lastReward >= 0 ? "text-emerald-500" : "text-red-500",
                      )}
                    >
                      {lastReward >= 0 ? "+" : ""}
                      {lastReward.toFixed(3)}
                    </div>
                  </section>
                )}

              <p className="border-t pt-2 text-[10px] italic text-muted-foreground">
                Panel ini aktif hanya untuk demo dan analisis.
              </p>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function StateBin({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 inline-flex rounded-md px-2 py-0.5 text-sm font-semibold uppercase",
          colorClass,
        )}
      >
        {value}
      </div>
    </div>
  );
}
