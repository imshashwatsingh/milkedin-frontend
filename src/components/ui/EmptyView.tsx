import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

interface EmptyViewProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

/** Thoughtful empty state, never a blank screen. */
export function EmptyView({ title, message, actionLabel, onAction, icon = 'water-outline' }: EmptyViewProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={52} color={colors.textSoft} accessibilityIgnoresInvertColors />
      <Text variant="sectionTitle" center>
        {title}
      </Text>
      <Text variant="body" color={colors.textMuted} center>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <View style={styles.buttonWrap}>
          <Button label={actionLabel} onPress={onAction} />
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