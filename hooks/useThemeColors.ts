import { useThemeStore } from '../store/useThemeStore';
import { palette } from '../theme/tokens';

export const useThemeColors = () => {
  const theme = useThemeStore((state) => state.theme);
  return { theme, colors: palette[theme] };
};