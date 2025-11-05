import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { useThemeColors } from "../../../../hooks/useThemeColors";
import { spacing, radius } from "../../../../theme/tokens";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { getPlatoName } from "../../../../services/reviews";
import StarRating from "../../../../components/StarRating";

export default function ReviewDetailScreen() {
  const { colors } = useThemeColors();
  const styles = getStyles(colors);
  const { platoId, reviewId } = useLocalSearchParams<{
    platoId: string;
    reviewId: string;
  }>();
  const [item, setItem] = useState<any>(null);
  const [pName, setPName] = useState<string>("Plato");

  useEffect(() => {
    if (!platoId) return;
    getPlatoName(platoId as string).then(setPName);
  }, [platoId]);

  useEffect(() => {
    if (!platoId || !reviewId) return;
    const ref = doc(db, "platos", String(platoId), "reviews", String(reviewId));
    const off = onSnapshot(ref, (snap) => {
      if (snap.exists()) setItem({ id: snap.id, ...(snap.data() as any) });
    });
    return off;
  }, [platoId, reviewId]);

  if (!item) {
    return (
      <View style={styles.wrap}>
        <Text style={{ color: colors.muted }}>Cargando...</Text>
      </View>
    );
  }

  const when = item.createdAt?.toDate ? item.createdAt.toDate() : null;
  const dd = when
    ? `${String(when.getDate()).padStart(2, "0")}/${String(
        when.getMonth() + 1
      ).padStart(2, "0")}/${when.getFullYear()}`
    : "—";

  return (
    <ScrollView
      style={styles.wrap}
      contentContainerStyle={{ padding: spacing.lg }}
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
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>
          {pName}
        </Text>
        <Text style={{ color: colors.muted, marginBottom: spacing.xs }}>
          por {item.userDisplayName ?? "Anónimo"} • {dd}
        </Text>

        <StarRating value={item.rating ?? 0} />
        {!!item.comment && (
          <Text style={{ color: colors.text, marginTop: spacing.sm }}>
            {item.comment}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            gap: spacing.xs,
            alignItems: "center",
            marginTop: spacing.md,
          }}
        >
          <Text style={{ color: colors.muted, fontWeight: "700" }}>
            Estado:
          </Text>
          <Text style={{ color: colors.text }}>
            {String(item.status).toUpperCase()}
          </Text>
        </View>

        {!!item.adminFeedback && item.status === "rejected" && (
          <View
            style={[
              styles.fbBox,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
          >
            <Text
              style={{
                color: colors.muted,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              Feedback del admin
            </Text>
            <Text style={{ color: colors.text }}>{item.adminFeedback}</Text>
          </View>
        )}

        {!!item.moderatedAt && (
          <View style={{ marginTop: spacing.sm }}>
            <Text style={{ color: colors.muted }}>
              Moderado:{" "}
              {item.moderatedAt?.toDate
                ? item.moderatedAt.toDate().toLocaleString()
                : "—"}{" "}
              por {item.moderatedBy?.name ?? "—"}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.background },
    card: {
      borderWidth: 1,
      borderRadius: radius.xl,
      padding: spacing.lg,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
      elevation: 6,
    },
    fbBox: {
      borderWidth: 1,
      borderRadius: radius.md,
      padding: spacing.sm,
      marginTop: spacing.sm,
    },
  });
