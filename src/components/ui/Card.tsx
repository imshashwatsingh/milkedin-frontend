import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Alternate background (soft warm tint) for emphasis cards. */
  variant?: 'default' | 'warm' | 'soft';
}

/** Rounded, softly-elevated panel used for all groupings on screen. */
export function Card({ children, style, variant = 'default' }: CardProps) {
  const background = variant === 'warm' ? colors.surfaceAlt : colors.surface;
  return (
    <View
      style={[
        styles.card,
        shadows.md,
        {
          backgroundColor: background,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
});