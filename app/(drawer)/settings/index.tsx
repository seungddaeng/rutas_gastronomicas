import React from 'react';
import { Stack } from 'expo-router';
import {
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useThemeStore } from '../../../store/useThemeStore';
import type { ThemeColors } from '../../../theme/tokens';
import { spacing, radius } from '../../../theme/tokens';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { platos as MOCKS } from '../../../data/platos';

export default function SettingsScreen() {
  const { theme, colors } = useThemeColors();
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Configuración' }} />
      <Text style={styles.title}>Apariencia</Text>

      <View style={styles.preferenceRow}>
        <Text style={styles.preferenceLabel}>Modo oscuro</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
          thumbColor={theme === 'dark' ? colors.switchThumb : '#f4f4f5'}
        />
      </View>

      <Text style={styles.helperText}>
        Por defecto se usa el tema del sistema del dispositivo.
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.xl,
      backgroundColor: colors.background,
      gap: spacing.md,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    preferenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },
    preferenceLabel: {
      fontSize: 18,
      color: colors.text,
      fontWeight: '500',
    },
    helperText: {
      fontSize: 14,
      color: colors.subtitle,
      lineHeight: 20,
    },
  });