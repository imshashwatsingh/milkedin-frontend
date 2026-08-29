import { useCallback, useEffect, useRef, useState } from 'react';

import type { ApiError } from '@/services/api/client';

interface ApiDataState<T> {
  data: T | null;
  loading: boolean;
  /** Friendly, human-readable error message (null when no error). */
  error: string | null;
}

interface ApiDataResult<T> extends ApiDataState<T> {
  refetch: () => void;
}

/**
 * Minimal data-fetching hook. Keeps loading/data/error separated so screens
 * never flash empty content while fetching, and lets screens refetch on
 * focus after a mutation. Errors are plain friendly strings.
 */
export function useApiData<T>(fetcher: () => Promise<T>): ApiDataResult<T> {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcherRef.current()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof Error && 'kind' in err) {
          setError((err as ApiError).message);
        } else {
          setError('Something went wrong. Please try again.');
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Re-run whenever the fetcher identity changes (e.g. its arguments such as
    // the selected period change). All callers memoize the fetcher with
    // useCallback, so this only fires when the underlying inputs actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, fetcher]);

  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  return { data, loading, error, refetch };
}