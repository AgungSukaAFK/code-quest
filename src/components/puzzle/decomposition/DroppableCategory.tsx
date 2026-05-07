"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Category, Task } from "@/types/puzzle";
import { cn } from "@/lib/utils";
import { DraggableTask } from "./DraggableTask";

interface DroppableCategoryProps {
  category: Category;
  tasks: Task[];
  isDisabled?: boolean;
}

const colorClasses: Record<string, string> = {
  blue: "border-blue-500/50 bg-blue-500/10",
  orange: "border-orange-500/50 bg-orange-500/10",
  green: "border-green-500/50 bg-green-500/10",
  purple: "border-purple-500/50 bg-purple-500/10",
};

export function DroppableCategory({
  category,
  tasks,
  isDisabled,
}: DroppableCategoryProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: category.id,
    disabled: isDisabled,
  });

  const colorClass = colorClasses[category.color || "blue"] || colorClasses.blue;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[150px] flex-col gap-2 rounded-xl border-2 border-dashed p-4",
        "transition-all",
        colorClass,
        isOver && "scale-[1.02] ring-4 ring-primary/30",
      )}
    >
      <div className="text-sm font-bold uppercase tracking-wide opacity-80">
        {category.label}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {tasks.length === 0 && (
          <div className="py-4 text-center text-xs italic text-muted-foreground">
            Drop task di sini
          </div>
        )}
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} isDisabled={isDisabled} />
        ))}
      </div>
    </div>
  );
}
