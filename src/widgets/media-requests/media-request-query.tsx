import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

import { MediaRequestListWidget } from './MediaRequestListTile';
import { MediaRequestStatsWidget } from './MediaRequestStatsTile';

export const useMediaRequestQuery = (widget: MediaRequestListWidget | MediaRequestStatsWidget) => {
  const { name: configName } = useConfigContext();
  return api.mediaRequest.allMedia.useQuery(
    { configName: configName!, widget: widget },
    {
      refetchInterval: 3 * 60 * 1000,
    }
  );
};

export const useUsersQuery = (widget: MediaRequestListWidget | MediaRequestStatsWidget) => {
  const { name: configName } = useConfigContext();
  return api.mediaRequest.users.useQuery(
    { configName: configName!, widget: widget },
    {
      refetchInterval: 3 * 60 * 1000,
    }
  );
};
