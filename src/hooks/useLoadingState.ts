import { useState, useCallback } from 'react';
import { useToast } from '../components/shared/Toast';

interface UseLoadingStateOptions {
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
  errorMessage?: string;
}

export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { addToast } = useToast();

  const execute = useCallback(
    async <T>(promise: Promise<T>): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await promise;
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        if (options.showErrorToast) {
          addToast({
            type: 'error',
            message: options.errorMessage || error.message,
          });
        }

        if (options.onError) {
          options.onError(error);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options, addToast]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset,
  };
}; 