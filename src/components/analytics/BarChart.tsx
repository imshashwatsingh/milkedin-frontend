import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Text } from '../ui/Text';

export interface BarItem {
  label: string;
  value: number;
  /** Pre-formatted value text (e.g. "12 L" or "₹340"). */
  display: string;
  color?: string;
  /** Optional secondary line under the label. */
  sub?: string;
}

interface HorizontalBarsProps {
  items: BarItem[];
  /** Delay between each bar's entrance animation (ms). */
  stagger?: number;
}

/**
 * Animated horizontal bars. Used for category breakdown and "best days".
 * Bars grow from zero to their proportion of the max value.
 */
export function HorizontalBars({ items, stagger = 70 }: HorizontalBarsProps) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <BarRow key={`${item.label}-${index}`} item={item} max={max} delay={index * stagger} />
      ))}
    </View>
  );
}

function BarRow({ item, max, delay }: { item: BarItem; max: number; delay: number }) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: item.value / max,
      duration: 700,
      delay,
      useNativeDriver: false,
    }).start();
  }, [item.value, max, delay, width]);

  return (
    <View style={styles.row}>
      <View style={styles.rowHead}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {item.label}
        </Text>
        <Text variant="body" color={colors.textMuted}>
          {item.display}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: width.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: item.color ?? colors.primary,
            },
          ]}
        />
      </View>
      {item.sub ? (
        <Text variant="small" color={colors.textSoft}>
          {item.sub}
        </Text>
      ) : null}
    </View>
  );
}

interface VerticalBarsProps {
  items: BarItem[];
  height?: number;
  emptyLabel?: string;
}

/** Animated vertical bars — used for the monthly / daily trend. */
export function VerticalBars({ items, height = 180, emptyLabel = 'No data yet' }: VerticalBarsProps) {
  const max = Math.max(1, ...items.map((i) => i.value));

  if (items.length === 0) {
    return (
      <View style={[styles.trendEmpty, { height }]}>
        <Text variant="body" color={colors.textMuted} center>
          {emptyLabel}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.trend, { height }]}>
      {items.map((item, index) => (
        <TrendBar key={`${item.label}-${index}`} item={item} max={max} delay={index * 28} />
      ))}
    </View>
  );
}

function TrendBar({ item, max, delay }: { item: BarItem; max: number; delay: number }) {
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: item.value / max,
      duration: 650,
      delay,
      useNativeDriver: false,
    }).start();
  }, [item.value, max, delay, heightAnim]);

  return (
    <View style={styles.trendCol}>
      <View style={styles.trendBarArea}>
        <Animated.View
          style={[
            styles.trendBar,
            {
              height: heightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: item.color ?? colors.primary,
            },
          ]}
        />
      </View>
      <Text variant="small" color={colors.textSoft} center numberOfLines={1}>
        {item.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.lg,
  },
  row: {
    gap: spacing.xs,
  },
  rowHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  track: {
    height: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  trendEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    height: '100%',
  },
  trendBarArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  trendBar: {
    width: '68%',
    borderRadius: radii.md,
    minHeight: 4,
  },
});
