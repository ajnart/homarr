import { useQuery } from '@tanstack/react-query';
import { MediaRequest } from './media-request-types';

export const useMediaRequestQuery = () => useQuery({
  queryKey: ['media-requests'],
  queryFn: async () => {
    const response = await fetch('/api/modules/media-requests');
    return (await response.json()) as MediaRequest[];
  },
  refetchInterval: 3 * 60 * 1000,
});
