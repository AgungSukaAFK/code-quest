"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TruthTableCellProps {
  value: boolean | null;
  onClick?: () => void;
  isInput?: boolean;
  isHighlighted?: boolean;
}

export function TruthTableCell({
  value,
  onClick,
  isInput = false,
  isHighlighted = false,
}: TruthTableCellProps) {
  const isClickable = Boolean(onClick) && !isInput;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      whileTap={isClickable ? { scale: 0.95 } : undefined}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-md border-2 font-mono text-sm font-bold transition-all sm:h-16 sm:w-16 sm:text-base",
        isInput
          ? "cursor-default border-border bg-muted"
          : "cursor-pointer hover:scale-105",
        value === null &&
          !isInput &&
          "border-dashed border-muted-foreground/40 bg-card text-muted-foreground",
        value === true &&
          (isInput
            ? "bg-blue-500/20 text-blue-700 dark:text-blue-300"
            : "border-green-500 bg-green-500/20 text-green-700 dark:text-green-300"),
        value === false &&
          (isInput
            ? "bg-slate-500/10 text-slate-700 dark:text-slate-300"
            : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300"),
        isHighlighted && "ring-2 ring-primary ring-offset-2",
      )}
    >
      {value === null ? "?" : value ? "T" : "F"}
    </motion.button>
  );
}
