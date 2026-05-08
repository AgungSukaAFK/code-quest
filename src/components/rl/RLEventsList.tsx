"use client";

import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RLEvent {
  id: string;
  state_key_before: string;
  action_taken: number;
  was_exploration: boolean;
  reward: number | null;
  td_error: number | null;
  q_value_before: number | null;
  q_value_after: number | null;
  created_at: string;
}

interface RLEventsListProps {
  events: RLEvent[];
}

export function RLEventsList({ events }: RLEventsListProps) {
  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm italic text-muted-foreground">
        Belum ada event RL. Jalankan beberapa puzzle atau simulation untuk
        melihat update agent.
      </p>
    );
  }

  return (
    <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
      {events.map((event) => {
        const reward = event.reward ?? 0;
        const tdError = event.td_error ?? 0;
        const qBefore = event.q_value_before ?? 0;
        const qAfter = event.q_value_after ?? 0;
        const qDelta = qAfter - qBefore;

        return (
          <div
            key={event.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs transition-colors hover:bg-muted/40"
          >
            <span className="font-mono text-[10px] text-muted-foreground">
              {new Date(event.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            <code className="max-w-[180px] truncate text-[10px] text-muted-foreground">
              {event.state_key_before}
            </code>

            <ArrowRight className="h-3 w-3 text-muted-foreground" />

            <Badge variant="outline" className="text-[10px]">
              A{event.action_taken}
            </Badge>

            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                event.was_exploration
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200"
                  : "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-200",
              )}
            >
              {event.was_exploration ? "Explore" : "Exploit"}
            </Badge>

            <div className="flex-1" />

            <span
              className={cn(
                "font-mono font-semibold",
                reward >= 0 ? "text-emerald-500" : "text-red-500",
              )}
            >
              r={reward.toFixed(2)}
            </span>
            <span
              className={cn(
                "font-mono",
                qDelta >= 0 ? "text-emerald-500" : "text-red-500",
              )}
            >
              ΔQ={qDelta >= 0 ? "+" : ""}
              {qDelta.toFixed(3)}
            </span>
            <span className="font-mono text-muted-foreground">
              δ={tdError.toFixed(3)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
