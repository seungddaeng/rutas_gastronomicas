import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import { spacing, radius } from "../../../theme/tokens";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useUserStore } from "../../../store/useUserStore";
import { createRoute } from "../../../services/routes";
import { useRouter } from "expo-router";
import { useNiceAlert } from "../../../components/NiceAlert";

export default function CrearRuta() {
  const { colors } = useThemeColors();
  const user = useUserStore((s) => s.user);
  const router = useRouter();
  const alert = useNiceAlert();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [stopsText, setStopsText] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit() {
    if (!user?.uid) return;
    if (!title.trim()) {
      alert.info("Ups", "Ponle un título a tu ruta.");
      return;
    }
    try {
      setSaving(true);
      const stops = stopsText
        .split("→")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((label) => ({ label }));
      await createRoute({
        title: title.trim(),
        summary: summary.trim(),
        stops,
        userUid: user.uid,
        userDisplayName: user.displayName ?? user.email ?? "Anónimo",
        isPublic,
      });
      if (isPublic) {
        alert.success("Enviada", "Tu ruta fue enviada a aprobación.");
      } else {
        alert.success("Guardada", "Tu ruta quedó privada (solo tú la ves).");
      }
      router.back();
    } catch (e: any) {
      alert.error("Error", e?.message ?? "No se pudo crear la ruta.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <Text
        style={{
          color: colors.text,
          fontWeight: "700",
          fontSize: 16,
          marginBottom: spacing.sm,
        }}
      >
        Crear nueva ruta
      </Text>

      <Text style={{ color: colors.muted, marginBottom: 6 }}>Título</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Ej: Ruta clásica La Paz centro"
        placeholderTextColor={colors.muted}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.sm,
          color: colors.text,
          marginBottom: spacing.md,
        }}
      />

      <Text style={{ color: colors.muted, marginBottom: 6 }}>
        Resumen (opcional)
      </Text>
      <TextInput
        value={summary}
        onChangeText={setSummary}
        placeholder="Plaza Murillo → Mercado Lanza → Sopocachi"
        placeholderTextColor={colors.muted}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.sm,
          color: colors.text,
          marginBottom: spacing.md,
        }}
      />

      <Text style={{ color: colors.muted, marginBottom: 6 }}>
        Paradas (separa con “→”)
      </Text>
      <TextInput
        value={stopsText}
        onChangeText={setStopsText}
        placeholder="Plaza Murillo → Mercado Lanza → Sopocachi"
        placeholderTextColor={colors.muted}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.sm,
          color: colors.text,
          marginBottom: spacing.lg,
        }}
      />

      <View
        style={{
          marginBottom: spacing.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          backgroundColor: colors.surface,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing.sm,
        }}
      >
        <View style={{ flex: 1, paddingRight: spacing.sm }}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>
            Hacer pública
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            Si activas, se enviará a aprobación. Si no, quedará privada.
          </Text>
        </View>
        <Switch value={isPublic} onValueChange={setIsPublic} />
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={saving}
        style={{
          backgroundColor: colors.primary,
          padding: spacing.md,
          borderRadius: radius.md,
          opacity: saving ? 0.6 : 1,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", textAlign: "center" }}>
          {isPublic ? "Enviar a aprobación" : "Guardar solo para mí"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
