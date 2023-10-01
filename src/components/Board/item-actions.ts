import { useCallback } from 'react';
import { api } from '~/utils/api';

type MoveAndResizeItem = {
  itemId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
type MoveItemToSection = {
  itemId: string;
  sectionId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const useItemActions = ({ boardName }: { boardName: string }) => {
  const utils = api.useContext();
  const moveAndResizeItem = useCallback(
    ({ itemId, ...positionProps }: MoveAndResizeItem) => {
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
                if (item.id !== itemId) return item;
                console.log(positionProps);
                return {
                  ...item,
                  ...positionProps,
                };
              }),
            };
          }),
        };
      });
    },
    [boardName, utils]
  );

  const moveItemToSection = useCallback(
    ({ itemId, sectionId, ...positionProps }: MoveItemToSection) => {
      utils.boards.byName.setData({ boardName }, (prev) => {
        if (!prev) return prev;

        const currentSection = prev.sections.find((section) =>
          section.items.some((item) => item.id === itemId)
        );

        // If item is in the same section (on initial loading) don't do anything
        if (!currentSection || currentSection.id === sectionId) return prev;

        let currentItem = currentSection?.items.find((item) => item.id === itemId);
        if (!currentItem) return prev;

        return {
          ...prev,
          sections: prev.sections.map((section) => {
            // Return sections without item if not section where it is moved to
            if (section.id !== sectionId)
              return {
                ...section,
                items: section.items.filter((item) => item.id !== itemId),
              };

            // Return section and add item to it
            return {
              ...section,
              items: section.items.concat({
                ...currentItem!,
                ...positionProps,
              }),
            };
          }),
        };
      });
    },
    [boardName, utils]
  );

  return {
    moveAndResizeItem,
    moveItemToSection,
  };
};

/*
- Add category (on top, below, above)
- Rename category
- Move category (down & up)
- Remove category
- Add widget
- Edit widget
- Remove widget
- Add app
- Edit app
- Remove app
*/
