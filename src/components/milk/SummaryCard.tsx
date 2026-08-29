import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { formatLitres, formatRupees } from '@/utils/format';

import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

interface SummaryCardProps {
  todayQuantity: number;
  todayCost: number;
  monthQuantity: number;
  monthCost: number;
  monthLabel: string;
}

/**
 * Three friendly numbers: today and current month totals. Only the fields
 * the backend actually supports are shown.
 */
export function SummaryCard({ todayQuantity, todayCost, monthQuantity, monthCost, monthLabel }: SummaryCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <SummaryStat label="Today" value={formatLitres(todayQuantity)} sub="milk bought" />
        <SummaryStat label="Today" value={formatRupees(todayCost)} sub="total cost" />
        <SummaryStat label={monthLabel} value={formatLitres(monthQuantity)} sub="this month" />
      </View>
    </Card>
  );
}

function SummaryStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="caption" color={colors.primary} style={styles.statLabel}>
        {label}
      </Text>
      <Text variant="bodyStrong" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
        {value}
      </Text>
      <Text variant="small" color={colors.textMuted}>
        {sub}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 0,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  statLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});