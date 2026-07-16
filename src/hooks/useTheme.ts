import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { Colors, ThemeColorsType } from '../constants/theme';

export function useTheme() {
  const systemScheme = useColorScheme();
  const themeSetting = useSettingsStore((state) => state.settings.theme);

  const activeTheme: 'light' | 'dark' =
    themeSetting === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : themeSetting;

  const colors: ThemeColorsType = Colors[activeTheme];

  return {
    colors,
    theme: activeTheme,
    isDark: activeTheme === 'dark',
  };
}
