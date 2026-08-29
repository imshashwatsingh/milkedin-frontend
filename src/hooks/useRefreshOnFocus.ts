import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

/**
 * Refetches data whenever the screen gains focus. Combined with useApiData
 * this keeps the UI in sync after navigating back from add/edit/delete.
 */
export function useRefreshOnFocus(refetch: () => void, enabled = true): void {
  useFocusEffect(
    useCallback(() => {
      if (enabled) refetch();
    }, [refetch, enabled]),
  );
}