import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text as RNText, TouchableOpacity, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';
import { formatLitres, toNumber } from '@/utils/format';
import { formatMonthYear, toDateKey } from '@/utils/date';

export interface DayMilkInfo {
  quantity: number;
  amount: number;
  count: number;
}

interface CalendarProps {
  /** Currently selected day as YYYY-MM-DD. */
  selectedKey: string;
  onSelect: (key: string) => void;
  /** The month currently displayed (any date within it). */
  monthDate: Date;
  onMonthChange?: (next: Date) => void;
  /** Map of YYYY-MM-DD -> milk info, used to mark days with entries. */
  dayData: Map<string, DayMilkInfo>;
  todayKey: string;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/**
 * A self-contained month calendar. Shows which days have milk entries via a
 * tinted dot and the litres bought, highlights today, and animates the
 * selected day. Pure presentational: the parent owns the selected day.
 */
export function Calendar({ selectedKey, onSelect, monthDate, onMonthChange, dayData, todayKey }: CalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState<Date>(startOfMonth(monthDate));

  useEffect(() => {
    const next = startOfMonth(monthDate);
    setVisibleMonth((current) => (toDateKey(current) === toDateKey(next) ? current : next));
  }, [monthDate]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const goPrev = () => {
    const next = addMonths(visibleMonth, -1);
    setVisibleMonth(next);
    onMonthChange?.(next);
  };
  const goNext = () => {
    const next = addMonths(visibleMonth, 1);
    setVisibleMonth(next);
    onMonthChange?.(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={goPrev}
          hitSlop={10}
          style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <RNText style={styles.monthLabel}>{formatMonthYear(visibleMonth)}</RNText>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={goNext}
          hitSlop={10}
          style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <View key={i} style={styles.weekCell}>
            <RNText style={styles.weekText}>{w}</RNText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) return <View key={`empty-${index}`} style={styles.cell} />;
          const key = toDateKey(date);
          const info = dayData.get(key);
          const isSelected = key === selectedKey;
          const isToday = key === todayKey;
          const inMonth = date.getMonth() === month;
          return (
            <DayCell
              key={key}
              keyText={String(date.getDate())}
              info={info}
              selected={isSelected}
              today={isToday}
              muted={!inMonth}
              onPress={() => onSelect(key)}
            />
          );
        })}
      </View>
    </View>
  );
}

interface DayCellProps {
  keyText: string;
  info?: DayMilkInfo;
  selected: boolean;
  today: boolean;
  muted: boolean;
  onPress: () => void;
}

function DayCell({ keyText, info, selected, today, muted, onPress }: DayCellProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(ring, {
      toValue: selected ? 1 : 0,
      useNativeDriver: false,
      tension: 260,
      friction: 20,
    }).start();
  }, [selected, ring]);

  const hasData = !!info && info.count > 0;
  const dotColor = selected ? colors.onPrimary : colors.primary;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={
        hasData
          ? `${keyText}${muted ? '' : ''}, ${formatLitres(info?.quantity ?? 0)} recorded`
          : keyText
      }
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, tension: 300, friction: 18 }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 18 }).start()
      }
      onPress={onPress}
      style={styles.cell}>
      <Animated.View
        style={[
          styles.cellInner,
          {
            transform: [{ scale }],
            backgroundColor: selected ? colors.primary : 'transparent',
            borderColor: today && !selected ? colors.primary : 'transparent',
            borderWidth: today && !selected ? 2 : 0,
            opacity: muted ? 0.35 : 1,
          },
        ]}>
        <RNText
          style={[
            styles.dayText,
            { color: selected ? colors.onPrimary : muted ? colors.textSoft : colors.text },
          ]}>
          {keyText}
        </RNText>
        {hasData ? (
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
        ) : (
          <View style={styles.dotPlaceholder} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navButton: {
    padding: spacing.xs,
  },
  monthLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSoft,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 3,
  },
  cellInner: {
    flex: 1,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotPlaceholder: {
    width: 6,
    height: 6,
  },
});
