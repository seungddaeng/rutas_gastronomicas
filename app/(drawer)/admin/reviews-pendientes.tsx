import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useIsAdmin } from "../../../constants/roles";
import { spacing, radius } from "../../../theme/tokens";
import { useThemeColors } from "../../../hooks/useThemeColors";
import {
  getPlatoName,
  setReviewStatus,
  onAllPendingReviews,
} from "../../../services/reviews";
import StarRating from "../../../components/StarRating";
import { useUserStore } from "../../../store/useUserStore";
type PendingItem = {
  id: string;
  platoId: string;
  userDisplayName: string;
  rating: number;
  comment?: string;
  createdAt?: any;
  status: "pending";
};
const reasonRef = { current: "" as string };
export default function ReviewsPendientesScreen() {
  const isAdmin = useIsAdmin();
  const { colors } = useThemeColors();
  const styles = getStyles(colors);
  const me = useUserStore((s) => s.user);
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [names, setNames] = useState<Record<string, string>>({});
  const [rejectTarget, setRejectTarget] = useState<{
    show: boolean;
    onSubmit?: (r?: string) => void;
  }>({ show: false });
  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    const off = onAllPendingReviews(async (rows) => {
      setItems(rows as PendingItem[]);
      const uniquePlatos = Array.from(new Set(rows.map((r: any) => r.platoId)));
      const entries = await Promise.all(
        uniquePlatos.map(async (pid) => [pid, await getPlatoName(pid)] as const)
      );
      setNames(Object.fromEntries(entries));
      setLoading(false);
    });
    return off;
  }, [isAdmin]);
  async function aprobar(item: PendingItem) {
    await setReviewStatus({
      platoId: item.platoId,
      reviewId: item.id,
      status: "approved",
      adminUid: me?.uid ?? "unknown",
      adminName: me?.displayName ?? me?.email ?? "Admin",
    });
  }
  function pedirRazon(onSubmit: (razon: string | undefined) => void) {
    setRejectTarget({ show: true, onSubmit });
  }
  if (!isAdmin) {
    return (
      <View style={styles.notAuth}>
        {" "}
        <Text style={styles.text}>No autorizado</Text>{" "}
      </View>
    );
  }
  if (loading) {
    return (
      <View style={styles.loader}>
        {" "}
        <ActivityIndicator />{" "}
      </View>
    );
  }
  return (
    <View style={styles.screen}>
      {" "}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {" "}
        <Text style={styles.title}>
          Reseñas pendientes ({items.length})
        </Text>{" "}
        {items.length === 0 ? (
          <Text style={styles.muted}>No hay reseñas por revisar.</Text>
        ) : (
          items.map((r) => (
            <View key={r.id} style={styles.card}>
              {" "}
              <Text style={styles.muted}>
                {" "}
                {names[r.platoId] ?? "(Plato)"} • {r.platoId}{" "}
              </Text>{" "}
              <View style={styles.row}>
                {" "}
                <StarRating value={r.rating} />{" "}
                <View style={styles.badge}>
                  {" "}
                  <Text style={styles.badgeText}>Pendiente</Text>{" "}
                </View>{" "}
              </View>{" "}
              {!!r.comment && <Text style={styles.comment}>{r.comment}</Text>}{" "}
              <Text style={styles.muted}>Reseña de {r.userDisplayName}</Text>{" "}
              <View style={styles.actionsRow}>
                {" "}
                <TouchableOpacity
                  style={styles.btnApprove}
                  onPress={() => aprobar(r)}
                >
                  {" "}
                  <Text style={styles.btnApproveText}>Aprobar</Text>{" "}
                </TouchableOpacity>{" "}
                <TouchableOpacity
                  style={styles.btnReject}
                  onPress={() =>
                    pedirRazon(async (razon) => {
                      await setReviewStatus({
                        platoId: r.platoId,
                        reviewId: r.id,
                        status: "rejected",
                        adminUid: me?.uid ?? "unknown",
                        adminName: me?.displayName ?? me?.email ?? "Admin",
                        reason:
                          razon && razon.trim() ? razon.trim() : undefined,
                      });
                    })
                  }
                >
                  {" "}
                  <Text style={styles.btnRejectText}>Rechazar</Text>{" "}
                </TouchableOpacity>{" "}
              </View>{" "}
            </View>
          ))
        )}{" "}
      </ScrollView>{" "}
      {rejectTarget.show && (
        <View style={styles.modalBackdrop}>
          {" "}
          <View style={styles.modalCard}>
            {" "}
            <Text style={styles.modalTitle}>Razón (opcional)</Text>{" "}
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: No cumple reglas de contenido"
              placeholderTextColor={colors.muted}
              onChangeText={(t) => (reasonRef.current = t)}
            />{" "}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              {" "}
              <TouchableOpacity
                onPress={() => setRejectTarget({ show: false })}
              >
                {" "}
                <Text style={{ color: colors.muted }}>Cancelar</Text>{" "}
              </TouchableOpacity>{" "}
              <TouchableOpacity
                onPress={() => {
                  const v = reasonRef.current;
                  setRejectTarget({ show: false });
                  rejectTarget.onSubmit?.(v);
                  reasonRef.current = "";
                }}
              >
                {" "}
                <Text style={{ color: colors.primary, fontWeight: "700" }}>
                  {" "}
                  Guardar{" "}
                </Text>{" "}
              </TouchableOpacity>{" "}
            </View>{" "}
          </View>{" "}
        </View>
      )}{" "}
    </View>
  );
}
const getStyles = (colors: ReturnType<typeof useThemeColors>["colors"]) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scroll: { backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.md },
    title: { fontWeight: "700", fontSize: 18, color: colors.text },
    text: { color: colors.text },
    muted: { color: colors.muted, marginBottom: 4 },
    comment: { color: colors.text, marginTop: 6 },
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.md,
      gap: spacing.xs,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 18,
      elevation: 8,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    badge: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    badgeText: { color: colors.text, fontWeight: "600" },
    actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipText: { color: colors.text, fontWeight: "600" },
    notAuth: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
      justifyContent: "center",
    },
    loader: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    actionsRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    btnApprove: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: radius.md,
      backgroundColor: "#2ecc71",
    },
    btnApproveText: { color: "#fff", fontWeight: "700" },
    btnReject: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: radius.md,
      backgroundColor: "#e74c3c",
    },
    btnRejectText: { color: "#fff", fontWeight: "700" },
    modalBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#0006",
      alignItems: "center",
      justifyContent: "center",
    },
    modalCard: {
      width: "88%",
      borderRadius: radius.lg,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontWeight: "700",
      color: colors.text,
      marginBottom: spacing.xs,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.sm,
      color: colors.text,
    },
  });
