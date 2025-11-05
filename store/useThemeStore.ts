import { Appearance } from 'react-native';
import { create } from 'zustand';

import type { Theme } from '../theme/tokens';

const initialTheme: Theme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';

type ThemeStore = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((prev) => ({
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    })),
  setTheme: (theme) => set({ theme }),
}));
