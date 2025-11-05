import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Dish } from "../components/DishCard";
import { similarityScore } from "../utils/similarity";

type SuggestionsState = {
  loading: boolean;
  items: Dish[];
  reasonById: Record<string, { cause: string; refDishId: string } | undefined>;
  refresh: (args: { allPlatos: Dish[]; favoriteIds: string[]; limit?: number }) => void;
  clear: () => void;
};

export const useSuggestionsStore = create<SuggestionsState>()(persist(
  (set) => ({
    loading: false,
    items: [],
    reasonById: {},

    refresh: ({ allPlatos, favoriteIds, limit = 12 }) => {
      set({ loading: true });

      if (!favoriteIds?.length) {
        set({ items: [], reasonById: {}, loading: false });
        return;
      }
      const byId = new Map(allPlatos.map(p => [p.id, p]));
      const favs = favoriteIds.map(id => byId.get(id)).filter(Boolean) as Dish[];
      const candidates = allPlatos.filter(p => !favoriteIds.includes(p.id));

      type SItem = { plato: Dish; total: number; reason?: { cause: string; refDishId: string } };
      const scored: SItem[] = candidates.map((c) => {
        let total = 0;
        let r: { cause: string; refDishId: string } | undefined;
        for (const f of favs) {
          const { score, reason } = similarityScore(f, c);
          total += score;
          if (!r && reason) r = reason;
        }
        return { plato: c, total, reason: r };
      });

      scored.sort((a, b) => b.total - a.total);
      const top = scored.slice(0, limit).filter(x => x.total > 0);

      const items = top.map(t => t.plato);
      const reasonById: Record<string, { cause: string; refDishId: string } | undefined> = {};
      for (const t of top) reasonById[t.plato.id] = t.reason;

      set({ items, reasonById, loading: false });
    },

    clear: () => set({ items: [], reasonById: {}, loading: false }),
  }),
  {
    name: "suggestions-v1",
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (s) => ({ items: s.items, reasonById: s.reasonById }),
  }
));
