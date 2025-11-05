import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { spacing, radius } from "../theme/tokens";

export function ModerationBar({
  value, onChange,
}: { value: "draft" | "approved" | "rejected"; onChange: (v: "draft" | "approved" | "rejected") => void }) {
  const { colors } = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.row}>
      {(["draft", "approved", "rejected"] as const).map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => onChange(opt)}
          style={[
            styles.chip,
            value === opt && { borderColor: colors.text },
          ]}
        >
          <Text style={styles.text}>
            {opt === "draft" ? "Draft" : opt === "approved" ? "Approved" : "Rejected"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    row: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    text: { color: colors.text, fontWeight: "600" },
  });