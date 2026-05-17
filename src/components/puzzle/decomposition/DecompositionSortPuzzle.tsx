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
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Send, X } from "lucide-react";
import { toast } from "sonner";
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
const MAX_HINTS = 1;

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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [hintCount, setHintCount] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setSelectedTaskId(null);
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

    setTaskLocations((prev) => ({ ...prev, [taskId]: destination }));
  };

  // Tap-to-select: tap a task to pick it up, tap a category to place it
  const handleTaskTap = (taskId: string) => {
    setSelectedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  const handleCategoryTap = (categoryId: string) => {
    if (!selectedTaskId || isSubmitting) return;
    setTaskLocations((prev) => ({ ...prev, [selectedTaskId]: categoryId }));
    setSelectedTaskId(null);
  };

  const getTasksAt = (locationId: string): Task[] =>
    content.tasks.filter((task) => taskLocations[task.id] === locationId);

  const selectedTask = selectedTaskId
    ? content.tasks.find((t) => t.id === selectedTaskId)
    : null;

  const allTasksPlaced = Object.values(taskLocations).every(
    (location) => location !== POOL_ID,
  );

  const handleHint = () => {
    if (hintCount >= MAX_HINTS) return;

    const misplaced = content.tasks.filter(
      (task) => taskLocations[task.id] !== content.correct_mapping[task.id],
    );

    if (misplaced.length === 0) {
      toast.success("Semua task sudah di posisi yang benar!", {
        description: "Kamu bisa submit sekarang.",
      });
      return;
    }

    // Prioritize tasks still in pool, then shuffle among wrong-category ones
    const poolTasks = misplaced.filter((t) => taskLocations[t.id] === POOL_ID);
    const candidates = poolTasks.length > 0 ? poolTasks : misplaced;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];

    const correctCategoryId = content.correct_mapping[pick.id];
    const correctCategory = content.categories.find(
      (c) => c.id === correctCategoryId,
    );

    toast.info(`"${pick.label}"`, {
      description: `Masuk ke kategori → ${correctCategory?.label ?? correctCategoryId}`,
      duration: 5000,
    });

    setHintCount((c) => c + 1);
  };

  const handleSubmit = () => {
    const mapping: Record<string, string> = {};
    for (const [taskId, location] of Object.entries(taskLocations)) {
      if (location !== POOL_ID) mapping[taskId] = location;
    }
    onSubmit({ mapping, hints_used: hintCount });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Puzzle info */}
        <Card className="p-4 sm:p-6">
          <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            {puzzle.context}
          </div>
          <h2 className="mb-2 text-xl font-bold sm:text-2xl">{puzzle.title}</h2>
          <p className="text-sm text-muted-foreground">{puzzle.goal}</p>
        </Card>

        {/* Task pool */}
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
            selectedTaskId={selectedTaskId}
            onTaskTap={handleTaskTap}
            onTap={() => handleCategoryTap(POOL_ID)}
          />
        </Card>

        {/* Selection hint bar */}
        <AnimatePresence>
          {selectedTask && (
            <motion.div
              key="hint"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm">
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary animate-pulse" />
                <p className="min-w-0 flex-1">
                  <span className="font-semibold text-primary wrap-break-word">
                    {selectedTask.label}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    — tap kategori untuk menempatkan
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedTaskId(null)}
                  className="ml-1 shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Batalkan pilihan"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category drop zones */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {content.categories.map((category) => (
            <DroppableCategory
              key={category.id}
              category={category}
              tasks={getTasksAt(category.id)}
              isDisabled={isSubmitting}
              selectedTaskId={selectedTaskId}
              onTaskTap={handleTaskTap}
              onTap={() => handleCategoryTap(category.id)}
            />
          ))}
        </div>

        {/* Submit bar */}
        <Card className="sticky bottom-4 p-4 shadow-xl">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleHint}
              disabled={isSubmitting || hintCount >= MAX_HINTS}
              className="flex-1 sm:flex-none"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Hint
              <span className="ml-2 flex items-center gap-0.5">
                {Array.from({ length: MAX_HINTS }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full bg-current transition-opacity ${i < hintCount ? "opacity-80" : "opacity-20"}`}
                  />
                ))}
              </span>
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
