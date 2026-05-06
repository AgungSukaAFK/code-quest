import { create } from "zustand";

interface UserState {
  userId: string | null;
  username: string | null;
  displayName: string | null;
  avatarSeed: string | null;
  setUser: (user: Partial<Omit<UserState, "setUser" | "clearUser">>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  username: null,
  displayName: null,
  avatarSeed: null,
  setUser: (user) => set((state) => ({ ...state, ...user })),
  clearUser: () =>
    set({ userId: null, username: null, displayName: null, avatarSeed: null }),
}));
