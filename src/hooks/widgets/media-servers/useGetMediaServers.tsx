import { useConfigContext } from '~/config/provider';
import { constructClientSecretChangesForIntegrations } from '~/server/api/helpers/apps';
import { mediaServerIntegrationTypes } from '~/server/api/helpers/integrations';
import { api } from '~/utils/api';

export const useGetMediaServers = () => {
  const { name, config } = useConfigContext();

  return api.mediaServer.all.useQuery(
    {
      configName: name!,
      apps: constructClientSecretChangesForIntegrations(config!.apps, mediaServerIntegrationTypes),
    },
    {
      enabled: name !== undefined && config !== undefined,
      refetchInterval: 10 * 1000,
    }
  );
};
