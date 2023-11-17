import { RouterInputs, api } from '~/utils/api';

export const useGetDownloadClientsQueue = ({
  boardId,
  widgetId,
  sort,
}: RouterInputs['download']['get']) => {
  return api.download.get.useQuery(
    {
      boardId,
      widgetId,
      sort,
    },
    {
      refetchInterval: 3000,
    }
  );
};
