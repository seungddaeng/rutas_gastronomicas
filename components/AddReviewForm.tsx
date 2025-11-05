import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { spacing, radius } from "../theme/tokens";
import { createReview } from "../services/reviews";
import { useUserStore } from "../store/useUserStore";

export default function AddReviewForm({ platoId }: { platoId: string }) {
  const { colors } = useThemeColors();
  const styles = getStyles(colors);
  const user = useUserStore((s) => s.user);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentMsg, setSentMsg] = useState<null | string>(null);

  const submit = async () => {
    if (!user || submitting || !rating) return;
    try {
      setSubmitting(true);
      await createReview({
        platoId,
        userUid: user.uid,
        userDisplayName: user.displayName || user.email || "Usuario",
        rating,
        comment: comment.trim() || undefined,
      });

      setRating(5);
      setComment("");
      setSentMsg("¡Gracias! Tu reseña quedó pendiente de aprobación.");
      setTimeout(() => setSentMsg(null), 3000);
    } catch (e: any) {
      setSentMsg(e?.message ?? "Error al enviar.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loginText}>Inicia sesión para dejar una reseña.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Añadir reseña</Text>

      <View style={styles.rowWrap}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => setRating(n)}
            style={[styles.starChip, rating === n && styles.starChipSelected]}
            accessibilityRole="button"
            accessibilityLabel={`Elegir ${n} ${n === 1 ? "estrella" : "estrellas"}`}
          >
            <Text style={styles.starText}>{"★".repeat(n)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Escribe tu comentario (opcional)"
        placeholderTextColor={colors.muted}
        style={styles.input}
        multiline
      />

      <TouchableOpacity
        onPress={submit}
        disabled={submitting}
        style={[styles.btn, submitting && styles.btnDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Enviar reseña"
      >
        <Text style={styles.btnText}>
          {submitting ? "Enviando..." : "Enviar reseña"}
        </Text>
      </TouchableOpacity>

      {!!sentMsg && <Text style={styles.sentMsg}>{sentMsg}</Text>}

      <Text style={styles.note}>
        * La reseña quedará como "pendiente" hasta que un admin la apruebe.
      </Text>
    </View>
  );
}

const getStyles = (colors: ReturnType<typeof useThemeColors>["colors"]) =>
  StyleSheet.create({
    container: { marginTop: spacing.md },
    loginText: { color: colors.muted },
    title: { color: colors.muted, marginBottom: spacing.xs, fontWeight: "700" },

    rowWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    starChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    starChipSelected: {
      borderColor: colors.text,
    },
    starText: {
      fontSize: 13,
      fontWeight: "700",
      includeFontPadding: false,
      textAlign: "center",
      color: colors.text,
    },

    input: {
      minHeight: 88,
      borderWidth: 1,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      textAlignVertical: "top",
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
    },

    btn: {
      alignSelf: "flex-start",
      marginTop: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: colors.text, fontWeight: "700" },

    sentMsg: { color: colors.muted, marginTop: spacing.xs, fontSize: 12, fontStyle: "italic" },
    note: { color: colors.muted, marginTop: spacing.xs, fontSize: 12 },
  });
