import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useThemeColors } from "../../../hooks/useThemeColors";
export default function TabsLayout() {
  const { colors } = useThemeColors();
  const icon = (name: keyof typeof Ionicons.glyphMap) =>
    ({ color, size }: { color: string; size: number }) =>
      <Ionicons name={name} size={size} color={color} />;

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.tabBarBackground, borderTopColor: colors.border },
        headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio", tabBarLabel: "Inicio", tabBarIcon: icon("home-outline") }} />
      <Tabs.Screen name="platos" options={{ headerShown: false, tabBarLabel: "Platos", tabBarIcon: icon("restaurant-outline") }} />
      <Tabs.Screen name="favoritos/index" options={{ title: "Favoritos", tabBarLabel: "Favoritos", tabBarIcon: icon("heart-outline") }} />
      <Tabs.Screen name="mapa/index" options={{ title: "Mapa", tabBarLabel: "Mapa", tabBarIcon: icon("map-outline") }} />
      <Tabs.Screen name="perfil/index" options={{ title: "Perfil", tabBarLabel: "Perfil", tabBarIcon: icon("person-circle-outline") }} />
    </Tabs>
  );
}
