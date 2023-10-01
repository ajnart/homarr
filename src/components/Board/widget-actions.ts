import { useCallback } from 'react';
import { api } from '~/utils/api';

type UpdateWidgetOptions = {
  itemId: string;
  newOptions: Record<string, unknown>;
};

export const useWidgetActions = ({ boardName }: { boardName: string }) => {
  const utils = api.useContext();
  const updateWidgetOptions = useCallback(
    ({ itemId, newOptions }: UpdateWidgetOptions) => {
      utils.boards.byName.setData({ boardName }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map((section) => {
            // Return same section if item is not in it
            if (!section.items.some((item) => item.id === itemId)) return section;
            return {
              ...section,
              items: section.items.map((item) => {
                // Return same item if item is not the one we're moving
                if (item.id !== itemId || item.type !== 'widget') return item;
                return {
                  ...item,
                  options: newOptions,
                };
              }),
            };
          }),
        };
      });
    },
    [boardName, utils]
  );

  return {
    updateWidgetOptions,
  };
};
