import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export async function loadFavoritos(uid: string): Promise<Set<string>> {
  const favsRef = collection(db, "users", uid, "favoritos");
  const snap = await getDocs(favsRef);
  return new Set(snap.docs.map((d) => d.id));
}

export async function addFavorito(uid: string, platoId: string) {
  const ref = doc(db, "users", uid, "favoritos", platoId);
  await setDoc(ref, { createdAt: serverTimestamp() }, { merge: true });
  try {
    await updateDoc(doc(db, "platos", platoId), { favCount: increment(1) });
  } catch {}
}

export async function removeFavorito(uid: string, platoId: string) {
  const ref = doc(db, "users", uid, "favoritos", platoId);
  await deleteDoc(ref);
  try {
    await updateDoc(doc(db, "platos", platoId), { favCount: increment(-1) });
  } catch {}
}