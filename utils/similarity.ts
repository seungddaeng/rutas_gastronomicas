import type { Dish } from "../components/DishCard";

type Reason = { cause: "zona" 
    | "picosidad" 
    | "precio" 
    | "tags"; 
    refDishId: string };

const W = { 
    zona: 0.45, 
    picosidad: 0.3, 
    precio: 0.15, 
    tags: 0.1 
}; 

export function similarityScore(a: Dish, b: Dish): 
{ score: number; reason: Reason | null } 
{
  let score = 0;
  let reason: Reason | null = null;

  if (a.zona && b.zona && a.zona === b.zona) { score += W.zona; reason ??= { cause: "zona", refDishId: a.id }; }

  if (typeof a.picosidad === "number" && typeof b.picosidad === "number") {
    const diff = Math.abs(a.picosidad - b.picosidad);
    const contrib = W.picosidad * (1 - Math.min(diff / 5, 1));
    if (contrib > 0) { score += contrib; reason ??= { cause: "picosidad", refDishId: a.id }; }
  }

  if (typeof a.precioReferencial === "number" && typeof b.precioReferencial === "number") {
    const diff = Math.abs(a.precioReferencial - b.precioReferencial);
    const contrib = W.precio * (1 - Math.min(diff / 100, 1));
    if (contrib > 0.01) { score += contrib; reason ??= { cause: "precio", refDishId: a.id }; }
  }

  const aTags = (a as any).tags as string[] | undefined;
  const bTags = (b as any).tags as string[] | undefined;

  if (aTags?.length && bTags?.length) {
    
    const setA = new Set(aTags);
    const inter = bTags.filter(t => setA.has(t)).length;
    const union = new Set([...(aTags), ...(bTags)]).size || 1;
    const jaccard = inter / union;
    const contrib = W.tags * jaccard;

    if (contrib > 0.01) { score += contrib; reason ??= { cause: "tags", refDishId: a.id }; }
  }

  return { score, reason };
}

export function explainReason(cause: Reason["cause"], refDishName: string): string {
  switch (cause) {
    case "zona": 
    return `Porque te gustó ${refDishName} en esa zona`;

    case "picosidad": 
    return `Porque te gustó ${refDishName} con picosidad similar`;

    case "precio": 
    return `Porque te gustó ${refDishName} con precio parecido`;

    case "tags": 
    return `Porque te gustó ${refDishName} de estilo similar`;

    default: 
    return `Porque te gustó ${refDishName}`;
  }
}
