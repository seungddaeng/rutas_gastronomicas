import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";

import { useAuthListener } from "../hooks/useAuthListener";
import { useUserStore } from "../store/useUserStore";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { updateUserPushSettings } from "../services/users";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true as any,
    shouldShowList: true as any,
  }),
});

export default function RootLayout() {
  useAuthListener();
  const loading = useUserStore((s) => s.loading);
  const user = useUserStore((s) => s.user);

  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    (async () => {
      if (!user?.uid) return;
      if (!expoPushToken) return;

      try {
        await updateUserPushSettings(user.uid, {
          pushToken: expoPushToken,
          notificationsEnabled: true,
        });
        console.log("[Push] Token actualizado para usuario", user.uid);
      } catch (e) {
        console.log("[Push] No se pudo actualizar el push token:", e);
      }
    })();
  }, [user?.uid, expoPushToken]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
