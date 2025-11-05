import {
  collection,
  getFirestore,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
  doc,
  getDoc,
  Timestamp,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Plato } from "../store/catalog";
import { imagesById } from "../data/imagesById";

export type PlatoFS = {
  id: string;            
  nombre: string;
  precioReferencial: number;
  zona: "Miraflores" | "Sopocachi" | "El Alto" | "San Pedro";
  descripcionCorta: string;
  picosidad: number;
  status?: "draft" | "approved" | "rejected";
  createdAt?: Timestamp;
  favCount?: number;
};

export function toPlatoUI(data: PlatoFS): Plato {
  return {
    id: data.id,
    nombre: data.nombre,
    precioReferencial: data.precioReferencial,
    zona: data.zona,
    descripcionCorta: data.descripcionCorta,
    picosidad: data.picosidad,
    picUri: imagesById[data.id] ?? imagesById["1"],  
  };
}

const PAGE_SIZE = 10;
const PLATOS = collection(db, "platos");

export async function fetchPlatosPage(opts?: {
  after?: DocumentSnapshot;
}): Promise<{ items: Plato[]; last?: DocumentSnapshot | null }> {
  const q = opts?.after
    ? query(PLATOS, where("status", "==", "approved"), orderBy("createdAt", "desc"), startAfter(opts.after), limit(PAGE_SIZE))
    : query(PLATOS, where("status", "==", "approved"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));

  const snap = await getDocs(q);
  const items = snap.docs.map((d) => toPlatoUI({ id: d.id, ...(d.data() as any) }));
  const last = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
  return { items, last };
}

export async function fetchPlatoById(id: string): Promise<Plato | null> {
  const ref = doc(db, "platos", id);
  const d = await getDoc(ref);
  if (!d.exists()) return null;
  return toPlatoUI({ id: d.id, ...(d.data() as any) });
}