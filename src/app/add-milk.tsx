import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MilkForm } from '@/components/milk/MilkForm';
import { Button } from '@/components/ui/Button';
import { ErrorView } from '@/components/ui/ErrorView';
import { LoadingView } from '@/components/ui/LoadingView';
import { SavedOverlay } from '@/components/ui/SavedOverlay';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useApiData } from '@/hooks/useApiData';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { addMilkRecord } from '@/services/api/milk';
import { listCategories } from '@/services/api/categories';
import { colors, spacing } from '@/theme';
import { parseDateKey, toDateKey } from '@/utils/date';
import type { CategoryOption } from '@/components/milk/CategorySelector';
import type { CreateRecordRequest } from '@/types';

export default function AddMilkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const dateParam = Array.isArray(params.date) ? params.date[0] : params.date;

  const categories = useApiData(useCallback(() => listCategories(), []));
  useRefreshOnFocus(categories.refetch);

  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialDate = dateParam ? parseDateKey(dateParam) : new Date();
  const isSpecificDay = !!dateParam && !Number.isNaN(initialDate.getTime());

  if (saved) {
    return <SavedOverlay title="Milk saved!" subtitle="Back to your records..." />;
  }

  if (categories.loading && !categories.data) {
    return (
      <Screen title="Add Milk">
        <LoadingView />
      </Screen>
    );
  }

  if (categories.error) {
    return (
      <Screen title="Add Milk">
        <ErrorView message={categories.error} onRetry={categories.refetch} />
      </Screen>
    );
  }

  const list = (categories.data ?? []) as CategoryOption[];

  if (list.length === 0) {
    return (
      <Screen title="Add Milk">
        <View style={styles.emptyWrap}>
          <Text variant="body" color={colors.textMuted} center>
            First you need to set up your milk and its price.
          </Text>
          <Button
            label="Set Up Milk & Price"
            onPress={() => router.push('/(tabs)/settings')}
          />
        </View>
      </Screen>
    );
  }

  const handleSubmit = async (request: CreateRecordRequest) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await addMilkRecord(request);
      setSaved(true);
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }, 950);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <Screen
      title="Add Milk"
      maxWidth="narrow"
      subtitle={isSpecificDay ? `Recording for ${toDateKey(initialDate)}` : "It's quick — a couple of taps."}>
      <View style={styles.stack}>
        <MilkForm
          mode="add"
          categories={list}
          initial={{ date: initialDate, quantity: '2', categoryId: list[0]?.id }}
          canGoForwardDate={isSpecificDay}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
        {submitError ? (
          <Text variant="body" color={colors.danger} center accessibilityRole="alert">
            {submitError}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  emptyWrap: {
    gap: spacing.xl,
    alignItems: 'stretch',
    paddingTop: spacing.xxl,
  },
});