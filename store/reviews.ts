import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: string;
  platoId: string;
  userDisplayName: string;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  createdAt: number;
};

type ReviewsState = {
  byDish: Record<string, Review[]>;
  addReviewLocal: (r: Omit<Review, "id" | "createdAt" | "status">) => void;
  setReviewStatus: (platoId: string, reviewId: string, status: ReviewStatus) => void;
};

const genId = () => Math.random().toString(36).slice(2);

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      byDish: {},

      addReviewLocal: (r) => {
        const rev: Review = {
          id: genId(),
          createdAt: Date.now(),
          status: "pending",   
          ...r,
        };
        const map = { ...get().byDish };
        const list = map[r.platoId] ? [...map[r.platoId]] : [];
        list.unshift(rev);    
        map[r.platoId] = list;
        set({ byDish: map });
      },

      setReviewStatus: (platoId, reviewId, status) => {
        const map = { ...get().byDish };
        const list = map[platoId] ? [...map[platoId]] : [];
        const idx = list.findIndex((x) => x.id === reviewId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], status };
          map[platoId] = list;
          set({ byDish: map });
        }
      },
    }),
    {
      name: "reviews-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
