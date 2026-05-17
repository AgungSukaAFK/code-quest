"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Task } from "@/types/puzzle";
import { cn } from "@/lib/utils";

interface DraggableTaskProps {
  task: Task;
  isDisabled?: boolean;
  isSelected?: boolean;
  onTap?: () => void;
}

export function DraggableTask({
  task,
  isDisabled,
  isSelected,
  onTap,
}: DraggableTaskProps) {
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
      onClick={(e) => {
        e.stopPropagation();
        if (!isDisabled) onTap?.();
      }}
      className={cn(
        "flex items-start gap-2 rounded-lg border-2 bg-card p-3",
        "cursor-grab transition-all active:cursor-grabbing",
        "touch-none select-none",
        isDragging ? "opacity-40 shadow-xl" : "hover:shadow-md",
        isSelected
          ? "border-primary shadow-md ring-2 ring-primary/30 bg-primary/5"
          : "border-border",
        isDisabled && "cursor-not-allowed opacity-60",
      )}
    >
      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 wrap-break-word text-sm font-medium leading-snug">
        {task.label}
      </span>
    </div>
  );
}
