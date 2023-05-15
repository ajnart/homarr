import { useQuery } from '@tanstack/react-query';
import { NormalizedIconRepositoryResult } from '../../tools/server/images/abstract-icons-repository';

export const useGetDashboardIcons = () =>
  useQuery({
    queryKey: ['repository-icons'],
    queryFn: async () => {
      const response = await fetch('/api/icons/');
      const data = await response.json();
      return data as NormalizedIconRepositoryResult[];
    },
    refetchOnMount: false,
    // Cache for infinity, refetch every so often.
    cacheTime: Infinity,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
