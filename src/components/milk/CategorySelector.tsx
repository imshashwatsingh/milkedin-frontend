import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';
import { formatRupees } from '@/utils/format';

import { Text } from '../ui/Text';

export interface CategoryOption {
  id: number;
  name: string;
  current_price: string;
}

interface CategorySelectorProps {
  categories: CategoryOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

/**
 * Big tappable chips for choosing which milk you bought. Prices are shown on
 * each chip so the user can see the cost without extra taps.
 */
export function CategorySelector({ categories, selectedId, onSelect }: CategorySelectorProps) {
  if (categories.length === 0) return null;
  if (categories.length === 1) {
    return (
      <View style={styles.singleRow}>
        <Text variant="bodyStrong">{categories[0].name}</Text>
        <Text variant="bodyStrong" color={colors.textMuted}>
          {formatRupees(categories[0].current_price)} / litre
        </Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {categories.map((category) => {
        const selected = category.id === selectedId;
        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityLabel={`${category.name}, ${formatRupees(category.current_price)} per litre`}
            accessibilityState={{ selected }}
            onPress={() => onSelect(category.id)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}>
            <View style={styles.chipInner}>
              <Text variant="bodyStrong" color={selected ? colors.primary : colors.text}>
                {category.name}
              </Text>
              <Text variant="caption" color={selected ? colors.primary : colors.textMuted}>
                {formatRupees(category.current_price)}/L
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  singleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chips: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
    paddingRight: spacing.lg,
  },
  chip: {
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipInner: {
    alignItems: 'center',
    gap: spacing.xs,
  },
});