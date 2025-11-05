import React, { useEffect, useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { spacing, radius } from "../../../theme/tokens";
import {
  onPublicRoutes,
  formatRouteMeta,
  RouteDTO,
} from "../../../services/routes";

export default function RutasGlobales() {
  const { colors } = useThemeColors();
  const [rows, setRows] = useState<RouteDTO[]>([]);

  useEffect(() => {
    const off = onPublicRoutes(setRows);
    return off;
  }, []);

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
        Rutas globales
      </Text>

      {rows.length === 0 ? (
        <Text style={{ color: colors.muted }}>Aún no hay rutas aprobadas.</Text>
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
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              {r.title} — {r.userDisplayName ?? "Anónimo"}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              {formatRouteMeta(r)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
