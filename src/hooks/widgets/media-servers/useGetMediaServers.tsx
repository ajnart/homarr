import { useQuery } from '@tanstack/react-query';
import { MediaServersResponseType } from '../../../types/api/media-server/response';

interface GetMediaServersParams {
  enabled: boolean;
}

export const useGetMediaServers = ({ enabled }: GetMediaServersParams) =>
  useQuery({
    queryKey: ['media-servers'],
    queryFn: async (): Promise<MediaServersResponseType> => {
      const response = await fetch('/api/modules/media-server');
      return response.json();
    },
    enabled,
    refetchInterval: 10 * 1000,
  });
