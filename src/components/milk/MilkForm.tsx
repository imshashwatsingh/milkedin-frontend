import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CategorySelector, type CategoryOption } from '@/components/milk/CategorySelector';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DateStepper } from '@/components/ui/DateStepper';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Text } from '@/components/ui/Text';
import type { CreateRecordRequest } from '@/types';
import { colors, spacing } from '@/theme';
import { addDays, toDateKey } from '@/utils/date';
import { formatLitres, formatRupees, toNumber } from '@/utils/format';
import { validateQuantity } from '@/utils/validation';

// The data passed from a screen to the form.
export interface MilkFormInitial {
  /** The calendar day the record is for. */
  date: Date;
  /** Optional quantity as a string; defaults to '2'. */
  quantity?: string;
  /** Optional categoryId; if omitted the first category is used. */
  categoryId?: number | null;
  /** Snapshot per-litre price (for edit mode when the category stays unchanged). */
  pricePerLitre?: number;
  /** Only used to display a category that is no longer active. */
  categoryNameForMissing?: string;
}

export interface MilkFormProps {
  mode: 'add' | 'edit';
  categories: CategoryOption[];
  initial: MilkFormInitial;
  canGoForwardDate?: boolean;
  onDateChange?: (date: Date) => void;
  submitting?: boolean;
  onSubmit: (request: CreateRecordRequest) => Promise<void>;
}

const incrementStep = (value: string, delta: number) => {
  const current = value.trim() === '' ? 0 : toNumber(value);
  const next = Math.max(0, Math.min(100, current + delta));
  return next === Math.trunc(next) ? String(Math.trunc(next)) : String(next);
};

/**
 * The single milk entry form used by both Add and Edit. Large controls, a
 * live cost preview, and clear validation — nothing technical on screen.
 */
export function MilkForm({ mode, categories, initial, canGoForwardDate = false, onDateChange, submitting = false, onSubmit }: MilkFormProps) {
  const fallbackCategory = useMemo(() => {
    if (
      mode === 'edit' &&
      initial.categoryId != null &&
      !categories.some((category) => category.id === initial.categoryId)
    ) {
      return {
        id: initial.categoryId,
        name: initial.categoryNameForMissing ?? 'Milk',
        current_price: String(initial.pricePerLitre ?? 0),
      };
    }
    return null;
  }, [initial, categories, mode]);

  const options: CategoryOption[] = useMemo(() => {
    if (fallbackCategory) return [fallbackCategory, ...categories];
    return categories;
  }, [categories, fallbackCategory]);

  const [date, setDate] = useState<Date>(initial.date);
  const [quantity, setQuantity] = useState<string>(initial.quantity ?? '2');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initial.categoryId ?? options[0]?.id ?? null,
  );
  const [touched, setTouched] = useState(false);

  const selectedCategory = options.find((option) => option.id === selectedCategoryId) ?? null;

  // Price logic mirrors the backend: editing without changing the category
  // keeps the original snapshot price; otherwise the category's price is used.
  const usedPricePerLitre =
    mode === 'edit' && selectedCategoryId === initial.categoryId && !fallbackCategory
      ? (initial.pricePerLitre ?? toNumber(selectedCategory?.current_price))
      : toNumber(selectedCategory?.current_price);

  const quantityError = validateQuantity(quantity);
  const showError = touched && quantityError !== null;

  const totalCost = toNumber(quantity) * usedPricePerLitre;

  const handleSubmit = async () => {
    setTouched(true);
    if (quantityError) return;
    if (selectedCategoryId == null) return;
    if (toNumber(quantity) <= 0) return;
    await onSubmit({
      categoryId: selectedCategoryId,
      quantity: toNumber(quantity),
      record_date: toDateKey(date),
    });
  };

  const handleDateChange = (next: Date) => {
    setDate(next);
    onDateChange?.(next);
  };

  return (
    <View style={styles.form}>
      <Card style={styles.fieldCard}>
        <Text variant="bodyStrong">Which milk?</Text>
        <CategorySelector
          categories={options}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />
      </Card>

      <Card style={styles.fieldCard}>
        <Text variant="bodyStrong">How much did you buy?</Text>
        <QuantityStepper
          label="quantity"
          displayValue={quantity === '' ? '0' : quantity}
          onDecrease={() => setQuantity(incrementStep(quantity, -0.5))}
          onIncrease={() => setQuantity(incrementStep(quantity, 0.5))}
          canDecrease={Number(quantity || 0) > 0}
          canIncrease={Number(quantity || 0) < 100}
        />
        {showError ? (
          <Text variant="small" color={colors.danger} accessibilityRole="alert">
            {quantityError}
          </Text>
        ) : null}
      </Card>

      <Card style={styles.fieldCard}>
        <Text variant="bodyStrong">For which day?</Text>
        <DateStepper date={date} onPrevious={() => handleDateChange(addDays(date, -1))} onNext={() => handleDateChange(addDays(date, 1))} canGoForward={canGoForwardDate} />
      </Card>

      <Card variant="warm" style={styles.previewCard}>
        <View style={styles.previewRow}>
          <Text variant="body" color={colors.textMuted}>
            Price per litre
          </Text>
          <Text variant="bodyStrong">{formatRupees(usedPricePerLitre)}</Text>
        </View>
        <View style={styles.previewRow}>
          <Text variant="body" color={colors.textMuted}>
            Quantity
          </Text>
          <Text variant="bodyStrong">{formatLitres(quantity)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text variant="bodyStrong">Total</Text>
          <Text variant="huge" color={colors.primary}>
            {formatRupees(totalCost)}
          </Text>
        </View>
      </Card>

      <Button
        label={mode === 'add' ? 'Save Milk Entry' : 'Save Changes'}
        onPress={() => void handleSubmit()}
        loading={submitting}
        disabled={submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  fieldCard: {
    gap: spacing.lg,
  },
  previewCard: {
    borderWidth: 0,
    gap: spacing.md,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
});