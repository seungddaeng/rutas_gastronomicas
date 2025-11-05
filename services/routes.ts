import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export type RouteStatus = "pending" | "approved" | "rejected" | "private";

export type RouteDTO = {
  id?: string;
  title: string;
  summary?: string;
  stops?: Array<{ label: string; placeId?: string }>;
  userUid: string;
  userDisplayName?: string | null;
  status: RouteStatus;
  adminFeedback?: string | null;
  createdAt: any;
  moderatedAt?: any;
  moderatedBy?: { uid: string; name: string };
};

const ROUTES = collection(db, "routes");

export async function createRoute(input: {
  title: string;
  summary?: string;
  stops?: Array<{ label: string; placeId?: string }>;
  userUid: string;
  userDisplayName?: string | null;
  isPublic: boolean;
}) {
  const payload = {
    title: input.title,
    summary: input.summary ?? "",
    stops: input.stops ?? [],
    userUid: input.userUid,
    userDisplayName: input.userDisplayName ?? null,
    status: input.isPublic ? "pending" : "private",
    adminFeedback: null,
    createdAt: serverTimestamp(),
    moderatedAt: null,
    moderatedBy: null,
  };
  await addDoc(ROUTES, payload);
}

export async function setRouteStatus(params: {
  routeId: string;
  status: Exclude<RouteStatus, "private">;
  adminUid: string;
  adminName: string;
  reason?: string;
}) {
  const ref = doc(db, "routes", params.routeId);
  await updateDoc(ref, {
    status: params.status,
    adminFeedback: params.status === "rejected" ? params.reason ?? null : null,
    moderatedAt: serverTimestamp(),
    moderatedBy: { uid: params.adminUid, name: params.adminName },
  });
}

export function onPublicRoutes(cb: (rows: RouteDTO[]) => void) {
  const qy = query(
    ROUTES,
    where("status", "==", "approved"),
    orderBy("createdAt", "desc")
  );
  const off = onSnapshot(qy, (snap) => {
    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as RouteDTO[];
    cb(rows);
  });
  return off;
}

export function onUserRoutes(userUid: string, cb: (rows: RouteDTO[]) => void) {
  const qy = query(
    ROUTES,
    where("userUid", "==", userUid),
    orderBy("createdAt", "desc")
  );
  const off = onSnapshot(qy, (snap) => {
    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as RouteDTO[];
    cb(rows);
  });
  return off;
}

export function onPendingRoutesAdmin(cb: (rows: RouteDTO[]) => void) {
  const qy = query(
    ROUTES,
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const off = onSnapshot(qy, (snap) => {
    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as RouteDTO[];
    cb(rows);
  });
  return off;
}

export function onAllRoutesAdmin(cb: (rows: RouteDTO[]) => void) {
  const qy = query(ROUTES, orderBy("createdAt", "desc"));
  const off = onSnapshot(qy, (snap) => {
    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as RouteDTO[];
    cb(rows);
  });
  return off;
}

export function formatRouteMeta(r: RouteDTO) {
  if (r.summary && r.summary.trim().length) return r.summary;
  const names = (r.stops ?? []).map((s) => s.label).filter(Boolean);
  return names.length ? names.join(" → ") : "—";
}

export async function getCreatorName(routeId: string) {
  const d = await getDoc(doc(db, "routes", routeId));
  if (!d.exists()) return "Anónimo";
  const data = d.data() as any;
  return data.userDisplayName || "Anónimo";
}
