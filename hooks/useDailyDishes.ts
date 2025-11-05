import { useMemo } from "react";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export function useDailyDishes<T extends { id: string }>(items: T[], take: number = 10) {
  return useMemo(() => {
    if (!items?.length) return [];
    const t = new Date();
    const seed = t.getFullYear() * 10000 + (t.getMonth() + 1) * 100 + t.getDate();
    return [...items]
      .sort((a, b) => hash(`${seed}-${a.id}`) - hash(`${seed}-${b.id}`))
      .slice(0, take);
  }, [items, take]);
}