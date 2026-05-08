"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QTableHeatmap } from "@/components/rl/QTableHeatmap";
import { RLEventsList } from "@/components/rl/RLEventsList";
import { Activity } from "lucide-react";

interface QTableRow {
  module_id: string;
  q_values: Record<string, Record<number, number>>;
  total_updates: number | null;
  total_episodes: number | null;
  epsilon: number | null;
  learning_rate: number | null;
}

interface ModuleRow {
  id: string;
  name: string;
  description: string | null;
}

interface RLEventRow {
  id: string;
  module_id: string;
  state_key_before: string;
  action_taken: number;
  was_exploration: boolean;
  reward: number | null;
  td_error: number | null;
  q_value_before: number | null;
  q_value_after: number | null;
  created_at: string;
}

interface QTableDashboardProps {
  qTables: QTableRow[];
  recentEvents: RLEventRow[];
  modules: ModuleRow[];
}

export function QTableDashboard({
  qTables,
  recentEvents,
  modules,
}: QTableDashboardProps) {
  const initialModule = qTables[0]?.module_id ?? modules[0]?.id ?? "";
  const [selectedModule, setSelectedModule] = useState(initialModule);

  const currentTable = useMemo(
    () =>
      qTables.find((table) => table.module_id === selectedModule) ??
      qTables[0] ??
      null,
    [qTables, selectedModule],
  );

  const moduleEvents = useMemo(
    () => recentEvents.filter((event) => event.module_id === selectedModule),
    [recentEvents, selectedModule],
  );

  if (!currentTable) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Activity className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">Belum ada data Q-Table.</p>
          <p className="mt-1 text-xs">
            Jalankan beberapa puzzle atau simulation untuk melihat heatmap.
          </p>
        </CardContent>
      </Card>
    );
  }

  const moduleLabel =
    modules.find((moduleEntry) => moduleEntry.id === currentTable.module_id)
      ?.name ?? currentTable.module_id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {qTables.map((table) => {
            const moduleEntry = modules.find(
              (entry) => entry.id === table.module_id,
            );
            const isActive = selectedModule === table.module_id;

            return (
              <button
                key={table.module_id}
                type="button"
                onClick={() => setSelectedModule(table.module_id)}
                className={cn(
                  buttonVariants({
                    variant: isActive ? "default" : "outline",
                    size: "sm",
                  }),
                )}
              >
                {moduleEntry?.name ?? table.module_id}
              </button>
            );
          })}
        </div>

        <Link
          href="/rl-dashboard/simulation"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Buka Simulation
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Module: {moduleLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat
              label="Total Updates"
              value={currentTable.total_updates ?? 0}
            />
            <Stat label="Episodes" value={currentTable.total_episodes ?? 0} />
            <Stat
              label="Epsilon"
              value={(currentTable.epsilon ?? 0).toFixed(3)}
              sub="exploration rate"
            />
            <Stat
              label="Learning Rate"
              value={(currentTable.learning_rate ?? 0).toFixed(3)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Q-Table Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <QTableHeatmap qValues={currentTable.q_values} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Recent RL Events
            <Badge variant="outline">{moduleEvents.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RLEventsList events={moduleEvents} />
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-bold">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
