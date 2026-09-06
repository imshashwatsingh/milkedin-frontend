import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text as RNText, View } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme';
import { formatMonthYear, toDateKey } from '@/utils/date';

export interface DayMilkInfo {
  quantity: number;
  amount: number;
  count: number;
}

interface CalendarProps {
  selectedKey: string;
  onSelect: (key: string) => void;
  monthDate: Date;
  onMonthChange?: (next: Date) => void;
  dayData: Map<string, DayMilkInfo>;
  todayKey: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function formatQuantityShort(q: number): string {
  // Compact: 0.5 → "0.5L", 2 → "2L", 2.5 → "2.5L"
  const trimmed = Number(q.toFixed(2));
  return `${trimmed}L`;
}

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

  const maxQuantity = useMemo(() => {
    let max = 0;
    for (const v of dayData.values()) if (v.quantity > max) max = v.quantity;
    return max || 1;
  }, [dayData]);

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

  const loggedDays = dayData.size;
  const totalLitresThisMonth = useMemo(() => {
    let sum = 0;
    for (const v of dayData.values()) sum += v.quantity;
    return sum;
  }, [dayData]);

  return (
    <View style={[styles.container, shadows.sm]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={goPrev}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={({ pressed }: any) => [styles.navButton, pressed && styles.navButtonPressed]}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>

        <View style={styles.monthTitleWrap}>
          <RNText style={styles.monthLabel}>{formatMonthYear(visibleMonth)}</RNText>
          <RNText style={styles.monthSub}>
            {loggedDays > 0 ? `${loggedDays} ${loggedDays === 1 ? 'day' : 'days'} · ${formatQuantityShort(totalLitresThisMonth)}` : 'No entries yet'}
          </RNText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={goNext}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={({ pressed }: any) => [styles.navButton, pressed && styles.navButtonPressed]}>
          <Ionicons name="chevron-forward" size={18} color={colors.text} />
        </Pressable>
      </View>

      {/* Weekday header */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <View key={w + i} style={styles.weekCell}>
            <RNText style={[styles.weekText, (i === 0 || i === 6) && styles.weekTextWeekend]}>{w}</RNText>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Grid */}
      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) return <View key={`empty-${index}`} style={styles.cell} />;
          const key = toDateKey(date);
          const info = dayData.get(key);
          const isSelected = key === selectedKey;
          const isToday = key === todayKey;
          const hasData = !!info && info.count > 0;
          const intensity = hasData ? Math.min(1, info!.quantity / maxQuantity) : 0;
          return (
            <DayCell
              key={key}
              date={date}
              info={info}
              intensity={intensity}
              selected={isSelected}
              today={isToday}
              hasData={hasData}
              onPress={() => onSelect(key)}
            />
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendSwatchEmpty]} />
          <RNText style={styles.legendText}>No entry</RNText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendSwatchLow]} />
          <RNText style={styles.legendText}>Logged</RNText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendSwatchHigh]} />
          <RNText style={styles.legendText}>More milk</RNText>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendDotToday} />
          <RNText style={styles.legendText}>Today</RNText>
        </View>
      </View>
    </View>
  );
}

interface DayCellProps {
  date: Date;
  info?: DayMilkInfo;
  intensity: number; // 0..1
  selected: boolean;
  today: boolean;
  hasData: boolean;
  onPress: () => void;
}

