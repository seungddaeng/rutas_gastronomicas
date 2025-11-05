export type ReviewStatus = "pending" | "approved" | "rejected";

export const statusLabel = (s: ReviewStatus) =>
  s === "approved" ? "Aprobado" : s === "rejected" ? "Rechazado" : "Pendiente";

export function legacyModeratorName(r: any) {
  if (r?.moderatedBy?.name) return r.moderatedBy.name;
  return "—";
}

export function legacyModeratedDate(r: any): Date | null {
  return r?.moderatedAt?.toDate?.() ?? r?.createdAt?.toDate?.() ?? null;
}