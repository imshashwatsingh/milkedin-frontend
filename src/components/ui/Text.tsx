import { StyleSheet, Text as RNText, type TextProps } from 'react-native';

import { colors, typography } from '@/theme';

type TextVariant = keyof typeof typography;

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  center?: boolean;
}

export function Text({ variant = 'body', color = colors.text, center, style, ...rest }: AppTextProps) {
  return (
    <RNText
      accessibilityRole="text"
      style={[styles.base, typography[variant], center && styles.center, { color }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
  center: {
    textAlign: 'center',
  },
});