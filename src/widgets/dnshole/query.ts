import { useMutation, useQuery } from '@tanstack/react-query';
import { AdStatistics, PiholeApiSummaryType } from './type';

export const useDnsHoleSummeryQuery = () =>
  useQuery({
    queryKey: ['dns-hole-summary'],
    queryFn: async () => {
      const response = await fetch('/api/modules/dns-hole/summary');
      return (await response.json()) as AdStatistics;
    },
    refetchInterval: 3 * 60 * 1000,
  });

export const useDnsHoleControlMutation = () =>
  useMutation({
    mutationKey: ['dns-hole-control'],
    mutationFn: async (status: PiholeApiSummaryType['status']) => {
      const response = await fetch(`/api/modules/dns-hole/control?status=${status}`, {
        method: 'POST',
      });
      return response.json();
    },
  });
