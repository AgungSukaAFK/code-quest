"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Task } from "@/types/puzzle";
import { cn } from "@/lib/utils";

interface DraggableTaskProps {
  task: Task;
  isDisabled?: boolean;
}

export function DraggableTask({ task, isDisabled }: DraggableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
      disabled: isDisabled,
    });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-2 rounded-lg border-2 border-border bg-card p-3",
        "cursor-grab transition-shadow active:cursor-grabbing hover:shadow-md",
        isDragging && "opacity-50 shadow-xl",
        isDisabled && "cursor-not-allowed opacity-60",
      )}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-sm font-medium">{task.label}</span>
    </div>
  );
}
