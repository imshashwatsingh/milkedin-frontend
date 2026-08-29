import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

import { Text } from './Text';

/**
 * Full-screen success confirmation shown briefly after a save before
 * navigating back. Renders instead of the form.
 */
export function SavedOverlay({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.circle}>
        <Text style={styles.check} color={colors.onPrimary}>
          ✓
        </Text>
      </View>
      <Text variant="screenTitle" center>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="body" color={colors.textMuted} center>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: colors.background,
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  check: {
    fontSize: 52,
    lineHeight: 52,
    fontWeight: '800',
  },
});