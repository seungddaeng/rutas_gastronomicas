import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { spacing } from "../theme/tokens";
import { renderStars } from "../utils/rating";

export default function StarRating({
  value, suffix,
}: { value: number; suffix?: string }) {
  const { colors } = useThemeColors();
  const styles = getStyles(colors);
  return (
    <View style={styles.row}>
      <Text style={[styles.stars, { color: colors.text }]}>{renderStars(value)}</Text>
      <Text style={[styles.meta, { color: colors.muted }]}>{` ${value}${suffix ?? ""}`}</Text>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  stars: { fontSize: 14, fontWeight: "700" },
  meta: { fontSize: 12 },
});
