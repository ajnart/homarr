import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

export const useMediaRequestQuery = () => {
  const { name: configName } = useConfigContext();
  return api.mediaRequest.allMedia.useQuery(
    { configName: configName! },
    {
      refetchInterval: 3 * 60 * 1000,
    }
  );
};

export const useUsersQuery = () => {
  const { name: configName } = useConfigContext();
  return api.mediaRequest.users.useQuery(
    { configName: configName! },
    {
      refetchInterval: 3 * 60 * 1000,
    }
  );
};
