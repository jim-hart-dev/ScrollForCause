import { useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { apiClient } from '../api/client';

export function useApiClient() {
  const { getToken } = useAuth();

  return useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const token = await getToken();
      return apiClient<T>(endpoint, options, token);
    },
    [getToken],
  );
}
