import Consola from 'consola';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import { api } from '~/utils/api';

import { type CategorySection, type EmptySection } from './context';

type AddCategory = {
  name: string;
  position: number;
};

type RenameCategory = {
  id: string;
  name: string;
};

type MoveCategory = {
  id: string;
  direction: 'up' | 'down';
};

type RemoveCategory = {
  id: string;
};

export const useCategoryActions = ({ boardName }: { boardName: string }) => {
  const utils = api.useContext();

  const addCategory = useCallback(
    ({ name, position }: AddCategory) => {
      if (position <= 0) {
        Consola.error('Cannot add category before first section');
        return;
      }
      utils.boards.byName.setData({ boardName }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: [
            // Ignore sidebar and hidden sections
            ...prev.sections.filter(
              (section) => section.type === 'sidebar' || section.type === 'hidden'
            ),
            // Place sections before the new category
            ...prev.sections.filter(
              (section) =>
                (section.type === 'category' || section.type === 'empty') &&
                section.position < position
            ),
            {
              id: v4(),
              name,
              type: 'category',
              position,
              items: [],
            },
            {
              id: v4(),
              type: 'empty',
              position: position + 1,
              items: [],
            },
            // Place sections after the new category
            ...prev.sections
              .filter(
                (section): section is CategorySection | EmptySection =>
                  (section.type === 'category' || section.type === 'empty') &&
                  section.position >= position
              )
              .map((section) => ({
                ...section,
                position: section.position + 2,
              })),
          ],
        };
      });
    },
    [boardName, utils]
  );

  const renameCategory = useCallback(
    ({ id: categoryId, name }: RenameCategory) => {
      utils.boards.byName.setData({ boardName }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map((section) => {
            if (section.type !== 'category') return section;
            if (section.id !== categoryId) return section;
            return {
              ...section,
              name,
            };
          }),
        };
      });
    },
    [boardName, utils]
  );

  const moveCategory = useCallback(
    ({ id: categoryId, direction }: MoveCategory) => {
      utils.boards.byName.setData({ boardName }, (prev) => {
        if (!prev) return prev;

        const currentCategory = prev.sections.find(
          (section): section is CategorySection =>
            section.type === 'category' && section.id === categoryId
        );
        if (!currentCategory) return prev;
        if (currentCategory?.position === 1 && direction === 'up') return prev;
        if (currentCategory?.position === prev.sections.length - 2 && direction === 'down')
          return prev;

        return {
          ...prev,
          sections: prev.sections.map((section) => {
            if (section.type !== 'category' && section.type !== 'empty') return section;
            const offset = direction === 'up' ? -2 : 2;
            // Move category and empty section
            if (
              section.position === currentCategory.position ||
              section.position - 1 === currentCategory.position
            ) {
              return {
                ...section,
                position: section.position + offset,
              };
            }

            // Move all sections behind
            if (section.position >= currentCategory.position + offset) {
              return {
                ...section,
                position: section.position + 2,
              };
            }

            if (
              direction === 'up' &&
              (section.position === currentCategory.position + 2 ||
                section.position === currentCategory.position + 3)
            ) {
              return {
                ...section,
                position: section.position - 2,
              };
            }

            return section;
          }),
        };
      });
    },
    [boardName, utils]
  );

  const removeCategory = useCallback(
    ({ id: categoryId }: RemoveCategory) => {
      utils.boards.byName.setData({ boardName }, (prev) => {
        if (!prev) return prev;

        const currentCategory = prev.sections.find(
          (section): section is CategorySection =>
            section.type === 'category' && section.id === categoryId
        );
        if (!currentCategory) return prev;

        return {
          ...prev,
          sections: [
            ...prev.sections.filter(
              (section) => section.type === 'sidebar' || section.type === 'hidden'
            ),
            ...prev.sections.filter(
              (section) =>
                (section.type === 'category' || section.type === 'empty') &&
                section.position < currentCategory.position
            ),
            ...prev.sections
              .filter(
                (section): section is CategorySection | EmptySection =>
                  (section.type === 'category' || section.type === 'empty') &&
                  section.position >= currentCategory.position + 2
              )
              .map((section) => ({
                ...section,
                position: section.position - 2,
              })),
          ],
        };
      });
    },
    [boardName, utils]
  );

  return {
    addCategory,
    renameCategory,
    moveCategory,
    removeCategory,
  };
};
