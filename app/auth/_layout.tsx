import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useThemeColors } from "../../hooks/useThemeColors";

export default function AuthLayout() {
    const { theme, colors } = useThemeColors();

    return (
        <>
            <StatusBar style={theme === "dark" ? "light" : "dark"} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="index" />
            </Stack>
        </>
    );
}
