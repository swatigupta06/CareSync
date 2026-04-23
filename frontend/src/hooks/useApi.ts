/**
 * useApi — lightweight hook that wraps an API call with
 * loading, error, and data state so every component doesn't
 * have to repeat the same try/catch/finally pattern.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(appointmentAPI.getAll);
 *   useEffect(() => { execute(); }, []);
 */

import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T, A extends unknown[]> extends UseApiState<T> {
  execute: (...args: A) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useApi<T, A extends unknown[]>(
  apiFunc: (...args: A) => Promise<{ data: unknown }>,
  // Optional selector: pull the right key from the response
  selector?: (responseData: Record<string, unknown>) => T
): UseApiReturn<T, A> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await apiFunc(...args);
        const raw = response.data as Record<string, unknown>;
        const data = selector ? selector(raw) : (raw as unknown as T);
        setState({ data, loading: false, error: null });
        return data;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setState((prev) => ({ ...prev, loading: false, error: message }));
        return null;
      }
    },
    [apiFunc, selector]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return { ...state, execute, reset, setData };
}

/** Simple toast-like notification helper used across components */
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  return { toast, showToast };
}
