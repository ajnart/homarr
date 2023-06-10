import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Results } from 'sabnzbd-api';
import { useConfigContext } from '~/config/provider';
import { RouterInputs, api } from '~/utils/api';
import { UsenetInfoRequestParams, UsenetInfoResponse } from '../../../pages/api/modules/usenet';
import type { UsenetHistoryRequestParams } from '../../../pages/api/modules/usenet/history';
import { UsenetPauseRequestParams } from '../../../pages/api/modules/usenet/pause';
import type {
  UsenetQueueRequestParams,
  UsenetQueueResponse,
} from '../../../pages/api/modules/usenet/queue';
import { UsenetResumeRequestParams } from '../../../pages/api/modules/usenet/resume';
import { queryClient } from '../../../tools/server/configurations/tanstack/queryClient.tool';

const POLLING_INTERVAL = 2000;

export const useGetUsenetInfo = ({ appId }: UsenetInfoRequestParams) => {
  const { name: configName } = useConfigContext();

  return api.usenet.info.useQuery(
    {
      appId,
      configName: configName!,
    },
    {
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
      enabled: !!appId,
    }
  );
};

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

export const useGetUsenetHistory = (params: UsenetHistoryRequestParams) => {
  const { name: configName } = useConfigContext();
  return api.usenet.history.useQuery(
    {
      configName: configName!,
      ...params,
    },
    {
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
    }
  );
};

export const usePauseUsenetQueueMutation = (params: UsenetPauseRequestParams) => {
  const { name: configName } = useConfigContext();
  const { mutateAsync, mutate, ...mutation } = api.usenet.pause.useMutation();
  const utils = api.useContext();
  return async (variables: Omit<RouterInputs['usenet']['pause'], 'configName'>) => {
    await mutateAsync(
      {
        configName: configName!,
        ...variables,
      },
      {
        onSettled() {
          utils.usenet.info.invalidate({ appId: params.appId });
        },
      }
    );
  };
};

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
