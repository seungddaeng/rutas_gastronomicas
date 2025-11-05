import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

export type Status = "draft" | "approved" | "rejected";

type ModState = {
  statusMap: Record<string, Status>;
  setStatus: (id: string, s: Status) => void;
};

export const useModerationStore = create<ModState>()(
  persist(
    (set) => ({
      statusMap: {},
      setStatus: (id, s) => set((st) => ({ statusMap: { ...st.statusMap, [id]: s } })),
    }),
    {
      name: "moderation-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);