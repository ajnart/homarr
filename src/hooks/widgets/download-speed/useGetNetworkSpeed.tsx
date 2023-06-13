import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

export const useGetDownloadClientsQueue = () => {
  const { name: configName } = useConfigContext();
  return api.download.get.useQuery(
    {
      configName: configName!,
    },
    {
      refetchInterval: 3000,
    }
  );
};
