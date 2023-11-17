import Consola from 'consola';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import { api } from '~/utils/api';

import { type CategorySection, type EmptySection } from '../../../context';

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
      utils.boards.byName.setData({ boardName, userAgent: navigator.userAgent }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: [
            // Ignore sidebar and hidden sections
            ...prev.sections.filter(
              (section) => section.kind === 'sidebar' || section.kind === 'hidden'
            ),
            // Place sections before the new category
            ...prev.sections.filter(
              (section) =>
                (section.kind === 'category' || section.kind === 'empty') &&
                section.position < position
            ),
            {
              id: v4(),
              name,
              kind: 'category',
              position,
              items: [],
            },
            {
              id: v4(),
              kind: 'empty',
              position: position + 1,
              items: [],
            },
            // Place sections after the new category
            ...prev.sections
              .filter(
                (section): section is CategorySection | EmptySection =>
                  (section.kind === 'category' || section.kind === 'empty') &&
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
      utils.boards.byName.setData({ boardName, userAgent: navigator.userAgent }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map((section) => {
            if (section.kind !== 'category') return section;
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
    ({ id, direction }: MoveCategory) => {
      utils.boards.byName.setData({ boardName, userAgent: navigator.userAgent }, (prev) => {
        if (!prev) return prev;

        const currentCategory = prev.sections.find(
          (section): section is CategorySection => section.kind === 'category' && section.id === id
        );
        if (!currentCategory) return prev;
        if (currentCategory?.position === 1 && direction === 'up') return prev;
        if (currentCategory?.position === prev.sections.length - 2 && direction === 'down')
          return prev;

        return {
          ...prev,
          sections: prev.sections.map((section) => {
            if (section.kind !== 'category' && section.kind !== 'empty') return section;
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

            if (
              direction === 'up' &&
              (section.position === currentCategory.position - 2 ||
                section.position === currentCategory.position - 1)
            ) {
              return {
                ...section,
                position: section.position + 2,
              };
            }

            if (
              direction === 'down' &&
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
      utils.boards.byName.setData({ boardName, userAgent: navigator.userAgent }, (prev) => {
        if (!prev) return prev;

        const currentCategory = prev.sections.find(
          (section): section is CategorySection =>
            section.kind === 'category' && section.id === categoryId
        );
        if (!currentCategory) return prev;

        return {
          ...prev,
          sections: [
            ...prev.sections.filter(
              (section) => section.kind === 'sidebar' || section.kind === 'hidden'
            ),
            ...prev.sections.filter(
              (section) =>
                (section.kind === 'category' || section.kind === 'empty') &&
                section.position < currentCategory.position
            ),
            ...prev.sections
              .filter(
                (section): section is CategorySection | EmptySection =>
                  (section.kind === 'category' || section.kind === 'empty') &&
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
