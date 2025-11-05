import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName?: string | null;
  nickname?: string | null;
  photoURL?: string | null;
};

export async function getEmailByNickname(nickname: string): Promise<string | null> {
  const q = query(collection(db, 'users'), where('nickname', '==', nickname));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const data = snap.docs[0].data() as UserProfile;
  return data.email ?? null;
}

export async function isNicknameTaken(nickname: string, excludeUid?: string): Promise<boolean> {
  const q = query(collection(db, 'users'), where('nickname', '==', nickname));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  const hit = snap.docs[0];
  if (!excludeUid) return true;
  return hit.id !== excludeUid;
}

export async function upsertUserProfile(profile: UserProfile) {
  if (!profile.uid) throw new Error('uid requerido');
  await setDoc(doc(db, 'users', profile.uid), {
    uid: profile.uid,
    email: profile.email ?? null,
    displayName: profile.displayName ?? null,
    nickname: profile.nickname ?? null,
    photoURL: profile.photoURL ?? null,
    updatedAt: Date.now(),
  }, { merge: true });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

const USERS = 'users';

export async function updateUserProfilePhoto(uid: string, photoURL: string) {
  const ref = doc(db, USERS, uid);
  await setDoc(ref, { photoURL }, { merge: true });
}
