import React from "react";
import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { zonas, type ZonaId } from "../data/zonas";

export type PicoBand = "all" | "suave" | "medio" | "picante";

type Props = {
    zonaSel: ZonaId | "all";
    onZona: (z: ZonaId | "all") => void;
    picoSel: PicoBand;
    onPico: (p: PicoBand) => void;
    disabled?: boolean;
};

export default function MapFilters({
    zonaSel,
    onZona,
    picoSel,
    onPico,
    disabled = false,
}: Props) {
    const { colors } = useThemeColors();

    return (
        <View>
            <Text style={[styles.title, { color: colors.text }]}>Filtros</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.row}
            >
                <Chip
                    label="Todas las zonas"
                    active={zonaSel === "all"}
                    onPress={() => onZona("all")}
                    disabled={disabled}
                />
                {zonas.map((z) => (
                    <Chip
                        key={z.id}
                        label={z.nombre}
                        active={zonaSel === z.id}
                        onPress={() => onZona(z.id)}
                        disabled={disabled}
                    />
                ))}
            </ScrollView>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.row, { marginTop: 6 }]}
            >
                <Chip
                    label="Picosidad: Todas"
                    active={picoSel === "all"}
                    onPress={() => onPico("all")}
                    disabled={disabled}
                />
                <Chip
                    label="Suave (1–2)"
                    active={picoSel === "suave"}
                    onPress={() => onPico("suave")}
                    disabled={disabled}
                />
                <Chip
                    label="Media (3)"
                    active={picoSel === "medio"}
                    onPress={() => onPico("medio")}
                    disabled={disabled}
                />
                <Chip
                    label="Picante (4–5)"
                    active={picoSel === "picante"}
                    onPress={() => onPico("picante")}
                    disabled={disabled}
                />
            </ScrollView>
        </View>
    );
}

function Chip({
    label,
    active,
    onPress,
    disabled,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
    disabled?: boolean;
}) {
    const { colors } = useThemeColors();
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.chip,
                {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                    shadowColor: colors.text,
                    opacity: disabled ? 0.45 : 1,
                },
            ]}
        >
            <Text
                style={[
                    styles.chipText,
                    { color: active ? "#fff" : colors.subtitle },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 2,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 50,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    chipText: { fontSize: 14, fontWeight: "800" },
});
