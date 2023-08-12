import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

interface GetMediaServersParams {
  enabled: boolean;
}

export const useGetMediaServers = ({ enabled }: GetMediaServersParams) => {
  const { name: configName } = useConfigContext();

  return api.mediaServer.all.useQuery(
    {
      configName: configName!,
    },
    {
      enabled,
      refetchInterval: 10 * 1000,
    }
  );
};
