import { useMutation, useQuery } from '@tanstack/react-query';
import { AdStatistics, PiholeApiSummaryType } from './type';

export const useAdHoleSummeryQuery = () =>
  useQuery({
    queryKey: ['ad-hole-summary'],
    queryFn: async () => {
      const response = await fetch('/api/modules/ad-hole/summary');
      return (await response.json()) as AdStatistics;
    },
    refetchInterval: 3 * 60 * 1000,
  });

export const useAdHoleControlMutation = () =>
  useMutation({
    mutationKey: ['ad-hole-control'],
    mutationFn: async (status: PiholeApiSummaryType['status']) => {
      const response = await fetch(`/api/modules/ad-hole/control?status=${status}`, {
        method: 'POST',
      });
      return response.json();
    },
  });
