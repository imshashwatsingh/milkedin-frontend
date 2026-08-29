import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { type CategoryOption } from '@/components/milk/CategorySelector';
import { MilkForm } from '@/components/milk/MilkForm';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorView } from '@/components/ui/ErrorView';
import { LoadingView } from '@/components/ui/LoadingView';
import { SavedOverlay } from '@/components/ui/SavedOverlay';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useApiData } from '@/hooks/useApiData';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { deleteMilkRecord, updateMilkRecord } from '@/services/api/milk';
import { listCategories } from '@/services/api/categories';
import { colors, spacing } from '@/theme';
import { parseDateKey } from '@/utils/date';
import { toNumber } from '@/utils/format';
import type { CreateRecordRequest } from '@/types';

export default function EditMilkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    day?: string;
    quantity?: string;
    price?: string;
    categoryId?: string;
    categoryName?: string;
  }>();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const day = Array.isArray(params.day) ? params.day[0] : params.day;
  const quantityParam = Array.isArray(params.quantity) ? params.quantity[0] : params.quantity;
  const priceParam = Array.isArray(params.price) ? params.price[0] : params.price;
  const categoryIdParam = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;
  const categoryNameParam = Array.isArray(params.categoryName) ? params.categoryName[0] : params.categoryName;

  const categories = useApiData(useCallback(() => listCategories(), []));
  useRefreshOnFocus(categories.refetch);

  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (saved) {
    return (
      <SavedOverlay
        title={deleting ? 'Entry removed.' : 'Milk updated!'}
        subtitle="Your milk records are up to date."
      />
    );
  }

  if (!id) {
    return (
      <Screen>
        <ErrorView message="That entry could not be found." onRetry={goBack} retryLabel="Go Back" />
      </Screen>
    );
  }

  if (categories.loading && !categories.data) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }

  if (categories.error) {
    return (
      <Screen>
        <ErrorView message={categories.error} onRetry={categories.refetch} />
      </Screen>
    );
  }

  const list = (categories.data ?? []) as CategoryOption[];

  const paramCategoryId = categoryIdParam && categoryIdParam !== '' ? Number(categoryIdParam) : null;
  const namedMatch = paramCategoryId == null && categoryNameParam
    ? list.find((category) => category.name.toLowerCase() === categoryNameParam.toLowerCase()) ?? null
    : null;
  const initialCategoryId = paramCategoryId ?? namedMatch?.id ?? list[0]?.id ?? null;

  const parsedDay = day ? parseDateKey(day) : new Date();
  const initialDate = Number.isNaN(parsedDay.getTime()) ? new Date() : parsedDay;

  const handleSubmit = async (request: CreateRecordRequest) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await updateMilkRecord(id, request);
      setSaved(true);
      setTimeout(() => goBack(), 950);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not save. Please try again.');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);
    setActionError(null);
    try {
      await deleteMilkRecord(id);
      setSaved(true);
      setTimeout(() => goBack(), 950);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <>
      <Screen>
        <View style={styles.stack}>
          <MilkForm
            mode="edit"
            categories={list}
            initial={{
              date: initialDate,
              quantity: quantityParam ?? '2',
              categoryId: initialCategoryId,
              pricePerLitre: priceParam ? toNumber(priceParam) : undefined,
              categoryNameForMissing: categoryNameParam,
            }}
            canGoForwardDate
            submitting={submitting}
            onSubmit={handleSubmit}
          />

          {actionError ? (
            <Text variant="body" color={colors.danger} center accessibilityRole="alert">
              {actionError}
            </Text>
          ) : null}

          <View style={styles.divider} />

          <Button
            label={deleting ? 'Removing...' : 'Delete This Entry'}
            variant="danger"
            onPress={() => setShowDeleteConfirm(true)}
            loading={deleting}
          />
          <Text variant="small" color={colors.textMuted} center>
            Deleting removes this entry from your records.
          </Text>
        </View>
      </Screen>

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete this entry?"
        message="This entry will be removed from your records. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => void handleDelete()}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.md,
  },
});