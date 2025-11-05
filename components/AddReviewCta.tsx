import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { spacing, radius } from "../theme/tokens";

export default function AddReviewCta() {
  const { colors } = useThemeColors();
  return (
    <View style={{ marginTop: spacing.md }}>
      <TouchableOpacity
        onPress={() => {}}
        style={{
          alignSelf: "flex-start",
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        }}
        disabled
      >
        <Text style={{ color: colors.muted, fontWeight: "600" }}>
          Inicia sesión para dejar una reseña
        </Text>
      </TouchableOpacity>
    </View>
  );
}