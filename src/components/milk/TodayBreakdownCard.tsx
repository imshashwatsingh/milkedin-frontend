import { StyleSheet, View } from 'react-native';

import type { MilkRecord } from '@/types';
import { colors, radii, spacing } from '@/theme';
import { formatLitres, formatRupees } from '@/utils/format';
import { summarizeByCategory } from '@/utils/records';

import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

interface TodayBreakdownCardProps {
  records: MilkRecord[];
}

/**
 * "Today's Breakdown" — the complete picture for the day:
 *  - today's total quantity and total cost
 *  - which categories/products were added, with each one's quantity, cost and
 *    a proportion bar showing its share of the day's spend.
 */
export function TodayBreakdownCard({ records }: TodayBreakdownCardProps) {
  if (records.length === 0) return null;

  const groups = summarizeByCategory(records);
  const totalQuantity = groups.reduce((sum, g) => sum + g.quantity, 0);
  const totalCost = groups.reduce((sum, g) => sum + g.cost, 0);
  const maxCost = Math.max(1, ...groups.map((g) => g.cost));

  return (
    <Card variant="soft" style={styles.card}>
      <View style={styles.header}>
        <Text variant="sectionTitle">Today&apos;s Breakdown</Text>
        <Text variant="caption" color={colors.textMuted}>
          {groups.length} {groups.length === 1 ? 'type' : 'types'}
        </Text>
      </View>

      <View style={styles.totals}>
        <View style={styles.totalItem}>
          <Text variant="huge" color={colors.text}>
            {formatLitres(totalQuantity)}
          </Text>
          <Text variant="small" color={colors.textMuted}>
            total quantity
          </Text>
        </View>
        <View style={styles.totalDivider} />
        <View style={styles.totalItem}>
          <Text variant="huge" color={colors.text}>
            {formatRupees(totalCost)}
          </Text>
          <Text variant="small" color={colors.textMuted}>
            total cost
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {groups.map((group) => (
          <View key={group.category} style={styles.row}>
            <View style={styles.rowTop}>
              <Text variant="bodyStrong" numberOfLines={1}>
                {group.category}
              </Text>
              <Text variant="small" color={colors.textMuted}>
                {group.count} {group.count === 1 ? 'entry' : 'entries'}
              </Text>
            </View>

            <View style={styles.rowValues}>
              <Text variant="caption" color={colors.textMuted}>
                {formatLitres(group.quantity)}
              </Text>
              <Text variant="bodyStrong">{formatRupees(group.cost)}</Text>
            </View>

            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(group.cost / maxCost) * 100}%` },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  totals: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.xl,
  },
  totalItem: {
    gap: spacing.xs,
  },
  totalDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginBottom: spacing.xs,
  },
  list: {
    gap: spacing.lg,
  },
  row: {
    gap: spacing.xs,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  barTrack: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceBorder,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  barFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
});
