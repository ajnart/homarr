import { RouterInputs, api } from '~/utils/api';

const POLLING_INTERVAL = 2000;

export const useGetUsenetInfo = ({
  integrationId,
}: PartialIntegrationId<RouterInputs['usenet']['info']>) => {
  return api.usenet.info.useQuery(
    { integrationId: integrationId! },
    {
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
      enabled: !!integrationId,
    }
  );
};

export const useGetUsenetDownloads = ({
  integrationId,
  ...params
}: PartialIntegrationId<RouterInputs['usenet']['queue']>) => {
  return api.usenet.queue.useQuery(
    {
      integrationId: integrationId!,
      ...params,
    },
    {
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
      enabled: !!integrationId,
    }
  );
};

export const useGetUsenetHistory = ({
  integrationId,
  ...params
}: PartialIntegrationId<RouterInputs['usenet']['history']>) => {
  return api.usenet.history.useQuery(
    {
      integrationId: integrationId!,
      ...params,
    },
    {
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
      enabled: !!integrationId,
    }
  );
};

export const usePauseUsenetQueueMutation = () => {
  const { mutateAsync } = api.usenet.pause.useMutation();
  const utils = api.useUtils();
  return async ({ integrationId }: PartialIntegrationId<RouterInputs['usenet']['pause']>) => {
    if (!integrationId) {
      return;
    }
    await mutateAsync(
      {
        integrationId,
      },
      {
        onSettled(_, __, variables) {
          utils.usenet.info.invalidate(variables);
        },
      }
    );
  };
};

export const useResumeUsenetQueueMutation = () => {
  const { mutateAsync } = api.usenet.resume.useMutation();
  const utils = api.useUtils();
  return async ({ integrationId }: PartialIntegrationId<RouterInputs['usenet']['resume']>) => {
    if (!integrationId) {
      return;
    }
    await mutateAsync(
      { integrationId },
      {
        onSettled(_, __, variables) {
          utils.usenet.info.invalidate(variables);
        },
      }
    );
  };
};

type PartialIntegrationId<T extends Record<string, any>> = Omit<T, 'integrationId'> & {
  integrationId?: string;
};
