import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

interface ErrorViewProps {
  /** Friendly message shown to the user. */
  message: string;
  onRetry?: () => void;
  /** Secondary button label if different from "Try Again". */
  retryLabel?: string;
}

/** Friendly error state with a clear Try Again action. */
export function ErrorView({ message, onRetry, retryLabel = 'Try Again' }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} accessibilityIgnoresInvertColors />
      <Text variant="sectionTitle" center>
        Couldn&apos;t load your data.
      </Text>
      <Text variant="body" color={colors.textMuted} center>
        {message}
      </Text>
      {onRetry ? (
        <View style={styles.buttonWrap}>
          <Button label={retryLabel} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  buttonWrap: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
});