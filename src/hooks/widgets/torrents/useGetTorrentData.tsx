import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { Query, useQuery } from '@tanstack/react-query';
import axios from 'axios';

const POLLING_INTERVAL = 2000;

interface TorrentsDataRequestParams {
  appId: string;
}

export const useGetTorrentData = (params: TorrentsDataRequestParams) =>
  useQuery({
    queryKey: ['torrentsData', params.appId],
    queryFn: async () => fetchData(),
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: POLLING_INTERVAL * 3,
    refetchInterval(_: any, query: Query) {
      if (query.state.fetchFailureCount < 3) {
        return 5000;
      }
      return false;
    },
    enabled: !!params.appId,
  });

const fetchData = async (): Promise<NormalizedTorrent[]> => {
  const response = await axios.post('/api/modules/torrents');
  return response.data as NormalizedTorrent[];
};
