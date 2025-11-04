import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | undefined>();

  const responseListener = useRef<Notifications.Subscription | null>(null);
  const receiveListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    (async () => {
      if (Device.osName === "Android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    })();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      console.log("[Push] Expo Push Token:", token);
      if (token) setExpoPushToken(token);
    });

    receiveListener.current =
      Notifications.addNotificationReceivedListener((n) => {
        setNotification(n);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((resp) => {
        console.log(
          "[Push] Notification action:",
          resp.actionIdentifier,
          resp.notification.request.content.data
        );
      });

    return () => {
      receiveListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return {
    expoPushToken,
    notification,
    sendPushNotification,
    scheduleLocalNotification,
  };
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice) {
    console.warn("Debes usar un dispositivo físico para push.");
    return;
  }

  if (
    Platform.OS === "android" &&
    (Constants as any).appOwnership === "expo"
  ) {
    console.warn(
      "[Push] Ejecutando en Expo Go Android: las push remotas no están soportadas " +
        "a partir de SDK 53. Usaremos solo notificaciones locales."
    );
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Permisos de notificaciones denegados.");
    return;
  }

  const projectId = "7d08872f-7310-448d-961a-1c527a7931ee";

  try {
    const token = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;
    return token;
  } catch (e) {
    console.warn("[Push] Error al obtener Expo Push Token:", e);
    return;
  }
}

export async function sendPushNotification(
  expoPushToken: string,
  message: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }
) {
  if (!expoPushToken) return;

  const payload = {
    to: expoPushToken,
    sound: "default",
    title: message.title,
    body: message.body,
    data: message.data ?? {},
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function scheduleLocalNotification(custom?: {
  title?: string;
  body?: string;
  data?: Record<string, any>;
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: custom?.title ?? "Rutas Gastronómicas",
      body:
        custom?.body ??
        "Vuelve a descubrir un platito paceño hoy 🤍",
      sound: "default",
      data: { local: true, ...(custom?.data ?? {}) },
    },
    trigger: { seconds: 2 } as Notifications.NotificationTriggerInput,
  });
}
