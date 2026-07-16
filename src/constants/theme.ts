import { Platform } from 'react-native';

export interface ThemeColorsType {
  readonly primary: string;
  readonly primaryLight: string;
  readonly background: string;
  readonly card: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly border: string;
  readonly success: string;
  readonly danger: string;
  readonly warning: string;
  readonly info: string;
  readonly accent: string;
  readonly cardElevated: string;
  readonly shadow: string;
}

export const Colors = {
  light: {
    primary: '#6366F1', // Premium Indigo
    primaryLight: '#EEF2F6',
    background: '#F9FAFB', // Soft off-white
    card: '#FFFFFF',
    text: '#111827', // Slate 900
    textSecondary: '#6B7280', // Slate 500
    border: '#E5E7EB', // Slate 200
    success: '#10B981', // Emerald Green
    danger: '#EF4444', // Red
    warning: '#F59E0B', // Amber
    info: '#3B82F6', // Blue
    accent: '#8B5CF6', // Violet
    cardElevated: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    primary: '#818CF8', // Bright Indigo
    primaryLight: '#1E1B4B',
    background: '#0B0F19', // Dark rich navy/slate
    card: '#151D30', // Elevated blue-grey card
    text: '#F9FAFB', // Slate 50
    textSecondary: '#9CA3AF', // Slate 400
    border: '#1F293D', // Slate 800
    success: '#34D399', // Mint Green
    danger: '#F87171', // Soft Red
    warning: '#FBBF24', // Yellow
    info: '#60A5FA', // Sky Blue
    accent: '#A78BFA', // Violet Accent
    cardElevated: '#1E293B',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
} as const;


export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    rounded: 'System',
  },
  default: {
    sans: 'sans-serif',
    rounded: 'sans-serif-condensed',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
