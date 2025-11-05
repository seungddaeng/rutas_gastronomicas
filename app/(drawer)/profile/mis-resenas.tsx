import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { spacing, radius } from "../../../theme/tokens";
import { onUserReviews, getPlatoName } from "../../../services/reviews";
import { useUserStore } from "../../../store/useUserStore";
import { useRouter } from "expo-router";

export default function MisResenasScreen() {
  const { colors } = useThemeColors();
  const styles = getStyles(colors);
  const user = useUserStore((s) => s.user);
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    const off = onUserReviews(user.uid, async (rows) => {
      const mapped = await Promise.all(
        rows.map(async (r: any) => ({
          ...r,
          _pName: r.platoId ? await getPlatoName(r.platoId) : "Plato",
        }))
      );
      setItems(mapped);
    });
    return off;
  }, [user?.uid]);

  return (
    <ScrollView
      style={styles.wrap}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <Text style={styles.title}>Tus reseñas</Text>
      {items.length === 0 ? (
        <Text style={{ color: colors.muted }}>Aún no tienes reseñas.</Text>
      ) : (
        items.map((r) => (
          <TouchableOpacity
            key={r.id}
            onPress={() =>
              router.push({
                pathname: "/reviews/[platoId]/[reviewId]",
                params: { platoId: r.platoId, reviewId: r.id },
              })
            }
          >
            <View
              style={[
                styles.card,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
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
                <Text style={{ color: colors.text, fontWeight: "700" }}>
                  {r._pName} — {r.comment ? "Mi reseña" : "Comentario"}
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
              {!!r.comment && (
                <Text style={{ color: colors.text, marginTop: spacing.xs }}>
                  {r.comment}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.background },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: spacing.md,
    },
    card: {
      borderWidth: 1,
      borderRadius: radius.xl,
      padding: spacing.md,
      marginBottom: spacing.sm,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
      elevation: 6,
    },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
    badgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
    badgeOk: { backgroundColor: "#2ecc71" },
    badgeNo: { backgroundColor: "#e74c3c" },
    badgePend: { backgroundColor: "#f1c40f" },
  });
