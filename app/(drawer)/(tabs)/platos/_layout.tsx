import { Stack } from "expo-router";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useThemeColors } from "../../../../hooks/useThemeColors";

export default function PlatosStack() {
  const { colors } = useThemeColors();
  return (
    <Stack screenOptions={{ headerTitleAlign: "center", headerStyle:{ backgroundColor: colors.surface }, headerTintColor: colors.text }}>
      <Stack.Screen
        name="index"
        options={{ title: "Platos Paceños", headerLeft: () => <DrawerToggleButton tintColor={colors.text} /> }}
      />
      <Stack.Screen name="[id]" options={{ title: "Detalles del plato" }} />
    </Stack>
  );
}
