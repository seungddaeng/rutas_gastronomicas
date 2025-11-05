import { auth } from '../lib/firebase';
import { upsertUserProfile } from './user';

export async function signUpEmail(email: string, password: string, displayName?: string) {
  if (!email || !password) throw new Error('email/password requeridos');
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  if (displayName && cred.user) await cred.user.updateProfile({ displayName });

  await upsertUserProfile({
    uid: cred.user!.uid,
    email: cred.user!.email,
    displayName: cred.user!.displayName ?? null,
    photoURL: cred.user!.photoURL ?? null,
  });

  return cred.user;
}

export async function signInEmail(email: string, password: string) {
  if (!email || !password) throw new Error('email y password requeridos');
  const res = await auth.signInWithEmailAndPassword(email, password);
  return res.user;
}

export function resetPassword(email: string) {
  if (!email) throw new Error('email requerido');
  return auth.sendPasswordResetEmail(email);
}

export function logOut() {
  return auth.signOut();
}
export function listenAuth(cb: (u: any | null) => void) {
  return auth.onAuthStateChanged(cb);
}

export function useGoogleAuth() {
  return {
    request: null as any,
    promptAsync: async () => {
      throw new Error('Inicio con Google deshabilitado temporalmente para este parcial.');
    },
  };
}
