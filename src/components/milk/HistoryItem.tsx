import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { MilkRecord } from '@/types';
import { colors, radii, spacing } from '@/theme';
import { milkLogDateToKey, parseDateKey, formatDateLong } from '@/utils/date';
import { formatLitres, formatRupees, toNumber } from '@/utils/format';

import { Text } from '../ui/Text';

interface HistoryItemProps {
  record: MilkRecord;
  onPress: () => void;
}

/**
 * One row in the history list. Easy to scan: weekday + date on the left,
 * quantity and price on the right.
 */
export function HistoryItem({ record, onPress }: HistoryItemProps) {
  const dateKey = milkLogDateToKey(record.log_date);
  const parsed = parseDateKey(dateKey);
  const dateLabel = Number.isNaN(parsed.getTime()) ? dateKey : formatDateLong(parsed);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${dateLabel}, ${formatLitres(record.quantity_liters)}, ${formatRupees(record.total_price)}. Edit entry`}
      accessibilityHint="Opens this entry to edit or remove"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.iconCircle}>
        <Ionicons name="water" size={24} color={colors.primary} accessibilityIgnoresInvertColors />
      </View>

      <View style={styles.info}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {dateLabel}
        </Text>
        {record.category_name ? (
          <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
            {record.category_name}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text variant="bodyStrong">{formatLitres(record.quantity_liters)}</Text>
        <Text variant="caption" color={colors.textMuted}>
          {formatRupees(toNumber(record.total_price))}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={22} color={colors.textSoft} accessibilityIgnoresInvertColors />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
    marginRight: spacing.xs,
  },
});