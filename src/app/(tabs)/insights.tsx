import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import type { Period, PeriodType } from '@/services/api/export';
import { fetchPeriodRecords } from '@/services/api/export';
import { computeAnalytics } from '@/utils/analytics';
import { useApiData } from '@/hooks/useApiData';
import { useResponsive } from '@/hooks/useResponsive';
import { colors, radii, spacing } from '@/theme';
import { formatDateLong, parseDateKey } from '@/utils/date';
import { formatLitres, formatRupees, toNumber } from '@/utils/format';

import { Card } from '@/components/ui/Card';
import { ErrorView } from '@/components/ui/ErrorView';
import { FadeInView, PressScale } from '@/components/ui/Anim';
import { LoadingView } from '@/components/ui/LoadingView';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { ExportSheet } from '@/components/export/ExportSheet';
import { StatTile } from '@/components/analytics/StatTile';
import { HorizontalBars, VerticalBars, type BarItem } from '@/components/analytics/BarChart';
import { EmptyView } from '@/components/ui/EmptyView';

const CATEGORY_COLORS = [
  colors.primary,
  colors.success,
  colors.warning,
  '#7C5CFC',
  '#E0609B',
  '#2BB6C4',
  '#D98324',
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function currentPeriod(type: PeriodType): Period {
  const now = new Date();
  if (type === 'month') {
    return {
      type,
      value: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`,
      label: now.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
    };
  }
  return { type, value: String(now.getFullYear()), label: String(now.getFullYear()) };
}

function shiftPeriod(period: Period, delta: number): Period {
  if (period.type === 'month') {
    const [y, m] = period.value.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return {
      type: 'month',
      value: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`,
      label: d.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
    };
  }
  const year = Number(period.value) + delta;
  return { type: 'year', value: String(year), label: String(year) };
}

export default function InsightsScreen() {
  const [type, setType] = useState<PeriodType>('month');
  const [period, setPeriod] = useState<Period>(() => currentPeriod('month'));
  const [exportVisible, setExportVisible] = useState(false);
  const { isDesktop } = useResponsive();

  const data = useApiData(
    useCallback(() => fetchPeriodRecords(period), [period.type, period.value]),
  );

  const analytics = useMemo(() => computeAnalytics(data.data ?? []), [data.data]);

  const trendItems: BarItem[] =
    period.type === 'month'
      ? analytics.daily.map((day) => ({
          label: String(parseDateKey(day.dateKey).getDate()),
          value: day.quantity,
          display: formatLitres(day.quantity),
        }))
      : analytics.byMonth.map((month) => ({
          label: month.label.split(' ')[0],
          value: month.quantity,
          display: formatLitres(month.quantity),
        }));

  const categoryItems: BarItem[] = analytics.byCategory.map((cat, index) => ({
    label: cat.category,
    value: cat.amount,
    display: formatRupees(cat.amount),
    sub: `${Math.round(cat.share * 100)}% of spend`,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  const setTypeAndReset = (next: PeriodType) => {
    setType(next);
    setPeriod(currentPeriod(next));
  };

  const showEmpty = !data.loading && !data.error && (data.data?.length ?? 0) === 0;

  return (
    <Screen title="Insights" subtitle="Your milk, measured and understood">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => data.refetch()}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.toggle}>
          <PressScale
            onPress={() => setTypeAndReset('month')}
            accessibilityLabel="View by month"
            style={[styles.togglePill, type === 'month' && styles.toggleActive]}
            scale={0.97}>
            <Text variant="bodyStrong" color={type === 'month' ? colors.onPrimary : colors.textMuted}>
              Month
            </Text>
          </PressScale>
          <PressScale
            onPress={() => setTypeAndReset('year')}
            accessibilityLabel="View by year"
            style={[styles.togglePill, type === 'year' && styles.toggleActive]}
            scale={0.97}>
            <Text variant="bodyStrong" color={type === 'year' ? colors.onPrimary : colors.textMuted}>
              Year
            </Text>
          </PressScale>
        </View>

        <View style={styles.periodNav}>
          <PressScale onPress={() => setPeriod(shiftPeriod(period, -1))} accessibilityLabel="Previous period" scale={0.9}>
            <Text variant="bodyStrong" color={colors.primary}>
              ‹
            </Text>
          </PressScale>
          <Text variant="sectionTitle">{period.label}</Text>
          <PressScale onPress={() => setPeriod(shiftPeriod(period, 1))} accessibilityLabel="Next period" scale={0.9}>
            <Text variant="bodyStrong" color={colors.primary}>
              ›
            </Text>
          </PressScale>
        </View>

        {data.loading && !data.data ? (
          <LoadingView />
        ) : data.error ? (
          <ErrorView message={data.error} onRetry={data.refetch} />
        ) : showEmpty ? (
          <EmptyView
            title="No milk logged yet"
            message={`Once you record milk in ${period.label}, your insights will appear here.`}
          />
        ) : (
          <>
            <FadeInView delay={0}>
              <View style={[styles.statGrid, isDesktop && styles.statGridDesktop]}>
                <StatTile
                  icon="water"
                  label="Total milk"
                  value={formatLitres(analytics.totalQuantity)}
                  sub={`${analytics.entryCount} entries`}
                />
                <StatTile
                  icon="wallet"
                  label="Total spent"
                  value={formatRupees(analytics.totalAmount)}
                  sub={period.label}
                  accent={colors.successSoft}
                  iconColor={colors.success}
                />
                <StatTile
                  icon="calendar"
                  label="Active days"
                  value={String(analytics.activeDays)}
                  sub="days logged"
                  accent={colors.warningSoft}
                  iconColor={colors.warning}
                />
                <StatTile
                  icon="trending-up"
                  label="Avg / day"
                  value={formatLitres(analytics.avgPerActiveDay)}
                  sub="per active day"
                />
              </View>
            </FadeInView>

            <View style={isDesktop ? styles.desktopTwoCol : undefined}>
              <View style={isDesktop ? styles.desktopCol : undefined}>
                <FadeInView delay={80}>
                  <Card style={styles.streakCard}>
                    <View style={styles.streakRow}>
                      <View style={styles.streakItem}>
                        <Text variant="huge" color={colors.primary}>
                          {analytics.currentStreak}
                        </Text>
                        <Text variant="caption" color={colors.textMuted}>
                          day streak
                        </Text>
                      </View>
                      <View style={styles.streakDivider} />
                      <View style={styles.streakItem}>
                        <Text variant="huge">{analytics.longestStreak}</Text>
                        <Text variant="caption" color={colors.textMuted}>
                          longest streak
                        </Text>
                      </View>
                      <View style={styles.streakDivider} />
                      <View style={styles.streakItem}>
                        <Text variant="huge">{analytics.bestDay ? formatLitres(analytics.bestDay.quantity) : '—'}</Text>
                        <Text variant="caption" color={colors.textMuted}>
                          best day
                        </Text>
                      </View>
                    </View>
                    {analytics.bestDay ? (
                      <Text variant="small" color={colors.textSoft} center>
                        Best day: {formatDateLong(parseDateKey(analytics.bestDay.dateKey))}
                      </Text>
                    ) : null}
                  </Card>
                </FadeInView>

                <FadeInView delay={140}>
                  <Card style={styles.section}>
                    <Text variant="sectionTitle">
                      {period.type === 'month' ? 'Milk per day' : 'Milk per month'}
                    </Text>
                    <VerticalBars
                      items={trendItems}
                      emptyLabel={`No milk logged in ${period.label}`}
                    />
                  </Card>
                </FadeInView>
              </View>

              <View style={isDesktop ? styles.desktopCol : undefined}>
                <FadeInView delay={200}>
                  <Card style={styles.section}>
                    <Text variant="sectionTitle">Spending by milk type</Text>
                    {categoryItems.length > 0 ? (
                      <HorizontalBars items={categoryItems} />
                    ) : (
                      <Text variant="body" color={colors.textMuted} center>
                        No spending to show yet.
                      </Text>
                    )}
                  </Card>
                </FadeInView>

                <PressScale
                  onPress={() => setExportVisible(true)}
                  accessibilityLabel="Export this period"
                  scale={0.98}>
                  <Card style={styles.exportCard}>
                    <Text variant="bodyStrong" color={colors.primary}>
                      Export {period.label}
                    </Text>
                    <Text variant="caption" color={colors.textMuted}>
                      Download as PDF or Excel
                    </Text>
                  </Card>
                </PressScale>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <ExportSheet visible={exportVisible} period={period} onClose={() => setExportVisible(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    padding: 4,
    gap: 4,
    maxWidth: 380,
    alignSelf: 'stretch',
  },
  togglePill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statGridDesktop: {
    gap: spacing.lg,
  },
  desktopTwoCol: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  desktopCol: {
    flex: 1,
    gap: spacing.lg,
  },
  streakCard: {
    borderWidth: 0,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  streakDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceBorder,
  },
  section: {
    gap: spacing.lg,
  },
  exportCard: {
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primarySoft,
  },
});
