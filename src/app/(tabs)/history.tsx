import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Calendar, type DayMilkInfo } from '@/components/calendar/Calendar';
import { DayDetailCard } from '@/components/milk/DayDetailCard';
import { Card } from '@/components/ui/Card';
import { ErrorView } from '@/components/ui/ErrorView';
import { FadeInView, PressScale } from '@/components/ui/Anim';
import { LoadingView } from '@/components/ui/LoadingView';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { ExportSheet } from '@/components/export/ExportSheet';
import type { Period } from '@/services/api/export';
import { getMonthlySummary, getRecords } from '@/services/api/milk';
import { useApiData } from '@/hooks/useApiData';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { useResponsive } from '@/hooks/useResponsive';
import { colors, spacing } from '@/theme';
import { formatMonthYear, milkLogDateToKey, monthKeyOf, toDateKey } from '@/utils/date';
import { formatLitres, formatRupees, toNumber } from '@/utils/format';
import type { MilkRecord } from '@/types';

function startOfMonthView(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function HistoryScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const todayKey = toDateKey(new Date());
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [viewMonthDate, setViewMonthDate] = useState<Date>(startOfMonthView(new Date()));
  const [exportVisible, setExportVisible] = useState(false);

  const monthKey = monthKeyOf(viewMonthDate);

  const monthStart = toDateKey(new Date(viewMonthDate.getFullYear(), viewMonthDate.getMonth(), 1));
  const monthEnd = toDateKey(new Date(viewMonthDate.getFullYear(), viewMonthDate.getMonth() + 1, 0));

  const records = useApiData(
    useCallback(async () => {
      const page = await getRecords(monthStart, monthEnd);
      return page.records;
    }, [monthStart, monthEnd]),
  );
  const monthly = useApiData(useCallback(() => getMonthlySummary(monthKey), [monthKey]));

  useRefreshOnFocus(records.refetch);
  useRefreshOnFocus(monthly.refetch);

  const dayData = useMemo(() => {
    const map = new Map<string, DayMilkInfo>();
    for (const record of records.data ?? []) {
      const key = milkLogDateToKey(record.log_date);
      const current = map.get(key) ?? { quantity: 0, amount: 0, count: 0 };
      current.quantity += toNumber(record.quantity_liters);
      current.amount += toNumber(record.total_price);
      current.count += 1;
      map.set(key, current);
    }
    return map;
  }, [records]);

  const dayRecords = useMemo(
    () => (records.data ?? []).filter((record) => milkLogDateToKey(record.log_date) === selectedKey),
    [records.data, selectedKey],
  );

  const monthQuantity = toNumber(monthly.data?.total_quantity);
  const monthAmount = toNumber(monthly.data?.total_amount);

  const period: Period = {
    type: 'month',
    value: monthKey,
    label: formatMonthYear(viewMonthDate),
  };

  const openExport = () => setExportVisible(true);

  const onEdit = (record: MilkRecord) => {
    router.push({
      pathname: '/edit-milk/[id]',
      params: {
        id: record.id,
        day: milkLogDateToKey(record.log_date),
        quantity: record.quantity_liters,
        price: record.price_per_liter,
        categoryId: String(record.category_id ?? ''),
        categoryName: record.category_name ?? 'Milk',
      },
    });
  };

  const onAddForDay = (key: string) => {
    router.push({ pathname: '/add-milk', params: { date: key } });
  };

  const jumpToToday = () => {
    const now = new Date();
    setViewMonthDate(startOfMonthView(now));
    setSelectedKey(toDateKey(now));
  };

  if (records.loading && !records.data) {
    return (
      <Screen title="History" subtitle="Every milk entry you have recorded">
        <LoadingView />
      </Screen>
    );
  }

  // Responsive: on desktop show calendar + details side-by-side
  if (isDesktop) {
    return (
      <Screen title="History" subtitle="Tap a day to see what you bought">
        <View style={styles.desktopGrid}>
          <View style={styles.desktopLeft}>
            <FadeInView delay={0}>
              <Calendar
                selectedKey={selectedKey}
                onSelect={setSelectedKey}
                monthDate={viewMonthDate}
                onMonthChange={(next) => {
                  setViewMonthDate(next);
                  setSelectedKey(toDateKey(new Date(next.getFullYear(), next.getMonth(), 1)));
                }}
                dayData={dayData}
                todayKey={todayKey}
              />
            </FadeInView>
            <View style={styles.toolbar}>
              <PressScale onPress={jumpToToday} accessibilityLabel="Jump to today" style={styles.todayPill}>
                <Text variant="body" color={colors.primary}>
                  Today
                </Text>
              </PressScale>
              <PressScale onPress={openExport} accessibilityLabel="Export this month" style={styles.exportPill}>
                <Text variant="body" color={colors.primary}>
                  Export
                </Text>
              </PressScale>
            </View>
            <FadeInView delay={140}>
              <Card style={styles.monthSummary}>
                <Text variant="bodyStrong" color={colors.primary}>
                  {formatMonthYear(viewMonthDate)}
                </Text>
                <View style={styles.monthRow}>
                  <View style={styles.monthStat}>
                    <Text variant="huge">{formatLitres(monthQuantity)}</Text>
                    <Text variant="caption" color={colors.textMuted}>
                      milk this month
                    </Text>
                  </View>
                  <View style={styles.monthStat}>
                    <Text variant="huge" color={colors.primary}>
                      {formatRupees(monthAmount)}
                    </Text>
                    <Text variant="caption" color={colors.textMuted}>
                      spent this month
                    </Text>
                  </View>
                </View>
                <Text variant="small" color={colors.textSoft}>
                  {dayData.size} active {dayData.size === 1 ? 'day' : 'days'} · {records.data?.length ?? 0} entr
                  {records.data?.length === 1 ? 'y' : 'ies'}
                </Text>
              </Card>
            </FadeInView>
          </View>

          <View style={styles.desktopRight}>
            {records.error ? (
              <ErrorView message={records.error} onRetry={records.refetch} />
            ) : (
              <FadeInView delay={80}>
                <DayDetailCard
                  selectedKey={selectedKey}
                  dayRecords={dayRecords}
                  isToday={selectedKey === todayKey}
                  onEdit={onEdit}
                  onAddForDay={onAddForDay}
                />
              </FadeInView>
            )}
          </View>
        </View>

        <ExportSheet visible={exportVisible} period={period} onClose={() => setExportVisible(false)} />
      </Screen>
    );
  }

  return (
    <Screen title="History" subtitle="Tap a day to see what you bought" scroll={false}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {
            records.refetch();
            monthly.refetch();
          }} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {records.error ? (
          <ErrorView message={records.error} onRetry={records.refetch} />
        ) : (
          <>
            <FadeInView delay={0}>
              <Calendar
                selectedKey={selectedKey}
                onSelect={setSelectedKey}
                monthDate={viewMonthDate}
                onMonthChange={(next) => {
                  setViewMonthDate(next);
                  setSelectedKey(toDateKey(new Date(next.getFullYear(), next.getMonth(), 1)));
                }}
                dayData={dayData}
                todayKey={todayKey}
              />
            </FadeInView>

            <View style={styles.toolbar}>
              <PressScale onPress={jumpToToday} accessibilityLabel="Jump to today" style={styles.todayPill}>
                <Text variant="body" color={colors.primary}>
                  Today
                </Text>
              </PressScale>
              <PressScale onPress={openExport} accessibilityLabel="Export this month" style={styles.exportPill}>
                <Text variant="body" color={colors.primary}>
                  Export
                </Text>
              </PressScale>
            </View>

            <FadeInView delay={80}>
              <DayDetailCard
                selectedKey={selectedKey}
                dayRecords={dayRecords}
                isToday={selectedKey === todayKey}
                onEdit={onEdit}
                onAddForDay={onAddForDay}
              />
            </FadeInView>

            <FadeInView delay={140}>
              <Card style={styles.monthSummary}>
                <Text variant="bodyStrong" color={colors.primary}>
                  {formatMonthYear(viewMonthDate)}
                </Text>
                <View style={styles.monthRow}>
                  <View style={styles.monthStat}>
                    <Text variant="huge">{formatLitres(monthQuantity)}</Text>
                    <Text variant="caption" color={colors.textMuted}>
                      milk this month
                    </Text>
                  </View>
                  <View style={styles.monthStat}>
                    <Text variant="huge" color={colors.primary}>
                      {formatRupees(monthAmount)}
                    </Text>
                    <Text variant="caption" color={colors.textMuted}>
                      spent this month
                    </Text>
                  </View>
                </View>
                <Text variant="small" color={colors.textSoft}>
                  {dayData.size} active {dayData.size === 1 ? 'day' : 'days'} ·{' '}
                  {records.data?.length ?? 0} entr{records.data?.length === 1 ? 'y' : 'ies'}
                </Text>
              </Card>
            </FadeInView>
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
  desktopGrid: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
    paddingBottom: spacing.xxxl,
  },
  desktopLeft: {
    flex: 1,
    gap: spacing.lg,
    maxWidth: 480,
  },
  desktopRight: {
    flex: 1,
    minWidth: 0,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  todayPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingVertical: spacing.md,
  },
  exportPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 999,
    paddingVertical: spacing.md,
  },
  monthSummary: {
    borderWidth: 0,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  monthStat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
});
