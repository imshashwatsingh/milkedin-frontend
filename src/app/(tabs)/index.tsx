import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { SummaryCard } from '@/components/milk/SummaryCard';
import { TodayBreakdownCard } from '@/components/milk/TodayBreakdownCard';
import { TodayStatusCard } from '@/components/milk/TodayStatusCard';
import { Button } from '@/components/ui/Button';
import { ErrorView } from '@/components/ui/ErrorView';
import { FadeInView } from '@/components/ui/Anim';
import { LoadingView } from '@/components/ui/LoadingView';
import { Screen } from '@/components/ui/Screen';
import { EmptyView } from '@/components/ui/EmptyView';
import { useApiData } from '@/hooks/useApiData';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { useResponsive } from '@/hooks/useResponsive';
import { getMonthlySummary, getRecordsByDate } from '@/services/api/milk';
import { spacing } from '@/theme';
import { formatDateLongWithYear, toDateKey, monthKeyOf, milkLogDateToKey } from '@/utils/date';
import { toNumber } from '@/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const todayKey = toDateKey(new Date());
  const monthKey = monthKeyOf(new Date());

  const records = useApiData(useCallback(() => getRecordsByDate(todayKey), [todayKey]));
  const monthly = useApiData(useCallback(() => getMonthlySummary(monthKey), [monthKey]));

  useRefreshOnFocus(records.refetch);
  useRefreshOnFocus(monthly.refetch);

  const todayRecords = records.data?.result ?? [];
  const hasToday = todayRecords.length > 0;
  const latestToday = todayRecords[0];

  const todayQuantity = todayRecords.reduce((sum, record) => sum + toNumber(record.quantity_liters), 0);
  const todayCost = todayRecords.reduce((sum, record) => sum + toNumber(record.total_price), 0);

  if (records.loading && !records.data) {
    return (
      <Screen title="Today's Milk" subtitle={formatDateLongWithYear(new Date())}>
        <LoadingView />
      </Screen>
    );
  }

  const openAdd = () => router.push('/add-milk');

  const openEditLatest = () => {
    if (!latestToday) return;
    router.push({
      pathname: '/edit-milk/[id]',
      params: {
        id: latestToday.id,
        day: milkLogDateToKey(latestToday.log_date),
        quantity: latestToday.quantity_liters,
        price: latestToday.price_per_liter,
        categoryId: String(latestToday.category_id ?? ''),
        categoryName: latestToday.category_name ?? 'Milk',
      },
    });
  };

  return (
    <Screen title="Today's Milk" subtitle={formatDateLongWithYear(new Date())}>
      <View style={[styles.stack, isDesktop && styles.stackDesktop]}>
        {records.error ? (
          <ErrorView message={records.error} onRetry={records.refetch} />
        ) : (
          <>
            {/* Desktop: two-column layout — hero + actions on left, details on right */}
            <View style={isDesktop ? styles.desktopGrid : undefined}>
              <View style={isDesktop ? styles.desktopLeft : undefined}>
                <FadeInView delay={0}>
                  <TodayStatusCard hasRecord={hasToday} records={todayRecords} />
                </FadeInView>

                <View style={isDesktop ? styles.actionRowDesktop : undefined}>
                  {hasToday ? (
                    <>
                      <Button label="Edit Today's Entry" onPress={openEditLatest} />
                      <Button label="Add Another Entry" variant="outline" onPress={openAdd} />
                    </>
                  ) : (
                    <Button label="Add Today's Milk" onPress={openAdd} />
                  )}
                </View>

                {monthly.error ? (
                  <ErrorView message={monthly.error} onRetry={monthly.refetch} />
                ) : monthly.loading && !monthly.data ? (
                  <View style={styles.summaryLoading}>
                    <LoadingView label="Loading totals..." />
                  </View>
                ) : (
                  <FadeInView delay={120}>
                    <SummaryCard
                      todayQuantity={todayQuantity}
                      todayCost={todayCost}
                      monthQuantity={toNumber(monthly.data?.total_quantity) || 0}
                      monthCost={toNumber(monthly.data?.total_amount) || 0}
                      monthLabel="Month"
                    />
                  </FadeInView>
                )}
              </View>

              {hasToday ? (
                <View style={isDesktop ? styles.desktopRight : undefined}>
                  <FadeInView delay={60}>
                    <TodayBreakdownCard records={todayRecords} />
                  </FadeInView>

                  {!hasToday && monthly.data && toNumber(monthly.data.total_quantity) === 0 ? null : (
                    <View style={styles.desktopHint}>
                      <EmptyView
                        title="Keep going!"
                        message="Tip: you can add multiple entries per day for different milk types."
                      />
                    </View>
                  )}
                </View>
              ) : null}
            </View>

            {/* Mobile fallback empty state when no today record */}
            {!hasToday && !isDesktop && monthly.data && toNumber(monthly.data.total_quantity) === 0 ? (
              <EmptyView
                title="No milk entries yet"
                message="Add your first milk purchase to start keeping track."
              />
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.xl,
  },
  stackDesktop: {
    gap: spacing.xl,
  },
  desktopGrid: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  desktopLeft: {
    flex: 1.1,
    gap: spacing.xl,
  },
  desktopRight: {
    flex: 0.9,
    gap: spacing.xl,
  },
  actionRowDesktop: {
    gap: spacing.md,
  },
  desktopHint: {
    opacity: 0.9,
  },
  summaryLoading: {
    minHeight: 120,
  },
});