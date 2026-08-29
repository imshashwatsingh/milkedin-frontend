import { DefaultTheme } from 'expo-router';

import { colors } from './index';

/** Navigation theme matching the app's white, calm design. */
export const navTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.surfaceBorder,
    notification: colors.danger,
  },
};