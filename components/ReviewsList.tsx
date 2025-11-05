import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { spacing, radius } from "../theme/tokens";
import { useIsAdmin } from "../constants/roles";
import {
  listReviewsPublic,
  listReviewsPending,
  setReviewStatus,
} from "../services/reviews";
import StarRating from "./StarRating";
import { useUserStore } from "../store/useUserStore";

type ReviewStatus = "pending" | "approved" | "rejected";

export default function ReviewsList({ platoId }: { platoId: string }) {
  const { colors } = useThemeColors();
  const styles = getStyles(colors);
  const IS_ADMIN = useIsAdmin();
  const me = useUserStore((s) => s.user);

  const [approved, setApproved] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);

  const [rejectTarget, setRejectTarget] = useState<{
    show: boolean;
    onSubmit?: (r?: string) => void;
  }>({ show: false });
  const reasonRef = { current: "" as string };

  const load = async () => {
    const pub = await listReviewsPublic(platoId);
    setApproved(pub);
    if (IS_ADMIN) {
      setPending(await listReviewsPending(platoId));
    } else {
      setPending([]);
    }
  };

  useEffect(() => {
    load();
  }, [platoId, IS_ADMIN]);

  const aprobar = async (reviewId: string) => {
    await setReviewStatus({
      platoId,
      reviewId,
      status: "approved",
      adminUid: me?.uid ?? "unknown",
      adminName: me?.displayName ?? me?.email ?? "Admin",
    });
    await load();
  };

  const pedirRazon = (onSubmit: (razon?: string) => void) => {
    setRejectTarget({ show: true, onSubmit });
  };

  const rechazarConRazon = (reviewId: string) => {
    pedirRazon(async (razon) => {
      await setReviewStatus({
        platoId,
        reviewId,
        status: "rejected",
        adminUid: me?.uid ?? "unknown",
        adminName: me?.displayName ?? me?.email ?? "Admin",
        reason: razon && razon.trim() ? razon.trim() : undefined,
      });
      await load();
    });
  };

  const emptyForUser = !IS_ADMIN && approved.length === 0;

  if (emptyForUser) {
    return (
      <Text style={{ color: colors.muted, marginTop: spacing.md }}>
        Aún no hay reseñas.
      </Text>
    );
  }

  return (
    <View style={{ marginTop: spacing.md, gap: spacing.md }}>
      {IS_ADMIN && pending.length > 0 && (
        <View>
          <Text style={{ color: colors.muted, marginBottom: spacing.xs }}>
            Pendientes ({pending.length})
          </Text>
          {pending.map((r) => (
            <View
              key={r.id}
              style={[
                styles.card,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {r.userDisplayName}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <StarRating value={r.rating} />
                <StatusBadge status={r.status} />
              </View>
              {r.comment ? (
                <Text style={{ color: colors.text, marginTop: spacing.xs }}>
                  {r.comment}
                </Text>
              ) : null}

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => aprobar(r.id)}
                  style={[
                    styles.actionChip,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <Text style={{ color: colors.text, fontWeight: "600" }}>
                    Aprobar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => rechazarConRazon(r.id)}
                  style={[
                    styles.actionChip,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <Text style={{ color: colors.text, fontWeight: "600" }}>
                    Rechazar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View>
        <Text style={{ color: colors.muted, marginBottom: spacing.xs }}>
          Reseñas
        </Text>
        {approved.map((r) => (
          <View
            key={r.id}
            style={[
              styles.card,
              styles.cardSpacing,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              {r.userDisplayName}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <StarRating value={r.rating} />
              <StatusBadge status={r.status as ReviewStatus} />
            </View>
            {r.comment ? (
              <Text style={{ color: colors.text, marginTop: spacing.xs }}>
                {r.comment}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      {rejectTarget.show && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Razón (opcional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: No cumple reglas de contenido"
              placeholderTextColor={colors.muted}
              onChangeText={(t) => (reasonRef.current = t)}
            />
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => setRejectTarget({ show: false })}
              >
                <Text style={{ color: colors.muted }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const v = reasonRef.current;
                  setRejectTarget({ show: false });
                  rejectTarget.onSubmit?.(v);
                  reasonRef.current = "";
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "700" }}>
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const { colors } = useThemeColors();
  const pill = {
    pending: { txt: "Pendiente", bd: colors.border },
    approved: { txt: "Aprobado", bd: colors.text },
    rejected: { txt: "Rechazado", bd: colors.border },
  }[status];

  return (
    <View
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: pill.bd,
      }}
    >
      <Text style={{ color: colors.text, fontWeight: "600" }}>{pill.txt}</Text>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    cardSpacing: { marginBottom: spacing.sm },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.md,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 18,
      elevation: 8,
      gap: spacing.xs,
    },
    actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
    actionChip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
    },

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
