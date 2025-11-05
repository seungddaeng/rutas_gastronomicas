import { router } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, radius } from "../../theme/tokens";
import { useState } from "react";
import { signUpEmail } from "../../services/auth";

export default function RegisterScreen() {
  const { colors } = useThemeColors();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    setErr(null);
    if (!email || !pass) { setErr("Ingresa email y contraseña."); return; }
    if (pass.length < 6) { setErr("La contraseña debe tener mínimo 6 caracteres."); return; }
    if (pass !== pass2) { setErr("Las contraseñas no coinciden."); return; }
    try {
      setLoading(true);
      await signUpEmail(email.trim(), pass, displayName.trim() || undefined);
      router.replace("/(drawer)/(tabs)");
    } catch (e: any) {
      const msg = e?.message?.toString?.() ?? "Error al registrarse.";
      setErr(
        msg.includes("auth/email-already-in-use") ? "Ese email ya está registrado." :
        msg.includes("auth/invalid-email") ? "Email inválido." :
        msg.includes("auth/weak-password") ? "La contraseña es muy débil (mínimo 6)." :
        msg
      );
    } finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Crear cuenta</Text>

      <View style={styles.form}>
        {err ? <Text style={{ color: "#d00", marginBottom: spacing.xs }}>{err}</Text> : null}

        <TextInput
          placeholder="Nombre (opcional)"
          placeholderTextColor={colors.muted}
          value={displayName}
          onChangeText={setDisplayName}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        />

        <View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection:"row", alignItems:"center" }]}>
          <TextInput
            placeholder="Contraseña (mín. 6)"
            placeholderTextColor={colors.muted}
            secureTextEntry={!show1}
            value={pass}
            onChangeText={setPass}
            style={{ flex:1, color: colors.text }}
          />
          <TouchableOpacity onPress={() => setShow1(s => !s)} hitSlop={10}>
            <Ionicons name={show1 ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection:"row", alignItems:"center" }]}>
          <TextInput
            placeholder="Confirmar contraseña"
            placeholderTextColor={colors.muted}
            secureTextEntry={!show2}
            value={pass2}
            onChangeText={setPass2}
            style={{ flex:1, color: colors.text }}
          />
          <TouchableOpacity onPress={() => setShow2(s => !s)} hitSlop={10}>
            <Ionicons name={show2 ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onRegister} activeOpacity={0.9}
          style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.text, opacity: loading ? 0.7 : 1 }]}>
          <Ionicons name="person-add-outline" size={22} color="#fff" />
          <Text style={styles.buttonText}>{loading ? "Creando..." : "Crear cuenta"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{ alignSelf:"center", marginTop: spacing.md }}>
          <Text style={{ color: colors.primary, fontWeight:"700" }}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding: spacing.md, justifyContent:'center' },
  title:{ fontSize:22, fontWeight:"800", marginBottom: spacing.md },
  form:{ gap: spacing.sm },
  input:{ borderRadius: radius.md, padding: spacing.md, borderWidth:1 },
  button:{ borderRadius: radius.md, padding: spacing.md, alignItems:"center", flexDirection:"row",
    gap:8, justifyContent:"center" },
  buttonText:{ color:"#fff", fontWeight:"700" },
});
