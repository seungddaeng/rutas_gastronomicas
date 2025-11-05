import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewDTO = {
  id?: string;
  platoId: string;
  userUid: string;
  userDisplayName: string | null;
  rating: number;
  comment?: string;
  createdAt?: any;
  status: ReviewStatus;
  adminFeedback?: string | null;
  moderatedAt?: any;
  moderatedBy?: { uid: string; name: string } | null;
};

export async function createReview(input: {
  platoId: string;
  userUid: string;
  userDisplayName: string | null;
  rating: number;
  comment?: string;
}) {
  const ref = collection(db, "platos", input.platoId, "reviews");
  await addDoc(ref, {
    ...input,
    user: { uid: input.userUid, displayName: input.userDisplayName ?? null },
    status: "pending",
    createdAt: serverTimestamp(),
  } as ReviewDTO);
}

export async function listReviewsPublic(platoId: string) {
  const ref = collection(db, "platos", platoId, "reviews");
  const qy = query(
    ref,
    where("status", "==", "approved"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  })) as ReviewDTO[];
}

export async function listReviewsPending(platoId: string) {
  const ref = collection(db, "platos", platoId, "reviews");
  const qy = query(
    ref,
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  })) as ReviewDTO[];
}

export async function listAllPendingReviews() {
  const qy = query(
    collectionGroup(db, "reviews"),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(qy);
  const items = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  })) as ReviewDTO[];
  return items.filter((r) => !!r.platoId);
}

export async function listUserReviews(userUid: string) {
  const qy = query(
    collectionGroup(db, "reviews"),
    where("userUid", "==", userUid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  })) as ReviewDTO[];
}

export async function listAllReviewsAdmin() {
  const qy = query(
    collectionGroup(db, "reviews"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  })) as ReviewDTO[];
}

export async function setReviewStatus(params: {
  platoId: string;
  reviewId: string;
  status: ReviewStatus;
  adminUid: string;
  adminName: string | null;
  reason?: string;
}) {
  const { platoId, reviewId, status, adminUid, adminName, reason } = params;
  const ref = doc(db, "platos", platoId, "reviews", reviewId);
  await updateDoc(ref, {
    status,
    adminFeedback: reason ?? null,
    moderatedAt: serverTimestamp(),
    moderatedBy: { uid: adminUid, name: adminName ?? "Admin" },
  });
}

const _platoNameCache: Record<string, string> = {};
export async function getPlatoName(platoId: string): Promise<string> {
  if (_platoNameCache[platoId]) return _platoNameCache[platoId];
  const s = await getDoc(doc(db, "platos", platoId));
  const name =
    s.exists() && (s.data() as any)?.nombre
      ? (s.data() as any).nombre
      : "(Plato)";
  _platoNameCache[platoId] = name;
  return name;
}

export function onAllPendingReviews(cb: (rows: ReviewDTO[]) => void) {
  const qy = query(
    collectionGroup(db, "reviews"),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const off = onSnapshot(qy, (snap) => {
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as ReviewDTO[];
    cb(items);
  });
  return off;
}

export function onUserReviews(
  userUid: string,
  cb: (rows: ReviewDTO[]) => void
) {
  const qy = query(
    collectionGroup(db, "reviews"),
    where("userUid", "==", userUid),
    orderBy("createdAt", "desc")
  );
  const off = onSnapshot(qy, (snap) => {
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as ReviewDTO[];
    cb(items);
  });
  return off;
}

export function onReviewsPendingForPlato(
  platoId: string,
  cb: (rows: ReviewDTO[]) => void
) {
  const qy = query(
    collection(db, "platos", platoId, "reviews"),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const off = onSnapshot(qy, (snap) => {
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as ReviewDTO[];
    cb(items);
  });
  return off;
}
export function onAllReviewsAdmin(cb: (rows: any[]) => void) {
  const qy = query(
    collectionGroup(db, "reviews"),
    orderBy("createdAt", "desc")
  );
  const off = onSnapshot(qy, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(items);
  });
  return off;
}
