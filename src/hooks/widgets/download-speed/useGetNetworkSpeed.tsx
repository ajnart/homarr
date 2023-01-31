import { useQuery } from '@tanstack/react-query';
import { NormalizedDownloadQueueResponse } from '../../../types/api/downloads/queue/NormalizedDownloadQueueResponse';

export const useGetDownloadClientsQueue = () => useQuery({
  queryKey: ['network-speed'],
  queryFn: async (): Promise<NormalizedDownloadQueueResponse> => {
    const response = await fetch('/api/modules/downloads');
    return response.json();
  },
  refetchInterval: 3000,
});
