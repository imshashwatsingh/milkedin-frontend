import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import type { MilkRecord } from '@/types';
import { colors, spacing } from '@/theme';
import { formatLitres, formatRupees, toNumber } from '@/utils/format';

import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

interface TodayStatusCardProps {
  hasRecord: boolean;
  records: MilkRecord[];
}

/**
 * The main card that answers: "Did I record today's milk?"
 * Uses icon + text (never colour alone) so the state is obvious.
 */
export function TodayStatusCard({ hasRecord, records }: TodayStatusCardProps) {
  const totalQuantity = records.reduce((sum, record) => sum + toNumber(record.quantity_liters), 0);
  const totalPrice = records.reduce((sum, record) => sum + toNumber(record.total_price), 0);

  const label = hasRecord ? 'Milk recorded today' : 'Milk not recorded yet';
  const icon = hasRecord ? 'checkmark-circle' : 'time-outline';
  const iconColor = hasRecord ? colors.success : colors.warning;

  return (
    <Card variant={hasRecord ? 'warm' : 'soft'} style={styles.card}>
      <View style={styles.statusRow}>
        <View style={[styles.iconCircle, { backgroundColor: hasRecord ? colors.successSoft : colors.warningSoft }]}>
          <Ionicons name={icon} size={34} color={iconColor} accessibilityIgnoresInvertColors />
        </View>
        <View style={styles.statusText}>
          <Text variant="bodyStrong">{label}</Text>
          {hasRecord ? (
            <Text variant="caption" color={colors.textMuted}>
              {records.length === 1 ? 'You bought milk today.' : `${records.length} entries today.`}
            </Text>
          ) : (
            <Text variant="caption" color={colors.textMuted}>
              Add it now while you remember.
            </Text>
          )}
        </View>
      </View>

      {hasRecord ? (
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text variant="huge" color={colors.text}>
              {formatLitres(totalQuantity)}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              Total quantity
            </Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text variant="huge" color={colors.text}>
              {formatRupees(totalPrice)}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              Total cost
            </Text>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    flex: 1,
    gap: spacing.xs,
  },
  details: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
    gap: spacing.xs,
  },
  detailDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: spacing.xl,
  },
});