import { Query, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { NormalizedTorrentListResponse } from '../../../types/api/NormalizedTorrentListResponse';

interface TorrentsDataRequestParams {
  appId: string;
  refreshInterval: number;
}

export const useGetTorrentData = (params: TorrentsDataRequestParams) =>
  useQuery({
    queryKey: ['torrentsData', params.appId],
    queryFn: fetchData,
    refetchOnWindowFocus: true,
    refetchInterval(_: any, query: Query) {
      if (query.state.fetchFailureCount < 3) {
        return params.refreshInterval;
      }
      return false;
    },
    enabled: !!params.appId,
  });

const fetchData = async (): Promise<NormalizedTorrentListResponse> => {
  const response = await axios.post('/api/modules/torrents');
  return response.data as NormalizedTorrentListResponse;
};
