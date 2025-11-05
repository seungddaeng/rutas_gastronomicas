import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { spacing, radius } from "../theme/tokens";

export default function ZonaFilter<T extends string>({
  zonas, value, onChange,
}: { zonas: readonly T[]; value: T; onChange: (z: T) => void }) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.row}>
      {zonas.map((z) => {
        const active = value === z;
        return (
          <TouchableOpacity
            key={z}
            onPress={() => onChange(z)}
            style={[
              styles.chip,
              { backgroundColor: active ? colors.primary : colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={{ color: active ? "#fff" : colors.text }}>{z}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  row: 
  { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: spacing.sm, 
    marginTop: spacing.sm, 
    marginBottom: spacing.md 
 },
 chip: 
 { 
   paddingHorizontal: spacing.lg, 
   paddingVertical: spacing.sm, 
   borderRadius: radius.lg, 
   borderWidth: 1 
 },
});
