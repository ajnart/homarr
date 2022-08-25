import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { UsenetHistoryItem, UsenetQueueItem } from '../../modules';

export const useGetUsenetDownloads = () =>
  useQuery(
    ['usenetDownloads'],
    async () => (await axios.get<UsenetQueueItem[]>('/api/modules/usenet')).data,
    {
      refetchInterval: 1000,
    }
  );

export const useGetUsenetHistory = () =>
  useQuery(
    ['usenetHistory'],
    async () => (await axios.get<UsenetHistoryItem[]>('/api/modules/usenet/history')).data,
    {
      refetchInterval: 1000,
    }
  );
