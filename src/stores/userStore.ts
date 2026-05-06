import { create } from "zustand";

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_seed: string | null;
}

interface UserStore {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}));
