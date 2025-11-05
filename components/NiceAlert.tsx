import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../hooks/useThemeColors";
import { spacing, radius } from "../theme/tokens";

type Btn = {
  text: string;
  onPress?: () => void;
  variant?: "primary" | "ghost";
};
type AlertState = {
  visible: boolean;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
  actions: Btn[];
};

type Ctx = {
  show: (
    p: Partial<Omit<AlertState, "visible">> & Pick<AlertState, "title">
  ) => void;
  hide: () => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  confirm: (
    title: string,
    message?: string,
    okText?: string
  ) => Promise<boolean>;
};

const NiceAlertContext = createContext<Ctx | null>(null);

export function NiceAlertProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useThemeColors();
  const [st, setSt] = useState<AlertState>({
    visible: false,
    type: "info",
    title: "",
    message: "",
    actions: [],
  });

  const hide = useCallback(() => setSt((s) => ({ ...s, visible: false })), []);
  const show = useCallback(
    (p: Partial<Omit<AlertState, "visible">> & Pick<AlertState, "title">) => {
      setSt({
        visible: true,
        type: p.type ?? "info",
        title: p.title,
        message: p.message ?? "",
        actions: p.actions ?? [
          {
            text: "OK",
            variant: "primary",
            onPress: hide,
          },
        ],
      });
    },
    [hide]
  );

  const success = (title: string, message?: string) =>
    show({ type: "success", title, message });
  const error = (title: string, message?: string) =>
    show({ type: "error", title, message });
  const info = (title: string, message?: string) =>
    show({ type: "info", title, message });

  const confirm = (title: string, message?: string, okText = "Sí") =>
    new Promise<boolean>((resolve) => {
      show({
        type: "info",
        title,
        message,
        actions: [
          {
            text: "Cancelar",
            variant: "ghost",
            onPress: () => {
              hide();
              resolve(false);
            },
          },
          {
            text: okText,
            variant: "primary",
            onPress: () => {
              hide();
              resolve(true);
            },
          },
        ],
      });
    });

  const value = useMemo<Ctx>(
    () => ({ show, hide, success, error, info, confirm }),
    [show, hide]
  );

  const iconMap: Record<AlertState["type"], keyof typeof Ionicons.glyphMap> = {
    success: "checkmark-circle",
    error: "alert-circle",
    info: "information-circle",
  };

  const primary = colors.primary;
  const border = colors.border;

  return (
    <NiceAlertContext.Provider value={value}>
      {children}
      <Modal
        transparent
        visible={st.visible}
        animationType="fade"
        onRequestClose={hide}
      >
        <View style={styles.backdrop} />
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.header}>
            <Ionicons
              name={iconMap[st.type]}
              size={22}
              color={
                st.type === "success"
                  ? "#2ecc71"
                  : st.type === "error"
                  ? "#e74c3c"
                  : primary
              }
            />
            <Text style={[styles.title, { color: colors.text }]}>
              {st.title}
            </Text>
          </View>
          {!!st.message && (
            <Text style={[styles.message, { color: colors.subtitle }]}>
              {st.message}
            </Text>
          )}

          <View style={styles.actions}>
            {st.actions.map((b, i) => (
              <TouchableOpacity
                key={i}
                onPress={b.onPress}
                style={[
                  styles.btn,
                  b.variant === "primary"
                    ? { backgroundColor: primary }
                    : {
                        backgroundColor: colors.background,
                        borderColor: border,
                        borderWidth: 1,
                      },
                ]}
              >
                <Text
                  style={[
                    styles.btnText,
                    { color: b.variant === "primary" ? "#fff" : colors.text },
                  ]}
                >
                  {b.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </NiceAlertContext.Provider>
  );
}

export function useNiceAlert() {
  const ctx = useContext(NiceAlertContext);
  if (!ctx)
    throw new Error("useNiceAlert must be used inside <NiceAlertProvider>");
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0007",
  },
  card: {
    position: "absolute",
    left: "6%",
    right: "6%",
    top: "30%",
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.xs,
  },
  title: { fontSize: 16, fontWeight: "800" },
  message: { fontSize: 13, marginTop: 2 },
  actions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: spacing.md,
  },
  btn: {
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
  },
  btnText: { fontWeight: "700" },
});
