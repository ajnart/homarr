import { useCallback } from 'react';
import { api } from '~/utils/api';

import { useRequiredBoardProps } from './outer-context';

export const useUpdateBoard = () => {
  const utils = api.useUtils();
  const { boardName, layoutId } = useRequiredBoardProps();

  return useCallback(
    (callback: Parameters<(typeof utils)['boards']['byName']['setData']>[1]) => {
      utils.boards.byName.setData(
        { boardName, layoutId, userAgent: navigator.userAgent },
        callback
      );
    },
    [boardName, layoutId, utils]
  );
};
