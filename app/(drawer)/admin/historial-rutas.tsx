import React, { useEffect, useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { spacing, radius } from "../../../theme/tokens";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useIsAdmin } from "../../../constants/roles";
import {
  onAllRoutesAdmin,
  formatRouteMeta,
  RouteDTO,
} from "../../../services/routes";

export default function HistorialRutas() {
  const isAdmin = useIsAdmin();
  const { colors } = useThemeColors();
  const [rows, setRows] = useState<RouteDTO[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    const off = onAllRoutesAdmin(setRows);
    return off;
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>No autorizado</Text>
      </View>
    );
  }

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
        Historial de rutas
      </Text>

      {rows.length === 0 ? (
        <Text style={{ color: colors.muted }}>Sin actividad reciente.</Text>
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
                {r.title} — {r.userDisplayName ?? "Anónimo"}
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

            {r.moderatedBy?.name && r.moderatedAt && (
              <Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>
                Por: {r.moderatedBy.name}
              </Text>
            )}

            {!!r.adminFeedback && r.status === "rejected" && (
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
