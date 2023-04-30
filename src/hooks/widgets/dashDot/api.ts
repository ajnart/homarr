import { useConfigContext } from '~/config/provider';
import { constructClientSecretChangesForIntegrations } from '~/server/api/helpers/apps';
import { usenetIntegrationTypes } from '~/server/api/helpers/integrations';
import { api } from '~/utils/api';
import type { UsenetHistoryRequestParams } from '../../../pages/api/modules/usenet/history';
import type { UsenetQueueRequestParams } from '../../../pages/api/modules/usenet/queue';
import { UsenetResumeRequestParams } from '../../../pages/api/modules/usenet/resume';

const POLLING_INTERVAL = 2000;

export const useGetUsenetInfo = (appId: string | null) => {
  const { name, config } = useConfigContext();

  const app = constructClientSecretChangesForIntegrations(
    config?.apps.filter((app) => app.id === appId) ?? [],
    usenetIntegrationTypes
  )[0];

  return api.usenet.info.useQuery(
    {
      configName: name!,
      app,
    },
    {
      enabled: appId !== null && app !== undefined && name !== undefined,
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
    }
  );
};

export const useGetUsenetDownloads = (params: UsenetQueueRequestParams) => {
  const { name, config } = useConfigContext();

  const app = constructClientSecretChangesForIntegrations(
    config?.apps.filter((app) => app.id === params.appId) ?? [],
    usenetIntegrationTypes
  )[0];

  return api.usenet.queue.useQuery(
    {
      configName: name!,
      app,
      offset: params.offset,
      limit: params.limit,
    },
    {
      enabled: app !== undefined && name !== undefined,
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
    }
  );
};

export const useGetUsenetHistory = (params: UsenetHistoryRequestParams) => {
  const { name, config } = useConfigContext();

  const app = constructClientSecretChangesForIntegrations(
    config?.apps.filter((app) => app.id === params.appId) ?? [],
    usenetIntegrationTypes
  )[0];

  return api.usenet.history.useQuery(
    {
      configName: name!,
      app,
      limit: params.limit,
      offset: params.offset,
    },
    {
      enabled: app !== undefined && name !== undefined,
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
    }
  );
};

export const usePauseUsenetQueueMutation = () => {
  const utils = api.useContext();
  const { mutateAsync: pauseAsync } = api.usenet.pause.useMutation({
    async onMutate({ app, configName }) {
      await utils.usenet.info.cancel({ app, configName });
      const previousInfo = utils.usenet.info.getData({ app, configName });

      if (previousInfo) {
        utils.usenet.info.setData(
          { app, configName },
          {
            ...previousInfo,
            paused: true,
          }
        );
      }

      return { previousInfo };
    },
    onError(err, variables, context) {
      if (context?.previousInfo) {
        utils.usenet.info.setData(variables, context.previousInfo);
      }
    },
    onSettled() {
      utils.usenet.info.invalidate();
    },
  });
  const { name, config } = useConfigContext();

  return async (appId: string) => {
    if (name === undefined || config === undefined) return;

    const app = constructClientSecretChangesForIntegrations(
      config?.apps.filter((app) => app.id === appId) ?? [],
      usenetIntegrationTypes
    )[0];

    const res = await pauseAsync({
      configName: name,
      app,
    });
    // eslint-disable-next-line consistent-return
    return res;
  };
};

export const useResumeUsenetQueue = (params: UsenetResumeRequestParams) => {
  const utils = api.useContext();
  const { mutateAsync: resumeAsync } = api.usenet.resume.useMutation({
    async onMutate({ app, configName }) {
      await utils.usenet.info.cancel({ app, configName });
      const previousInfo = utils.usenet.info.getData({ app, configName });

      if (previousInfo) {
        utils.usenet.info.setData(
          { app, configName },
          {
            ...previousInfo,
            paused: false,
          }
        );
      }

      return { previousInfo };
    },
    onError(err, variables, context) {
      if (context?.previousInfo) {
        utils.usenet.info.setData(variables, context.previousInfo);
      }
    },
    onSettled() {
      utils.usenet.info.invalidate();
    },
  });
  const { name, config } = useConfigContext();

  return async (appId: string) => {
    if (name === undefined || config === undefined) return;

    const app = constructClientSecretChangesForIntegrations(
      config?.apps.filter((app) => app.id === appId) ?? [],
      usenetIntegrationTypes
    )[0];

    const res = await resumeAsync({
      configName: name,
      app,
    });
    // eslint-disable-next-line consistent-return
    return res;
  };
};
