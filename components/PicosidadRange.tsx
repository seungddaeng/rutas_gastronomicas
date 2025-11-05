import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { spacing, radius } from "../theme/tokens";

type Range = { min: number; max: number };

export default function PicosidadRange({
  value,
  onChange,
}: { value: Range; onChange: (r: Range) => void }) {
  const { colors } = useThemeColors();
  const styles = getStyles(colors);

  const atMin = value.min <= 0;
  const atMax = value.min >= 5;

  const bumpMin = (delta: 1 | -1) => {
    const nextMin = Math.max(0, Math.min(5, value.min + delta));
    if (nextMin !== value.min) {
      onChange({ min: nextMin, max: 5 });
    }
  };

  return (
    <View style={styles.inlineWrap}>
      <Text style={styles.inlineLabel}>Picosidad: {value.min}–5</Text>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => bumpMin(-1)}
          disabled={atMin}
          style={[styles.chip, atMin && styles.chipDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Bajar picosidad mínima"
        >
          <Text style={[styles.chipText, atMin && styles.chipTextDisabled]}>−1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => bumpMin(1)}
          disabled={atMax}
          style={[styles.chip, atMax && styles.chipDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Subir picosidad mínima"
        >
          <Text style={[styles.chipText, atMax && styles.chipTextDisabled]}>+1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: ReturnType<typeof useThemeColors>["colors"]) =>
  StyleSheet.create({
    inlineWrap: {
      marginTop: spacing.xs,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    inlineLabel: {
      color: colors.muted,
    },
    row: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    chip: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      elevation: 1,
      shadowColor: colors.shadow,
      alignItems: "center",
    },
    chipDisabled: {
      opacity: 0.5,
    },
    chipText: {
      fontWeight: "400",
      color: colors.text,
      textAlign: "center",
    },
    chipTextDisabled: {
      color: colors.muted,
    },
  });