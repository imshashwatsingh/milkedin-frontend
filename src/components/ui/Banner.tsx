import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Text } from './Text';

/** Compact, large success banner. Only used to confirm completed actions. */
export function SuccessBanner({ message }: { message: string }) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Ionicons name="checkmark-circle" size={26} color={colors.success} accessibilityIgnoresInvertColors />
      <Text variant="bodyStrong" color={colors.success} style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

/** Compact error banner for form-level errors (e.g. failed login). */
export function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={[styles.banner, styles.errorBanner]} accessibilityRole="alert">
      <Ionicons name="alert-circle" size={26} color={colors.danger} accessibilityIgnoresInvertColors />
      <Text variant="bodyStrong" color={colors.danger} style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.successSoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  errorBanner: {
    backgroundColor: colors.dangerSoft,
  },
  text: {
    flex: 1,
  },
});