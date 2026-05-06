import { create } from "zustand";

interface GameSession {
  sessionId: string | null;
  moduleId: string | null;
  currentPuzzleId: string | null;
  attemptsCount: number;
}

interface GameStore extends GameSession {
  startSession: (moduleId: string, sessionId: string) => void;
  setCurrentPuzzle: (puzzleId: string) => void;
  incrementAttempts: () => void;
  endSession: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  sessionId: null,
  moduleId: null,
  currentPuzzleId: null,
  attemptsCount: 0,

  startSession: (moduleId, sessionId) =>
    set({ sessionId, moduleId, currentPuzzleId: null, attemptsCount: 0 }),

  setCurrentPuzzle: (puzzleId) => set({ currentPuzzleId: puzzleId }),

  incrementAttempts: () =>
    set((state) => ({ attemptsCount: state.attemptsCount + 1 })),

  endSession: () =>
    set({ sessionId: null, moduleId: null, currentPuzzleId: null, attemptsCount: 0 }),
}));
