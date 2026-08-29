import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { Text } from './Text';

/** Centered loading state with an optional friendly message. */
export function LoadingView({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="body" color={colors.textMuted}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xxxl,
  },
});