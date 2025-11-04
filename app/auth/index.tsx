import { router } from "expo-router";
import { Image, View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, radius } from "../../theme/tokens";
import { useState } from "react";
import { signInEmail, resetPassword, useGoogleAuth } from "../../services/auth";

export default function LoginScreen() {
  const { colors } = useThemeColors();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { request, promptAsync } = useGoogleAuth(() => {
    router.replace("/(drawer)/(tabs)");
  });

  const onLogin = async () => {
    setErr(null);
    setInfo(null);
    if (!email || !pass) { setErr("Ingresa email y contraseña."); return; }
    try {
      setLoading(true);
      await signInEmail(email.trim(), pass);
      router.replace("/(drawer)/(tabs)");
    } catch (e: any) {
      const msg = e?.message?.toString?.() ?? "Error al iniciar sesión.";
      setErr(msg.includes("auth/invalid-credential") ? "Credenciales inválidas." : msg);
    } finally { setLoading(false); }
  };

  const onForgot = async () => {
    setErr(null);
    setInfo(null);
    if (!email) { setErr("Escribe tu email para enviarte el enlace."); return; }
    try {
      await resetPassword(email.trim());
      setInfo("Te enviamos un enlace para restablecer tu contraseña.");
    } catch {
      setErr("No pudimos enviar el correo. Revisa el email ingresado.");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.logoWrap}>
            <View style={[styles.logoCard, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
              <Image
                source={require("../../assets/splash.png")}
                style={{ width: 60, height: 60, resizeMode: "contain" }}
              />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Rutas Gastronómicas</Text>
            <Text style={[styles.subtitle, { color: colors.subtitle }]}>Explora platos de La Paz.</Text>
          </View>

          <View style={styles.form}>
            {err ? <Text style={{ color: "#d00", marginBottom: spacing.xs }}>{err}</Text> : null}
            {info ? <Text style={{ color: "#0a7", marginBottom: spacing.xs }}>{info}</Text> : null}

            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              returnKeyType="next"
            />

            <View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection:"row", alignItems:"center" }]}>
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPass}
                value={pass}
                onChangeText={setPass}
                style={{ flex:1, color: colors.text }}
                returnKeyType="done"
                onSubmitEditing={onLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(s => !s)} hitSlop={10}>
                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={onLogin} activeOpacity={0.9}
              style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.text, opacity: loading ? 0.7 : 1 }]}>
              <Ionicons name="log-in-outline" size={22} color="#fff" />
              <Text style={styles.buttonText}>{loading ? "Ingresando..." : "Iniciar sesión"}</Text>
            </TouchableOpacity>

            <View style={{ flexDirection:"row", justifyContent:"center", gap:16, marginTop: spacing.xs }}>
              <TouchableOpacity onPress={onForgot}>
                <Text style={{ color: colors.primary, fontWeight:"700" }}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.muted }}>·</Text>
              <TouchableOpacity onPress={() => router.push("/auth/register")}>
                <Text style={{ color: colors.primary, fontWeight:"700" }}>Crear cuenta</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => promptAsync()} disabled={!request} style={[styles.btnOutline, { borderColor: colors.primary }]}>
              <Ionicons name="logo-google" size={18} color={colors.primary} />
              <Text style={[styles.btnOutlineText, { color: colors.primary }]}>Continuar con Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding: spacing.md, justifyContent:'center' },
  logoWrap:{ alignItems:"center", marginBottom: spacing.lg },
  logoCard:{ width:120, height:120, borderRadius: radius.xl, alignItems:"center", justifyContent:"center",
    shadowOpacity:0.1, shadowRadius:20, shadowOffset:{ width:0, height:10 }, elevation:8 },
  emoji:{ fontSize:60 },
  title:{ fontSize:22, fontWeight:"800", marginTop: spacing.sm },
  subtitle:{ marginTop: spacing.xs },
  form:{ gap: spacing.sm, paddingBottom: spacing.xl },
  input:{ borderRadius: radius.md, padding: spacing.md, borderWidth:1 },
  button:{ borderRadius: radius.md, padding: spacing.md, alignItems:"center", flexDirection:"row",
    gap:8, justifyContent:"center" },
  buttonText:{ color:"#fff", fontWeight:"700" },
  btnOutline:{ borderWidth:1, borderRadius: radius.md, paddingVertical: spacing.md, alignItems:'center',
    flexDirection:'row', gap:8, justifyContent:'center', marginTop: spacing.md },
  btnOutlineText:{ fontWeight:'700' }
});
