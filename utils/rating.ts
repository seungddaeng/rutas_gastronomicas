export function averageRating(values: number[]) {
  if (!values.length) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

export function renderStars(n: number) {
  const full = Math.floor(n);
  const half = n - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "☆" : "") + "☆".repeat(empty - (half ? 0 : 0));
}
