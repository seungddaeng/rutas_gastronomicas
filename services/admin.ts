import { collectionGroup, getDocs, doc, getDoc, updateDoc, where, query } from "firebase/firestore";
import { db } from "../lib/firebase";

const localPart = (email?: string | null) =>
  (email ? email.split("@")[0] : null) || "Usuario";

export async function backfillReviewDisplayNames() {
  const q = query(collectionGroup(db, "reviews"));
  const snap = await getDocs(q);
  let count = 0;
  for (const d of snap.docs) {
    const data = d.data() as any;
    if (!data.userDisplayName || data.userDisplayName === "Anónimo") {
      const uid = data.userUid || data.user?.uid;
      if (!uid) continue;
      const u = await getDoc(doc(db, "users", uid));
      const name = (u.exists() && (u.data() as any).displayName) || localPart((u.data() as any)?.email);
      const platoId = data.platoId;
      if (!platoId) continue;
      await updateDoc(doc(db, "platos", platoId, "reviews", d.id), {
        userDisplayName: name,
        user: { uid, displayName: name },
      });
      count++;
    }
  }
  return count;
}
