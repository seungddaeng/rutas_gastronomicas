import { useEffect, useState } from "react";
import { listenAuth } from "../services/auth";
import { useUserStore } from "../store/useUserStore";
import { ensureUserDoc, fetchUserDoc } from "../services/users";
import { useCatalogStore } from "../store/catalog"; 

const localPart = (email?: string | null) =>
  (email ? email.split("@")[0] : null) || null;

export const useAuthListener = () => {
  const setUser = useUserStore((s) => s.setUser);
  const setLoading = useUserStore((s) => s.setLoading);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const off = listenAuth(async (u) => {
      if (u) {
        const slim = { uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL };
        await ensureUserDoc(slim);
        const userDoc = await fetchUserDoc(u.uid);
        const displayName =
          userDoc?.displayName ?? slim.displayName ?? localPart(slim.email) ?? "Usuario";
        setUser({ ...slim, displayName, role: userDoc?.role ?? "user" });

        useCatalogStore.persist?.setOptions?.({ name: `catalog-store:${u.uid}` });
        try {
          await useCatalogStore.getState().syncFavoritosForUser(u.uid);
        } catch {}
      } else {
        setUser(null);

        useCatalogStore.persist?.setOptions?.({ name: "catalog-store:guest" });
        useCatalogStore.getState().clearFavoritos?.();
      }
      setLoading(false);
      setReady(true);
    });
    return off;
  }, [setUser, setLoading]);

  return { ready };
};