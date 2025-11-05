import { ImageSourcePropType } from "react-native";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";
import { ZonaId } from "../data/zonas";
import { useUserStore } from "./useUserStore";
import { addFavorito, removeFavorito, loadFavoritos } from "../services/favoritos";

export type Plato = {
  id: string;
  nombre: string;
  precioReferencial: number;
  zona: ZonaId;
  picUri: ImageSourcePropType;
  descripcionCorta: string;
  picosidad: number;
};

type CatalogState = {
  platos: Plato[];
  favoritos: Set<string>;
  favCounts: Record<string, number>;

  setPlatos: (items: Plato[]) => void;
  toggleFavorito: (id: string) => Promise<void>;

  syncFavoritosForUser: (uid: string) => Promise<void>;
  clearFavoritos: () => void;

  _loadRemoteFavoritos: () => Promise<void>;
};

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      platos: [],
      favoritos: new Set<string>(),
      favCounts: {},

      setPlatos: (items) => set({ platos: items }),

      toggleFavorito: async (id) => {
        const favoritos = new Set(get().favoritos);
        const wasFav = favoritos.has(id);

        if (wasFav) favoritos.delete(id);
        else favoritos.add(id);

        const favCounts = { ...get().favCounts };
        const prev = favCounts[id] ?? 0;
        favCounts[id] = Math.max(0, prev + (wasFav ? -1 : 1));

        set({ favoritos, favCounts });
        const uid = useUserStore.getState().user?.uid;
        try {
          if (uid) {
            if (wasFav) await removeFavorito(uid, id);
            else await addFavorito(uid, id);
          }
        } catch (e) {
          if (wasFav) favoritos.add(id);
          else favoritos.delete(id);
          favCounts[id] = prev;
          set({ favoritos, favCounts });
        }
      },

      syncFavoritosForUser: async (uid: string) => {
        if (!uid) return;
        const remote = await loadFavoritos(uid);
        const merged = new Set<string>([...get().favoritos, ...remote]);
        set({ favoritos: merged });
      },

      _loadRemoteFavoritos: async () => {
        const uid = useUserStore.getState().user?.uid;
        if (!uid) return;
        const remote = await loadFavoritos(uid);
        const merged = new Set<string>([...get().favoritos, ...remote]);
        set({ favoritos: merged });
      },
      clearFavoritos: () => set({ favoritos: new Set<string>(), favCounts: {} }),
    }),
    {
      name: "catalog-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        platos: state.platos,
        favoritos: Array.from(state.favoritos),
        favCounts: state.favCounts,
      }),
      onRehydrateStorage: () => (persistedState) => {
        if (persistedState && Array.isArray((persistedState as any).favoritos)) {
          const favArray = (persistedState as any).favoritos as string[];
          useCatalogStore.setState(
            (prev) => ({ ...prev, favoritos: new Set(favArray) } as any),
            false
          );
        }
      },
    }
  )
);