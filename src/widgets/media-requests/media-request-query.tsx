import { useConfigContext } from '~/config/provider';
import { constructClientSecretChangesForIntegrations } from '~/server/api/helpers/apps';
import { mediaRequestIntegrationTypes } from '~/server/api/helpers/integrations';
import { api } from '~/utils/api';

export const useMediaRequestQuery = () => {
  const { name, config } = useConfigContext();

  return api.mediaRequests.all.useQuery(
    {
      configName: name!,
      apps: constructClientSecretChangesForIntegrations(config!.apps, mediaRequestIntegrationTypes),
    },
    {
      refetchInterval: 3 * 60 * 100,
      enabled: name !== undefined && config !== undefined,
    }
  );
};
