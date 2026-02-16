import { useQuery } from '@tanstack/react-query';
import { useApiClient } from './useApiClient';
import type { OrgDashboardResponse } from '../types';

export function useOrgDashboard() {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ['org-dashboard'],
    queryFn: () => apiClient<OrgDashboardResponse>('/organizations/dashboard'),
  });
}
