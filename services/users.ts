import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export type UserDoc = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "user" | "admin";
  createdAt: any;
  pushToken?: string | null;
  notificationsEnabled?: boolean;
};

const localPart = (email?: string | null) =>
  (email ? email.split("@")[0] : null) || null;

export async function ensureUserDoc(u: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): Promise<UserDoc> {
  const ref = doc(db, "users", u.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as UserDoc;
  }

  const docData: UserDoc = {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName ?? localPart(u.email),
    photoURL: u.photoURL,
    role: "user",
    createdAt: serverTimestamp() as any,
    notificationsEnabled: true,
  };

  await setDoc(ref, docData);
  return docData;
}

export async function fetchUserDoc(uid: string): Promise<UserDoc | null> {
  const s = await getDoc(doc(db, "users", uid));
  return s.exists() ? (s.data() as UserDoc) : null;
}

export async function updateDisplayName(uid: string, name: string) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { displayName: name });
}

export async function fetchUserRole(uid: string): Promise<"user" | "admin"> {
  const s = await getDoc(doc(db, "users", uid));
  if (!s.exists()) return "user";
  return ((s.data() as any).role as "user" | "admin") ?? "user";
}

export async function updateUserPushSettings(
  uid: string,
  data: {
    pushToken?: string | null;
    notificationsEnabled?: boolean;
  }
) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
