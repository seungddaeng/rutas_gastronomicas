export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius  = { sm: 8, md: 12, lg: 16, xl: 20 } as const;

export const palette = {
  light: {
    background: '#ffffff',
    surface: '#f7f7f9',
    text: '#0f172a',
    subtitle: '#475569',
    primary: '#B56531',
    muted: '#7B7F85',
    border: '#E6E6EA',
    tabBarBackground: '#ffffff',
    drawerBackground: '#ffffff',
    switchTrackOn: '#D28C5C',
    switchTrackOff: '#94a3b8',
    switchThumb: '#f8fafc',
    shadow: 'rgba(0,0,0,0.08)',
  },
  dark: {
    background: '#0b0b10',
    surface: '#171720',
    text: '#F7F7F7',
    subtitle: '#cbd5f5',
    primary: '#D28C5C',
    muted: '#A3A7AE',
    border: '#2C2D35',
    tabBarBackground: '#171720',
    drawerBackground: '#0f172a',
    switchTrackOn: '#D28C5C',
    switchTrackOff: '#475569',
    switchThumb: '#1e293b',
    shadow: 'rgba(0,0,0,0.35)',
  },
} as const;

export type Theme = keyof typeof palette;
export type ThemeColors = (typeof palette)[Theme];
