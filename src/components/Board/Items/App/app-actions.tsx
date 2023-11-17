import { useCallback } from 'react';
import { z } from 'zod';
import { api } from '~/utils/api';
import { appFormSchema } from '~/validations/app';

import { AppItem, EmptySection } from '../../context';

type CreateOrUpdateApp = {
  app: z.infer<typeof appFormSchema>;
};

export const useAppActions = ({ boardName }: { boardName: string }) => {
  const utils = api.useContext();
  const createOrUpdateApp = useCallback(
    ({ app }: CreateOrUpdateApp) => {
      utils.boards.byName.setData({ boardName, userAgent: navigator.userAgent }, (prev) => {
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
    [boardName, utils]
  );

  return {
    createOrUpdateApp,
  };
};
