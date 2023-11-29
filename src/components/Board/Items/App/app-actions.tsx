import { useCallback } from 'react';
import { z } from 'zod';
import { appFormSchema } from '~/validations/app';

import { useUpdateBoard } from '../../board-actions';
import { type AppItem, type EmptySection } from '../../context';

type CreateOrUpdateApp = {
  app: z.infer<typeof appFormSchema>;
};

export const useAppActions = () => {
  const updateBoard = useUpdateBoard();
  const createOrUpdateApp = useCallback(
    ({ app }: CreateOrUpdateApp) => {
      updateBoard((prev) => {
        if (!prev) return prev;

        let sectionId = prev.sections.find((section) =>
          section.items.some((item) => item.id === app.id)
        )?.id;

        if (!sectionId) {
          sectionId = prev.sections
            .filter((section): section is EmptySection => section.kind === 'empty')
            .sort((a, b) => a.position - b.position)[0].id;
        }

        return {
          ...prev,
          sections: prev.sections.map((section) => {
            // Return same section if item is not in it
            if (section.id !== sectionId) return section;
            return {
              ...section,
              // Width, height, x, y are defined by gridstack afterwards
              items: section.items.filter((item) => item.id !== app.id).concat(app as AppItem),
            };
          }),
        };
      });
    },
    [updateBoard]
  );

  return {
    createOrUpdateApp,
  };
};
