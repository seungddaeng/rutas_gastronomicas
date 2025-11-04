import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
} from "react-native";
import {
  useState,
  useLayoutEffect,
  useMemo,
  useEffect,
  useRef,
} from "react";
import * as ImagePicker from "expo-image-picker";

import { useThemeColors } from "../hooks/useThemeColors";
import { spacing, radius } from "../theme/tokens";
import { uploadToCloudinary } from "../utils/cloudinary";
import { auth } from "../lib/firebase";
import { useUserStore } from "../store/useUserStore";
import { updateUserProfilePhoto } from "../services/user";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  statusLabel,
  legacyModeratedDate,
  legacyModeratorName,
} from "../utils/status";
import {
  onUserReviews,
  onAllReviewsAdmin,
  getPlatoName,
} from "../services/reviews";
import { useIsAdmin } from "../constants/roles";
import { fetchUserDoc, updateUserPushSettings } from "../services/users";
import { scheduleLocalNotification } from "../hooks/usePushNotifications";

type ReviewStatus = "pending" | "approved" | "rejected";

export default function ProfileScreen() {
  const { colors } = useThemeColors();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser as any);
  const isAdmin = useIsAdmin();

  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);
  const [savingNotifications, setSavingNotifications] = useState(false);

  const [myReviews, setMyReviews] = useState<
    Array<{
      id: string;
      platoId: string;
      title: string;
      meta: string;
      status: ReviewStatus;
      adminFeedback?: string | null;
    }>
  >([]);

  const [adminHistory, setAdminHistory] = useState<
    Array<{
      id: string;
      platoId: string;
      title: string;
      meta: string;
      status: ReviewStatus;
      feedback?: string | null;
    }>
  >([]);

  const lastReviewStatuses = useRef<Record<string, ReviewStatus>>({});

  const navigation = useNavigation();
  const router = useRouter();

  const initials = useMemo(() => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "?";
  }, [user?.displayName, user?.email]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      Alert.alert("Sesión cerrada", "Vuelve pronto");
      router.replace("/auth");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo cerrar sesión.");
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (!user?.uid) return;

    try {
      setSavingNotifications(true);
      setNotificationsEnabled(value);

      await updateUserPushSettings(user.uid, {
        notificationsEnabled: value,
        ...(value === false ? { pushToken: null } : {}),
      });

      if (!value) {
        Alert.alert(
          "Notificaciones desactivadas",
          "No te enviaremos notificaciones hasta que las vuelvas a activar."
        );
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.message ?? "No se pudieron actualizar las notificaciones."
      );
      setNotificationsEnabled((prev) => !value);
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleTestNotificationPress = async () => {
    if (!notificationsEnabled) {
      Alert.alert(
        "Notificaciones desactivadas",
        "Activa el switch para poder recibir notificaciones."
      );
      return;
    }

    try {
      await scheduleLocalNotification();
    } catch (e: any) {
      console.log("Error al programar notificación local:", e);
      Alert.alert(
        "Error",
        "No se pudo programar la notificación de prueba."
      );
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions?.({
      title: "Perfil",
      headerRight: () => (
        <Pressable
          onPress={() => router.push("/(drawer)/settings")}
          style={{ paddingRight: 12 }}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </Pressable>
      ),
    });
  }, [navigation, colors.text]);

  useEffect(() => {
    if (!user?.uid) return;
    const off = onUserReviews(user.uid, async (rows) => {
      const items = await Promise.all(
        rows.map(async (r: any) => {
          const pName = r.platoId ? await getPlatoName(r.platoId) : "Plato";
          const date = r.createdAt?.toDate ? r.createdAt.toDate() : null;
          const dd = date
            ? `${String(date.getDate()).padStart(2, "0")}/${String(
                date.getMonth() + 1
              ).padStart(2, "0")}/${date.getFullYear()}`
            : "";
          const stars = "⭐️".repeat(Math.max(0, r.rating ?? 0));
          const status = (r.status ?? "pending") as ReviewStatus;

          const prevStatus = lastReviewStatuses.current[r.id!];
          if (
            notificationsEnabled &&
            prevStatus &&
            prevStatus !== status &&
            status !== "pending"
          ) {
            const approved = status === "approved";
            scheduleLocalNotification({
              title: approved
                ? "Reseña aprobada ✨"
                : "Reseña revisada",
              body: approved
                ? `Tu reseña de ${pName} fue aprobada.`
                : `Tu reseña de ${pName} fue rechazada. Revisa el feedback del admin.`,
              data: {
                type: "review-status-changed",
                reviewId: r.id,
                platoId: r.platoId,
                status,
              },
            });
          }

          lastReviewStatuses.current[r.id!] = status;

          return {
            id: r.id!,
            platoId: r.platoId,
            title: `${pName} — ${r.comment ? "Mi reseña" : "Comentario"}`,
            meta: `${stars}  •  ${dd}`,
            status,
            adminFeedback: r.adminFeedback ?? null,
          };
        })
      );
      setMyReviews(items);
    });
    return off;
  }, [user?.uid, notificationsEnabled]);

  useEffect(() => {
    if (!isAdmin) return;
    const off = onAllReviewsAdmin(async (rows) => {
      const limited = rows.slice(0, 20);
      const items = await Promise.all(
        limited.map(async (r: any) => {
          const pName = r.platoId ? await getPlatoName(r.platoId) : "Plato";
          const when = legacyModeratedDate(r);
          const dd = when
            ? `${String(when.getDate()).padStart(2, "0")}/${String(
                when.getMonth() + 1
              ).padStart(2, "0")}/${when.getFullYear()} ${String(
                when.getHours()
              ).padStart(2, "0")}:${String(when.getMinutes()).padStart(2, "0")}`
            : "—";
          const who = legacyModeratorName(r);
          return {
            id: r.id!,
            platoId: r.platoId,
            title: `${pName} — ${r.userDisplayName ?? "Anónimo"}`,
            meta: `Estado: ${statusLabel(r.status)} • ${dd} • Por: ${who}`,
            status: (r.status ?? "pending") as ReviewStatus,
            feedback: r.adminFeedback ?? null,
          };
        })
      );
      setAdminHistory(items);
    });
    return off;
  }, [isAdmin]);

  useEffect(() => {
    if (!user?.uid) return;

    let cancelled = false;

    (async () => {
      try {
        const doc = await fetchUserDoc(user.uid);
        if (!doc || cancelled) return;

        setNotificationsEnabled(
          doc.notificationsEnabled === undefined
            ? true
            : !!doc.notificationsEnabled
        );
      } catch (e) {
        console.log("Error cargando settings de notificaciones:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const pickAndUpload = async () => {
    try {
      setLoading(true);

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permisos",
          "Necesito acceso a tu galería para seleccionar la foto."
        );
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (res.canceled) return;

      const asset = res.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("Ups", "No se seleccionó ninguna imagen válida.");
        return;
      }

      const up = await uploadToCloudinary(asset.uri, {
        fileName: `profile_${Date.now()}.jpg`,
        mimeType: "image/jpeg",
      });

      const url = up.secure_url || up.url;
      if (!url) {
        Alert.alert("Ups", "No se obtuvo URL de Cloudinary.");
        return;
      }

      const current = auth.currentUser;
      if (!current) {
        Alert.alert("Sesión", "No hay usuario autenticado.");
        return;
      }
      await (current as any).updateProfile({ photoURL: url });
      await current.reload();

      await updateUserProfilePhoto(current.uid, url);

      if (typeof setUser === "function") {
        setUser({
          uid: current.uid,
          email: current.email,
          displayName: current.displayName,
          photoURL: url,
        });
      }

      if (notificationsEnabled) {
        await scheduleLocalNotification({
          title: "Foto de perfil actualizada",
          body: "Tu nueva foto de perfil ya está lista 🤎",
          data: { type: "profile-photo-updated" },
        });
      }

      Alert.alert("Listo", "Foto actualizada con éxito.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Error al actualizar foto.");
    } finally {
      setLoading(false);
    }
  };

  const defaultRoutes = [
    {
      id: "d1",
      title: "Ruta clásica La Paz centro",
      meta: "Plaza Murillo → Mercado Lanza → Sopocachi",
    },
    {
      id: "d2",
      title: "El Alto — 16 de Julio",
      meta: "Feria → Anticuchos → Api con buñuelo",
    },
  ];

  const userRoutesPlaceholder = [
    {
      id: "u1",
      title: "Mi ruta vegana",
      meta: "Sopocachi → San Miguel → Calacoto",
    },
  ];

  const Row = ({ title, meta }: { title: string; meta: string }) => (
    <View style={styles.rowItem}>
      <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.rowMeta, { color: colors.muted }]}>{meta}</Text>
    </View>
  );

  return (
    <ScrollView
      style={[styles.wrap, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingBottom: spacing.xl * 2,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Card de perfil */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={{ width: 96, height: 96, borderRadius: 48 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: colors.primary + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                {initials}
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.title,
              { color: colors.text, marginTop: spacing.md },
            ]}
          >
            {user?.displayName || "Tu perfil"}
          </Text>
          <Text style={{ color: colors.muted, marginTop: spacing.xs }}>
            {user?.email || "Sin email"}
          </Text>

          <TouchableOpacity
            onPress={pickAndUpload}
            disabled={loading}
            style={[
              styles.btn,
              {
                backgroundColor: colors.primary,
                opacity: loading ? 0.6 : 1,
                marginTop: spacing.md,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Cambiar foto</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>
            Notificaciones
          </Text>
        </View>
        <View
          style={{
            marginTop: spacing.md,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Notificaciones push
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.subtitle,
              }}
            >
              {notificationsEnabled
                ? "Activadas para reseñas, cambios y avisos."
                : "Desactivadas en este dispositivo."}
            </Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
            />
            {savingNotifications && (
              <ActivityIndicator size="small" style={{ marginTop: 4 }} />
            )}
          </View>
        </View>

        <View
          style={{
            marginTop: spacing.md,
            alignItems: "flex-start",
          }}
        >
          <TouchableOpacity
            onPress={handleTestNotificationPress}
            style={{
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              borderRadius: radius.md,
              backgroundColor: colors.primary,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              Probar notificación ahora
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tus reseñas */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>
            Tus reseñas
          </Text>
          {myReviews.length > 3 && (
            <TouchableOpacity
              onPress={() => router.push("/(drawer)/profile/mis-resenas")}
            >
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Ver más
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {myReviews.slice(0, 3).length === 0 ? (
          <Text style={{ color: colors.muted }}>Aún no tienes reseñas.</Text>
        ) : (
          myReviews.slice(0, 3).map((r) => (
            <TouchableOpacity
              key={r.id}
              onPress={() =>
                router.push({
                  pathname: "/reviews/[platoId]/[reviewId]",
                  params: { platoId: r.platoId, reviewId: r.id },
                })
              }
            >
              <View style={{ marginBottom: spacing.sm }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={[styles.rowTitle, { color: colors.text }]}>
                    {r.title}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      r.status === "approved"
                        ? styles.badgeOk
                        : r.status === "rejected"
                        ? styles.badgeNo
                        : styles.badgePend,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {r.status === "approved"
                        ? "Aprobada"
                        : r.status === "rejected"
                        ? "Rechazada"
                        : "Pendiente"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.rowMeta, { color: colors.muted }]}>
                  {r.meta}
                </Text>

                {r.status === "rejected" && !!r.adminFeedback && (
                  <View
                    style={[
                      styles.feedbackBox,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.feedbackLabel, { color: colors.muted }]}
                    >
                      Feedback del admin
                    </Text>
                    <Text style={{ color: colors.text }}>
                      {r.adminFeedback}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Historial admin */}
      {isAdmin && (
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>
              Historial de reseñas (admin)
            </Text>
            {adminHistory.length > 3 && (
              <TouchableOpacity
                onPress={() => router.push("/(drawer)/admin/historial")}
              >
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  Ver más
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {adminHistory.slice(0, 3).length === 0 ? (
            <Text style={{ color: colors.muted }}>Sin actividad reciente.</Text>
          ) : (
            adminHistory.slice(0, 3).map((it) => (
              <TouchableOpacity
                key={it.id}
                onPress={() =>
                  router.push({
                    pathname: "/reviews/[platoId]/[reviewId]",
                    params: { platoId: it.platoId, reviewId: it.id },
                  })
                }
              >
                <View style={{ marginBottom: spacing.sm }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={[styles.rowTitle, { color: colors.text }]}>
                      {it.title}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        it.status === "approved"
                          ? styles.badgeOk
                          : it.status === "rejected"
                          ? styles.badgeNo
                          : styles.badgePend,
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {it.status === "approved"
                          ? "Aprobada"
                          : it.status === "rejected"
                          ? "Rechazada"
                          : "Pendiente"}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.rowMeta, { color: colors.muted }]}>
                    {it.meta}
                  </Text>

                  {!!it.feedback && (
                    <View
                      style={[
                        styles.feedbackBox,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.feedbackLabel, { color: colors.muted }]}
                      >
                        Feedback del admin
                      </Text>
                      <Text style={{ color: colors.text }}>{it.feedback}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* Rutas gastronómicas */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          Rutas gastronómicas
        </Text>

        <Text style={[styles.subTitle, { color: colors.text }]}>
          Por defecto
        </Text>
        {defaultRoutes.map((r) => (
          <Row key={r.id} title={r.title} meta={r.meta} />
        ))}

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <Text style={[styles.subTitle, { color: colors.text }]}>
          Creadas por ti
        </Text>
        {userRoutesPlaceholder.map((r) => (
          <Row key={r.id} title={r.title} meta={r.meta} />
        ))}

        <TouchableOpacity
          style={[
            styles.btnOutline,
            {
              borderColor: colors.border,
              marginTop: spacing.sm,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Text style={[styles.btnOutlineText, { color: colors.text }]}>
            Crear nueva ruta
          </Text>
        </TouchableOpacity>
      </View>

      {/* Créditos */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          Créditos
        </Text>

        <View style={styles.kv}>
          <Text style={[styles.k, { color: colors.muted }]}>App</Text>
          <Text style={[styles.v, { color: colors.text }]}>
            Rutas Gastronómicas
          </Text>
        </View>
        <View style={styles.kv}>
          <Text style={[styles.k, { color: colors.muted }]}>Versión</Text>
          <Text style={[styles.v, { color: colors.text }]}>1.0.0</Text>
        </View>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <View style={styles.kv}>
          <Text style={[styles.k, { color: colors.muted }]}>Desarrollo</Text>
          <Text style={[styles.v, { color: colors.text }]}>
            Mel, Patty y Tati
          </Text>
        </View>
        <View style={styles.kv}>
          <Text style={[styles.k, { color: colors.muted }]}>Asignatura</Text>
          <Text style={[styles.v, { color: colors.text }]}>
            Certificación React Native
          </Text>
        </View>

        <Text style={[styles.footerNote, { color: colors.muted }]}>
          Gracias por usar la app. Hecha con ❤ en Bolivia.
        </Text>
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        style={[
          styles.btnLogout,
          {
            borderColor: colors.border,
            marginTop: spacing.sm,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.btnLogoutText, { color: colors.subtitle }]}>
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: spacing.lg,
  },
  title: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  btn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  btnText: { color: "#fff", fontWeight: "700" },

  btnOutline: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  btnOutlineText: { fontWeight: "700" },

  sectionCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  rowItem: { marginBottom: spacing.sm },
  rowTitle: { fontSize: 14, fontWeight: "600" },
  rowMeta: { fontSize: 12, marginTop: 2 },
  separator: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
    marginVertical: spacing.sm,
  },
  linkBtn: { alignSelf: "flex-start" },
  linkText: { fontWeight: "700" },

  kv: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  k: { fontSize: 12 },
  v: { fontSize: 12, fontWeight: "600" },

  footerNote: { fontSize: 12, marginTop: spacing.md },

  btnLogout: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  btnLogoutText: { fontWeight: "700", fontSize: 14 },

  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  badgeOk: { backgroundColor: "#2ecc71" },
  badgeNo: { backgroundColor: "#e74c3c" },
  badgePend: { backgroundColor: "#f1c40f" },

  feedbackBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  feedbackLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
});
