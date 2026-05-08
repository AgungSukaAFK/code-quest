"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { QTableHeatmap } from "@/components/rl/QTableHeatmap";
import { cn } from "@/lib/utils";

interface ModuleRow {
  id: string;
  name: string;
  description: string | null;
}

interface SimulationStep {
  step: number;
  state_key: string;
  action: number;
  difficulty: number;
  reward: number;
  solved: boolean;
  q_before: number;
  q_after: number;
  epsilon: number;
  skill_after: number;
}

interface SimulationResult {
  profile: string;
  total_steps: number;
  final_skill: number;
  final_epsilon: number;
  final_q_table: Record<string, Record<number, number>>;
  steps: SimulationStep[];
  summary: {
    total_solved: number;
    avg_reward: number;
    action_distribution: Record<1 | 2 | 3, number>;
  };
}

interface RLSimulationClientProps {
  modules: ModuleRow[];
  defaultModuleId: string;
}

export function RLSimulationClient({
  modules,
  defaultModuleId,
}: RLSimulationClientProps) {
  const [moduleId, setModuleId] = useState(defaultModuleId);
  const [profile, setProfile] = useState<"pemula" | "reguler" | "mahir">(
    "pemula",
  );
  const [numAttempts, setNumAttempts] = useState(60);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const moduleOptions = useMemo(() => modules, [modules]);

  const runSimulation = async (reset: boolean) => {
    setRunning(true);
    try {
      const response = await fetch("/api/rl/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: moduleId,
          profile,
          num_attempts: numAttempts,
          reset_q_table: reset,
        }),
      });

      if (!response.ok) {
        throw new Error("Simulation request failed");
      }

      const data = (await response.json()) as SimulationResult;
      setResult(data);
      toast.success(
        reset
          ? "Q-Table direset dan simulation selesai."
          : "Simulation selesai.",
      );
    } catch {
      toast.error("Simulation gagal dijalankan. Coba lagi.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RL Simulation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fast-forward Q-learning untuk demo konvergensi dan adaptasi
            difficulty.
          </p>
        </div>
        <Link
          href="/rl-dashboard"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Kembali ke Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Konfigurasi Simulasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Module">
              <select
                value={moduleId}
                onChange={(event) => setModuleId(event.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {moduleOptions.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Profile Siswa">
              <select
                value={profile}
                onChange={(event) =>
                  setProfile(event.target.value as typeof profile)
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="pemula">Pemula</option>
                <option value="reguler">Reguler</option>
                <option value="mahir">Mahir</option>
              </select>
            </Field>

            <Field label="Jumlah Attempts">
              <input
                type="number"
                min={10}
                max={100}
                value={numAttempts}
                onChange={(event) => setNumAttempts(Number(event.target.value))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runSimulation(false)}
              disabled={running}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              {running ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run Simulation
            </button>
            <button
              type="button"
              onClick={() => runSimulation(true)}
              disabled={running}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset & Run
            </button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                Summary
                <Badge variant="outline">{result.profile}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <Stat
                  label="Solved"
                  value={`${result.summary.total_solved}/${result.total_steps}`}
                />
                <Stat
                  label="Avg Reward"
                  value={result.summary.avg_reward.toFixed(3)}
                />
                <Stat
                  label="Final Skill"
                  value={result.final_skill.toFixed(3)}
                />
                <Stat
                  label="Final Epsilon"
                  value={result.final_epsilon.toFixed(3)}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <Badge variant="outline">
                  Easy: {result.summary.action_distribution[1]}
                </Badge>
                <Badge variant="outline">
                  Medium: {result.summary.action_distribution[2]}
                </Badge>
                <Badge variant="outline">
                  Hard: {result.summary.action_distribution[3]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Final Q-Table</CardTitle>
            </CardHeader>
            <CardContent>
              <QTableHeatmap qValues={result.final_q_table} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Last 20 Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-1 py-2">#</th>
                      <th className="px-1 py-2">State</th>
                      <th className="px-1 py-2 text-center">Action</th>
                      <th className="px-1 py-2 text-center">Solved</th>
                      <th className="px-1 py-2 text-center">Reward</th>
                      <th className="px-1 py-2 text-center">ε</th>
                      <th className="px-1 py-2 text-center">Skill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.steps.slice(-20).map((step) => (
                      <tr key={step.step} className="border-b last:border-b-0">
                        <td className="px-1 py-2">{step.step}</td>
                        <td className="px-1 py-2 font-mono text-[10px]">
                          {step.state_key}
                        </td>
                        <td className="px-1 py-2 text-center">
                          A{step.action}
                        </td>
                        <td className="px-1 py-2 text-center">
                          {step.solved ? "✓" : "✗"}
                        </td>
                        <td
                          className={cn(
                            "px-1 py-2 text-center font-mono",
                            step.reward >= 0
                              ? "text-emerald-500"
                              : "text-red-500",
                          )}
                        >
                          {step.reward >= 0 ? "+" : ""}
                          {step.reward.toFixed(2)}
                        </td>
                        <td className="px-1 py-2 text-center font-mono">
                          {step.epsilon.toFixed(3)}
                        </td>
                        <td className="px-1 py-2 text-center font-mono">
                          {step.skill_after.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-bold">{value}</div>
    </div>
  );
}
