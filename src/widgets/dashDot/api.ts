import { useConfigContext } from '~/config/provider';
import { RouterInputs, api } from '~/utils/api';

import {
  UsenetHistoryRequestParams,
  UsenetInfoRequestParams,
  UsenetPauseRequestParams,
  UsenetQueueRequestParams,
  UsenetResumeRequestParams,
} from '../useNet/types';

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

export const useGetUsenetDownloads = (params: UsenetQueueRequestParams) => {
  const { name: configName } = useConfigContext();
  return api.usenet.queue.useQuery(
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
  const { mutateAsync } = api.usenet.pause.useMutation();
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

export const useResumeUsenetQueueMutation = (params: UsenetResumeRequestParams) => {
  const { name: configName } = useConfigContext();
  const { mutateAsync } = api.usenet.resume.useMutation();
  const utils = api.useContext();
  return async (variables: Omit<RouterInputs['usenet']['resume'], 'configName'>) => {
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
