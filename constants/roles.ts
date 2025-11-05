import { useUserStore } from "../store/useUserStore";
export const useIsAdmin = () => useUserStore((s) => s.user?.role === "admin");