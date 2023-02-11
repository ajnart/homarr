import { useQuery } from '@tanstack/react-query';
import { MediaServersResponseType } from '../../../types/api/media-server/response';

export const useGetMediaServers = () =>
  useQuery({
    queryKey: ['media-servers'],
    queryFn: async (): Promise<MediaServersResponseType> => {
      const response = await fetch('/api/modules/media-server');
      return response.json();
    },
  });