function DayCell({ date, info, intensity, selected, today, hasData, onPress }: DayCellProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const dayNum = String(date.getDate());

  // Background based on intensity — heatmap style
  const bgColor = (() => {
    if (selected) return colors.primary;
    if (!hasData) return 'transparent';
    if (intensity < 0.35) return '#EAF1FE';
    if (intensity < 0.65) return '#D6E4FE';
    if (intensity < 0.85) return '#BFd2FD';
    return '#A9C2FD';
  })();

  const textColor = selected ? colors.onPrimary : colors.text;
  const subTextColor = selected ? 'rgba(255,255,255,0.85)' : intensity > 0.65 ? '#1F3A6B' : colors.textMuted;

  const qtyLabel = hasData ? formatQuantityShort(info!.quantity) : null;
  const showCountBadge = hasData && info!.count > 1;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hasData ? `${dayNum}, ${qtyLabel} in ${info!.count} ${info!.count === 1 ? 'entry' : 'entries'}` : `${dayNum}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, tension: 400, friction: 20 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 400, friction: 20 }).start()}
      style={({ pressed }: any) => [styles.cell, pressed && { opacity: 0.96 }]}>
      <Animated.View
        style={[
          styles.cellInner,
          {
            transform: [{ scale }],
            backgroundColor: bgColor,
            borderWidth: today && !selected ? 1.5 : hasData && !selected ? 1 : 0,
            borderColor: today && !selected ? colors.primary : hasData && !selected ? 'rgba(45,108,223,0.18)' : 'transparent',
            // selected gets shadow - avoid elevation + overflow:hidden clash on Android
            ...(selected ? shadows.sm : {}),
          },
        ]}>
        {/* Today pill */}
        {today && !selected ? (
          <View style={styles.todayPillWrap}>
            <View style={styles.todayPill}>
              <RNText style={styles.todayPillText}>TODAY</RNText>
            </View>
          </View>
        ) : null}

        {/* Count badge for multiple entries */}
        {showCountBadge ? (
          <View style={[styles.countBadge, selected && styles.countBadgeSelected]}>
            <RNText style={[styles.countBadgeText, selected && styles.countBadgeTextSelected]}>×{info!.count}</RNText>
          </View>
        ) : null}

        <RNText style={[styles.dayText, { color: textColor }, today && !selected && styles.dayTextToday]}>{dayNum}</RNText>

        {hasData ? (
          <View style={[styles.qtyPill, selected ? styles.qtyPillSelected : intensity > 0.65 ? styles.qtyPillHigh : styles.qtyPillLow]}>
            <Ionicons name="water" size={10} color={selected ? colors.onPrimary : intensity > 0.65 ? '#1F3A6B' : colors.primary} style={styles.qtyIcon} />
            <RNText style={[styles.qtyText, { color: subTextColor }, selected && styles.qtyTextSelected]}>{qtyLabel}</RNText>
          </View>
        ) : (
          <View style={styles.qtyPlaceholder} />
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPressed: {
    backgroundColor: colors.surfaceBorder,
  },
  navButtonHovered: {
    backgroundColor: colors.surfaceAlt,
  } as any,
  monthTitleWrap: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  monthSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSoft,
    letterSpacing: 0.2,
    textTransform: 'uppercase' as any,
  },
  weekRow: {
    flexDirection: 'row',
    paddingTop: spacing.xs,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSoft,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as any,
  },
  weekTextWeekend: {
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.2857%',
    aspectRatio: 1,
    padding: 2,
  },
  cellInner: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 5,
    paddingHorizontal: 2,
    minHeight: 56,
    position: 'relative',
    overflow: 'hidden',
  },
  todayPillWrap: {
    position: 'absolute',
    top: 3,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  todayPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.pill,
  },
  todayPillText: {
    fontSize: 7,
    fontWeight: '800',
    color: colors.onPrimary,
    letterSpacing: 0.5,
  },
  countBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: colors.text,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.onPrimary,
    lineHeight: 10,
  },
  countBadgeTextSelected: {
    color: colors.onPrimary,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: -0.2,
    marginTop: 2,
  },
  dayTextToday: {
    fontWeight: '800',
  },
  qtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
    minHeight: 16,
  },
  qtyPillLow: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(45,108,223,0.12)',
  },
  qtyPillHigh: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(31,58,107,0.12)',
  },
  qtyPillSelected: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  qtyIcon: {
    marginTop: 0.5,
  },
  qtyText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 12,
  },
  qtyTextSelected: {
    color: colors.onPrimary,
  },
  qtyPlaceholder: {
    height: 16,
    minHeight: 16,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    marginTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendSwatchEmpty: {
    backgroundColor: 'transparent',
    borderColor: colors.surfaceBorder,
  },
  legendSwatchLow: {
    backgroundColor: '#EAF1FE',
    borderColor: 'rgba(45,108,223,0.18)',
  },
  legendSwatchHigh: {
    backgroundColor: '#A9C2FD',
    borderColor: 'rgba(31,58,107,0.18)',
  },
  legendDotToday: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSoft,
    letterSpacing: 0.2,
  },
});
