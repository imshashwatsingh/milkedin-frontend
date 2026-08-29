import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme';

import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Makes the button fill its container width. */
  fullWidth?: boolean;
  /** Shows a spinner and disables presses while true. */
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

/**
 * Large, high-contrast button with a generous touch target. The main call
 * to action uses `variant="primary"`.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  fullWidth = true,
  loading = false,
  disabled = false,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';

  const backgroundColor = isPrimary
    ? colors.primary
    : isSecondary
      ? colors.primarySoft
      : isOutline || isGhost
        ? 'transparent'
        : colors.danger;

  const textColor = isPrimary || isDanger ? colors.onPrimary : isGhost ? colors.textMuted : colors.primary;

  const pressedBackground = isPrimary ? colors.primaryPressed : backgroundColor;

  const disabledState = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabledState, busy: loading }}
      disabled={disabledState}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary || isDanger ? shadows.sm : undefined,
        {
          backgroundColor: pressed && !disabledState ? pressedBackground : backgroundColor,
          borderWidth: isOutline ? 2 : 0,
          borderColor: isOutline ? colors.primary : undefined,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={isPrimary || isDanger ? colors.onPrimary : colors.primary}
          size="large"
        />
      ) : (
        <Text variant="bodyStrong" color={textColor} style={!isGhost && styles.label}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 64,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    letterSpacing: 0.2,
  },
});