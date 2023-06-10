import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

export const useMediaRequestQuery = () => {
  const { name: configName } = useConfigContext();
  api.mediaRequest.all.useQuery(
    { configName: configName! },
    {
      refetchInterval: 3 * 60 * 1000,
    }
  );
};
