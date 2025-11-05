import { create } from "zustand";

type UserPublic = {
  uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null;
  role?: "user" | "admin";
};

type State = { user: UserPublic | null; loading: boolean; };
type Actions = {
  setUser: (u: State["user"]) => void;
  setLoading: (v: boolean) => void;
  logout: () => void;
};

export const useUserStore = create<State & Actions>((set) => ({
  user: null, loading: true,
  setUser: (u) => set({ user: u }),
  setLoading: (v) => set({ loading: v }),
  logout: () => set({ user: null }),
}));