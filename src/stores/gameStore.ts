import { create } from "zustand";

interface Module {
  id: string;
  name: string;
  type: string;
  description: string;
  iconName: string;
  displayOrder: number;
  isUnlocked: boolean;
  progress: number; // 0-100
}

interface GameState {
  currentModuleId: string | null;
  modules: Module[];
  totalXP: number;
  level: number;
  setCurrentModule: (moduleId: string) => void;
  setModules: (modules: Module[]) => void;
  addXP: (amount: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentModuleId: null,
  modules: [],
  totalXP: 0,
  level: 1,
  setCurrentModule: (moduleId) => set({ currentModuleId: moduleId }),
  setModules: (modules) => set({ modules }),
  addXP: (amount) =>
    set((state) => {
      const newXP = state.totalXP + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      return { totalXP: newXP, level: newLevel };
    }),
}));
