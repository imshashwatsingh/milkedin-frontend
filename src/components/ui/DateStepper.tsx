import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';
import { formatDateLong, isToday } from '@/utils/date';

import { Text } from './Text';

interface DateStepperProps {
  date: Date;
  onPrevious: () => void;
  onNext: () => void;
  canGoForward?: boolean;
}

/**
 * Big, obvious date picker that works with a single tap on ‹ › arrows.
 * This is much friendlier than a dense calendar for touch input.
 */
export function DateStepper({ date, onPrevious, onNext, canGoForward = true }: DateStepperProps) {
  const atToday = isToday(toKey(date));
  const disableNext = !canGoForward || atToday;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous day"
        onPress={onPrevious}
        style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}>
        <Ionicons name="chevron-back" size={30} color={colors.primary} accessibilityIgnoresInvertColors />
      </Pressable>

      <View style={styles.dateWrap} accessible accessibilityLabel={`Date: ${formatDateLong(date)}`}>
        <Text variant="sectionTitle" center style={styles.dateText}>
          {formatDateLong(date)}
        </Text>
        {atToday ? (
          <Text variant="caption" color={colors.primary}>
            Today
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next day"
        accessibilityState={{ disabled: disableNext }}
        disabled={disableNext}
        onPress={onNext}
        style={({ pressed }) => [
          styles.arrow,
          disableNext && styles.disabled,
          pressed && !disableNext && styles.pressed,
        ]}>
        <Ionicons name="chevron-forward" size={30} color={colors.primary} accessibilityIgnoresInvertColors />
      </Pressable>
    </View>
  );
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  arrow: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  pressed: {
    backgroundColor: colors.primarySoft,
  },
  disabled: {
    opacity: 0.3,
  },
  dateWrap: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontSize: typography.sectionTitle.fontSize,
  },
});