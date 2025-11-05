export function formatPicosidad(n: number) {
  const v = Math.max(0, Math.min(5, Math.floor(n))); // clamp 0–5
  if (v === 0) return "Este platillo no es picante";
  return `Picosidad: ${"🌶️".repeat(v)}`;
}
