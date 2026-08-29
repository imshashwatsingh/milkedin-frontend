import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import type { Period } from '@/services/api/export';
import { downloadExport } from '@/services/api/export';
import { saveFile } from '@/utils/exporters';
import { colors, radii, spacing } from '@/theme';

import { Button } from '../ui/Button';
import { Text } from '../ui/Text';
import { PressScale } from '../ui/Anim';

interface ExportSheetProps {
  visible: boolean;
  period: Period;
  onClose: () => void;
}

type Busy = null | 'pdf' | 'excel';

/**
 * Modal that lets the user export the current period as PDF or Excel.
 * The file is generated on the backend (which already has the user's
 * records) and streamed back; we then save/share it on the device.
 */
export function ExportSheet({ visible, period, onClose }: ExportSheetProps) {
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);

  const runExport = async (kind: 'pdf' | 'excel') => {
    setBusy(kind === 'pdf' ? 'pdf' : 'excel');
    setError(null);
    try {
      const { bytes, filename, mime } = await downloadExport(kind, period);
      await saveFile({ filename, mime, bytes });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the file. Please try again.');
      setBusy(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close export">
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabber} />
          <Text variant="sectionTitle" center>
            Export {period.label}
          </Text>
          <Text variant="body" color={colors.textMuted} center>
            Choose a format to download your {period.label} records.
          </Text>

          <View style={styles.options}>
            <PressScale
              onPress={() => void runExport('pdf')}
              disabled={busy !== null}
              style={styles.option}
              accessibilityLabel="Download as PDF">
              <View style={[styles.optionIcon, { backgroundColor: colors.dangerSoft }]}>
                <Text variant="bodyStrong" color={colors.danger}>
                  PDF
                </Text>
              </View>
              <Text variant="bodyStrong">PDF report</Text>
              <Text variant="small" color={colors.textMuted}>
                Clean, printable summary
              </Text>
            </PressScale>

            <PressScale
              onPress={() => void runExport('excel')}
              disabled={busy !== null}
              style={styles.option}
              accessibilityLabel="Download as Excel">
              <View style={[styles.optionIcon, { backgroundColor: colors.successSoft }]}>
                <Text variant="bodyStrong" color={colors.success}>
                  XLS
                </Text>
              </View>
              <Text variant="bodyStrong">Excel sheet</Text>
              <Text variant="small" color={colors.textMuted}>
                Full data for analysis
              </Text>
            </PressScale>
          </View>

          {error ? (
            <Text variant="body" color={colors.danger} center accessibilityRole="alert">
              {error}
            </Text>
          ) : null}

          <Button label="Cancel" variant="outline" onPress={onClose} loading={busy !== null} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surfaceBorder,
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  option: {
    flex: 1,
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    opacity: 1,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
