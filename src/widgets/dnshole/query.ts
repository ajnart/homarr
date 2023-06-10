import { useQuery } from '@tanstack/react-query';
import { AdStatistics } from './type';

export const useDnsHoleSummeryQuery = () =>
  useQuery({
    queryKey: ['dns-hole-summary'],
    queryFn: async () => {
      const response = await fetch('/api/modules/dns-hole/summary');
      return (await response.json()) as AdStatistics;
    },
    refetchInterval: 3 * 60 * 1000,
  });
