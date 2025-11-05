import { TextInput, View, StyleSheet } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { spacing, radius } from "../theme/tokens";

export default function SearchBar({
  value, onChange,
}: { value: string; onChange: (t: string) => void }) {
  const { colors } = useThemeColors();
  return (
    <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TextInput
        placeholder="Buscar por nombre..."
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChange}
        style={{ color: colors.text, paddingVertical: 2 }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  box: { borderRadius: radius.lg, borderWidth: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
});
