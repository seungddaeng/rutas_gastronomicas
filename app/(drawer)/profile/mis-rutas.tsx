import React, { useEffect, useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { spacing, radius } from "../../../theme/tokens";
import {
  onUserRoutes,
  formatRouteMeta,
  RouteDTO,
} from "../../../services/routes";
import { useUserStore } from "../../../store/useUserStore";

export default function MisRutas() {
  const { colors } = useThemeColors();
  const user = useUserStore((s) => s.user);
  const [rows, setRows] = useState<RouteDTO[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    const off = onUserRoutes(user.uid, setRows);
    return off;
  }, [user?.uid]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <Text
        style={{
          color: colors.text,
          fontWeight: "700",
          fontSize: 16,
          marginBottom: spacing.sm,
        }}
      >
        Tus rutas
      </Text>

      {rows.length === 0 ? (
        <Text style={{ color: colors.muted }}>Aún no creaste rutas.</Text>
      ) : (
        rows.map((r) => (
          <View
            key={r.id}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              padding: spacing.md,
              borderRadius: radius.lg,
              marginBottom: spacing.sm,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {r.title}
              </Text>
              <View
                style={[
                  {
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 999,
                  },
                  r.status === "approved"
                    ? { backgroundColor: "#2ecc71" }
                    : r.status === "rejected"
                    ? { backgroundColor: "#e74c3c" }
                    : { backgroundColor: "#f1c40f" },
                ]}
              >
                <Text
                  style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}
                >
                  {r.status === "approved"
                    ? "Aprobada"
                    : r.status === "rejected"
                    ? "Rechazada"
                    : "Pendiente"}
                </Text>
              </View>
            </View>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              {formatRouteMeta(r)}
            </Text>

            {r.status === "rejected" && !!r.adminFeedback && (
              <View
                style={{
                  marginTop: spacing.xs,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  padding: spacing.sm,
                  borderRadius: radius.md,
                }}
              >
                <Text
                  style={{
                    color: colors.muted,
                    fontSize: 11,
                    fontWeight: "700",
                    marginBottom: 4,
                  }}
                >
                  Feedback del admin
                </Text>
                <Text style={{ color: colors.text }}>{r.adminFeedback}</Text>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}
