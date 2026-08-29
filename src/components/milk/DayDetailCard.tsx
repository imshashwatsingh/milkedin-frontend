import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import type { MilkRecord } from '@/types';
import { colors, radii, shadows, spacing } from '@/theme';
import { formatDateLong, parseDateKey } from '@/utils/date';
import { formatLitres, formatRupees, toNumber } from '@/utils/format';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { PressScale } from '../ui/Anim';

interface DayDetailCardProps {
  selectedKey: string;
  dayRecords: MilkRecord[];
  isToday: boolean;
  onEdit: (record: MilkRecord) => void;
  onAddForDay: (key: string) => void;
}

/** Shows all milk entries for the selected calendar day, with quick edit. */
export function DayDetailCard({ selectedKey, dayRecords, isToday, onEdit, onAddForDay }: DayDetailCardProps) {
  const parsed = parseDateKey(selectedKey);
  const totalQuantity = dayRecords.reduce((sum, r) => sum + toNumber(r.quantity_liters), 0);
  const totalAmount = dayRecords.reduce((sum, r) => sum + toNumber(r.total_price), 0);
  const hasEntries = dayRecords.length > 0;

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text variant="sectionTitle">{formatDateLong(parsed)}</Text>
          <Text variant="caption" color={colors.textMuted}>
            {isToday ? 'Today · ' : ''}
            {hasEntries ? `${dayRecords.length} entr${dayRecords.length === 1 ? 'y' : 'ies'}` : 'No entries yet'}
          </Text>
        </View>
        <PressScale
          onPress={() => onAddForDay(selectedKey)}
          accessibilityLabel="Add entry for this day"
          accessibilityHint="Record milk bought on this day"
          style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.onPrimary} />
        </PressScale>
      </View>

      {hasEntries ? (
        <View style={styles.entries}>
          {dayRecords.map((record) => (
            <View key={record.id} style={styles.entry}>
              <View style={styles.entryIcon}>
                <Ionicons name="water" size={20} color={colors.primary} />
              </View>
              <View style={styles.entryInfo}>
                <Text variant="bodyStrong">{record.category_name ?? 'Milk'}</Text>
                <Text variant="caption" color={colors.textMuted}>
                  {formatLitres(record.quantity_liters)} · {formatRupees(toNumber(record.price_per_liter))}/L
                </Text>
              </View>
              <View style={styles.entryRight}>
                <Text variant="bodyStrong">{formatRupees(toNumber(record.total_price))}</Text>
                <PressScale
                  onPress={() => onEdit(record)}
                  accessibilityLabel={`Edit ${record.category_name ?? 'Milk'} entry`}
                  accessibilityHint="Change quantity or price"
                  style={styles.editButton}>
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </PressScale>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="calendar-outline" size={28} color={colors.textSoft} />
          </View>
          <Text variant="body" color={colors.textMuted} center>
            Nothing logged for this day.
          </Text>
          <Button label="Add Entry" variant="outline" onPress={() => onAddForDay(selectedKey)} />
        </View>
      )}

      {hasEntries ? (
        <View style={styles.totalRow}>
          <View style={styles.totalLabel}>
            <Text variant="body" color={colors.textMuted}>
              Day total
            </Text>
            <Text variant="small" color={colors.textSoft}>
              {formatLitres(totalQuantity)}
            </Text>
          </View>
          <Text variant="huge" color={colors.primary}>
            {formatRupees(totalAmount)}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 0,
    backgroundColor: colors.surface,
    gap: spacing.lg,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headText: {
    gap: spacing.xs,
    flex: 1,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  entries: {
    gap: spacing.sm,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  entryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryInfo: {
    flex: 1,
    gap: 2,
  },
  entryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  editButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    gap: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: spacing.md,
  },
  totalLabel: {
    gap: 2,
  },
});
