import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Accessible confirmation dialog used before any destructive action.
 * Uses React Native's Modal so it works identically on Android/iOS/web.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Close dialog">
        <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
          <Text variant="sectionTitle" center>
            {title}
          </Text>
          <Text variant="body" color={colors.textMuted} center>
            {message}
          </Text>
          <View style={styles.actions}>
            <Button
              label={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              accessibilityLabel={confirmLabel}
            />
            <Button label={cancelLabel} variant="outline" onPress={onCancel} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    alignSelf: 'stretch',
    maxWidth: 460,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});