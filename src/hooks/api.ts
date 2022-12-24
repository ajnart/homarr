import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Results } from 'sabnzbd-api';
import { UsenetQueueRequestParams, UsenetQueueResponse } from '../pages/api/modules/usenet/queue';
import {
  UsenetHistoryRequestParams,
  UsenetHistoryResponse,
} from '../pages/api/modules/usenet/history';
import { UsenetInfoRequestParams, UsenetInfoResponse } from '../pages/api/modules/usenet';
import { UsenetPauseRequestParams } from '../pages/api/modules/usenet/pause';
import { queryClient } from '../tools/queryClient';
import { UsenetResumeRequestParams } from '../pages/api/modules/usenet/resume';

const POLLING_INTERVAL = 2000;

export const useGetUsenetInfo = (params: UsenetInfoRequestParams) =>
  useQuery(
    ['usenetInfo', params.appId],
    async () =>
      (
        await axios.get<UsenetInfoResponse>('/api/modules/usenet', {
          params,
        })
      ).data,
    {
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
      enabled: !!params.appId,
    }
  );

export const useGetUsenetDownloads = (params: UsenetQueueRequestParams) =>
  useQuery(
    ['usenetDownloads', ...Object.values(params)],
    async () =>
      (
        await axios.get<UsenetQueueResponse>('/api/modules/usenet/queue', {
          params,
        })
      ).data,
    {
      refetchInterval: POLLING_INTERVAL,
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
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
    }
  );

export const usePauseUsenetQueue = (params: UsenetPauseRequestParams) =>
  useMutation(
    ['usenetPause', ...Object.values(params)],
    async () =>
      (
        await axios.post<Results>(
          '/api/modules/usenet/pause',
          {},
          {
            params,
          }
        )
      ).data,
    {
      async onMutate() {
        await queryClient.cancelQueries(['usenetInfo', params.appId]);
        const previousInfo = queryClient.getQueryData<UsenetInfoResponse>([
          'usenetInfo',
          params.appId,
        ]);

        if (previousInfo) {
          queryClient.setQueryData<UsenetInfoResponse>(['usenetInfo', params.appId], {
            ...previousInfo,
            paused: true,
          });
        }

        return { previousInfo };
      },
      onError(err, _, context) {
        if (context?.previousInfo) {
          queryClient.setQueryData<UsenetInfoResponse>(
            ['usenetInfo', params.appId],
            context.previousInfo
          );
        }
      },
      onSettled() {
        queryClient.invalidateQueries(['usenetInfo', params.appId]);
      },
    }
  );

export const useResumeUsenetQueue = (params: UsenetResumeRequestParams) =>
  useMutation(
    ['usenetResume', ...Object.values(params)],
    async () =>
      (
        await axios.post<Results>(
          '/api/modules/usenet/resume',
          {},
          {
            params,
          }
        )
      ).data,
    {
      async onMutate() {
        await queryClient.cancelQueries(['usenetInfo', params.appId]);
        const previousInfo = queryClient.getQueryData<UsenetInfoResponse>([
          'usenetInfo',
          params.appId,
        ]);

        if (previousInfo) {
          queryClient.setQueryData<UsenetInfoResponse>(['usenetInfo', params.appId], {
            ...previousInfo,
            paused: false,
          });
        }

        return { previousInfo };
      },
      onError(err, _, context) {
        if (context?.previousInfo) {
          queryClient.setQueryData<UsenetInfoResponse>(
            ['usenetInfo', params.appId],
            context.previousInfo
          );
        }
      },
      onSettled() {
        queryClient.invalidateQueries(['usenetInfo', params.appId]);
      },
    }
  );
