import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { spacing, radius } from "../../../theme/tokens";
import { useIsAdmin } from "../../../constants/roles";
import { useRouter } from "expo-router";
import { db } from "../../../lib/firebase";
import {
  collectionGroup,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { getPlatoName } from "../../../services/reviews";
import {
  statusLabel,
  legacyModeratedDate,
  legacyModeratorName,
} from "../../../utils/status";

type Row = {
  id: string;
  platoId: string;
  userDisplayName?: string | null;
  status: "pending" | "approved" | "rejected";
  adminFeedback?: string | null;
  moderatedAt?: any;
  moderatedBy?: { uid: string; name?: string | null } | null;
  createdAt?: any;
  _pName?: string;
  _line2?: string;
};

export default function HistorialAdminScreen() {
  const { colors } = useThemeColors();
  const styles = getStyles(colors);
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const [items, setItems] = useState<Row[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    const qy = query(
      collectionGroup(db, "reviews"),
      orderBy("createdAt", "desc")
    );
    const off = onSnapshot(qy, async (snap) => {
      const base = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      })) as Row[];

      const withNames = await Promise.all(
        base.map(async (r) => {
          const pName = r.platoId ? await getPlatoName(r.platoId) : "Plato";
          const when = legacyModeratedDate(r);
          const dd = when
            ? `${String(when.getDate()).padStart(2, "0")}/${String(
                when.getMonth() + 1
              ).padStart(2, "0")}/${when.getFullYear()}`
            : "—";
          const who = legacyModeratorName(r);

          return {
            ...r,
            _pName: pName,
            _line2: `Estado: ${statusLabel(r.status)} • ${dd} • Por: ${who}`,
          };
        })
      );

      setItems(withNames);
    });
    return off;
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <View style={styles.wrap}>
        <Text style={{ color: colors.text, padding: spacing.lg }}>
          Solo admins.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.wrap}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <Text style={styles.title}>Historial de reseñas</Text>

      {items.length === 0 ? (
        <Text style={{ color: colors.muted }}>Sin actividad.</Text>
      ) : (
        items.map((it) => (
          <TouchableOpacity
            key={it.id}
            onPress={() =>
              router.push({
                pathname: "/(drawer)/reviews/[platoId]/[reviewId]",
                params: { platoId: it.platoId, reviewId: it.id },
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
                  {it._pName} — {it.userDisplayName ?? "Anónimo"}
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

              <Text style={{ color: colors.muted, marginTop: 2 }}>
                {it._line2}
              </Text>

              {!!it.adminFeedback && it.status === "rejected" && (
                <View
                  style={[
                    styles.fbBox,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                >
                  <Text style={{ color: colors.text }}>{it.adminFeedback}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const getStyles = (colors: ReturnType<typeof useThemeColors>["colors"]) =>
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
    fbBox: {
      borderWidth: 1,
      borderRadius: radius.md,
      padding: spacing.sm,
      marginTop: spacing.xs,
    },
  });
