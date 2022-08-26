import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { UsenetQueueRequestParams, UsenetQueueResponse } from '../../pages/api/modules/usenet';
import {
  UsenetHistoryRequestParams,
  UsenetHistoryResponse,
} from '../../pages/api/modules/usenet/history';

export const useGetUsenetDownloads = (params: UsenetQueueRequestParams) =>
  useQuery(
    ['usenetDownloads', ...Object.values(params)],
    async () =>
      (
        await axios.get<UsenetQueueResponse>('/api/modules/usenet', {
          params,
        })
      ).data,
    {
      refetchInterval: 1000,
      keepPreviousData: true,
      retry: 2,
    }
  );

export const useGetUsenetHistory = (params: UsenetHistoryRequestParams) =>
  useQuery(
    ['usenetHistory', ...Object.values(params)],
    async () =>
      (
        await axios.get<UsenetHistoryResponse>('/api/modules/usenet/history', {
          params,
        })
      ).data,
    {
      refetchInterval: 1000,
      keepPreviousData: true,
      retry: 2,
    }
  );
