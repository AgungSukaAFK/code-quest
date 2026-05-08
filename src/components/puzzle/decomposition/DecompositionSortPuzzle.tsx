"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Lightbulb, Send } from "lucide-react";
import type {
  DecompositionSortContent,
  PuzzleBase,
  Task,
} from "@/types/puzzle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DroppableCategory } from "./DroppableCategory";

interface DecompositionSortPuzzleProps {
  puzzle: PuzzleBase;
  onSubmit: (answer: {
    mapping: Record<string, string>;
    hints_used: number;
  }) => void;
  isSubmitting?: boolean;
}

const POOL_ID = "__pool__";

export function DecompositionSortPuzzle({
  puzzle,
  onSubmit,
  isSubmitting,
}: DecompositionSortPuzzleProps) {
  const content = puzzle.content as DecompositionSortContent;

  const [taskLocations, setTaskLocations] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      content.tasks.forEach((task) => {
        initial[task.id] = POOL_ID;
      });
      return initial;
    },
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [hintCount, setHintCount] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const droppedOnCategory =
      overId === POOL_ID ||
      content.categories.some((category) => category.id === overId);

    const destination = droppedOnCategory
      ? overId
      : (taskLocations[overId] ?? POOL_ID);

    setTaskLocations((prev) => ({
      ...prev,
      [taskId]: destination,
    }));
  };

  const getTasksAt = (locationId: string): Task[] =>
    content.tasks.filter((task) => taskLocations[task.id] === locationId);

  const allTasksPlaced = Object.values(taskLocations).every(
    (location) => location !== POOL_ID,
  );

  const handleSubmit = () => {
    const mapping: Record<string, string> = {};

    for (const [taskId, location] of Object.entries(taskLocations)) {
      if (location !== POOL_ID) mapping[taskId] = location;
    }

    onSubmit({ mapping, hints_used: hintCount });
  };

  const handleHint = () => {
    setHintCount((count) => count + 1);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <Card className="p-4 sm:p-6">
          <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            {puzzle.context}
          </div>
          <h2 className="mb-2 text-xl font-bold sm:text-2xl">{puzzle.title}</h2>
          <p className="text-sm text-muted-foreground">{puzzle.goal}</p>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <span>Task yang Tersedia</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {getTasksAt(POOL_ID).length} sisa
            </span>
          </div>
          <DroppableCategory
            category={{ id: POOL_ID, label: "Pool Task", color: "blue" }}
            tasks={getTasksAt(POOL_ID)}
            isDisabled={isSubmitting}
          />
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {content.categories.map((category) => (
            <DroppableCategory
              key={category.id}
              category={category}
              tasks={getTasksAt(category.id)}
              isDisabled={isSubmitting}
            />
          ))}
        </div>

        <Card className="sticky bottom-4 p-4 shadow-xl">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleHint}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Hint ({hintCount})
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!allTasksPlaced || isSubmitting}
              className="flex-1"
              size="lg"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Memeriksa..." : "Submit Jawaban"}
            </Button>
          </div>
          {!allTasksPlaced && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Tempatkan semua task ke kategori dulu untuk submit
            </p>
          )}
        </Card>
      </div>

      <DragOverlay>
        {activeTask && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            className="rounded-lg border-2 border-primary bg-card p-3 shadow-2xl"
          >
            <span className="text-sm font-medium">{activeTask.label}</span>
          </motion.div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
