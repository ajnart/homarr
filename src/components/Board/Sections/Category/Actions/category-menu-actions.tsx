import { v4 as uuidv4 } from 'uuid';
import { useCategoryActions } from '~/components/Board/Sections/Category/Actions/category-actions';
import { openContextModalGeneric } from '~/tools/mantineModalManagerExtensions';
import { CategoryType } from '~/types/category';

import { CategoryEditModalInnerProps } from '../CategoryEditModal';

export const useCategoryMenuActions = (category: CategoryType) => {
  const { addCategory, moveCategory, removeCategory, renameCategory } = useCategoryActions();

  // creates a new category above the current
  const addCategoryAbove = () => {
    const abovePosition = category.position - 1;

    openContextModalGeneric<CategoryEditModalInnerProps>({
      modal: 'categoryEditModal',
      innerProps: {
        category: {
          id: uuidv4(),
          name: 'New category',
          position: abovePosition + 1,
        },
        onSuccess: async (category) => {
          addCategory({
            name: category.name,
            position: category.position,
          });
        },
      },
    });
  };

  // creates a new category below the current
  const addCategoryBelow = () => {
    const belowPosition = category.position + 1;

    openContextModalGeneric<CategoryEditModalInnerProps>({
      modal: 'categoryEditModal',
      innerProps: {
        category: {
          id: uuidv4(),
          name: 'New category',
          position: belowPosition + 1,
        },
        onSuccess: async (category) => {
          addCategory({
            name: category.name,
            position: category.position,
          });
        },
      },
    });
  };

  const moveCategoryUp = () => {
    moveCategory({
      id: category.id,
      direction: 'up',
    });
  };

  const moveCategoryDown = () => {
    moveCategory({
      id: category.id,
      direction: 'down',
    });
  };

  // Removes the current category
  const remove = () => {
    // TODO: contained apps are currently just deleted
    removeCategory({
      id: category.id,
    });
  };

  const edit = async () => {
    openContextModalGeneric<CategoryEditModalInnerProps>({
      modal: 'categoryEditModal',
      withCloseButton: false,
      innerProps: {
        category,
        onSuccess: async (category) => {
          renameCategory({
            id: category.id,
            name: category.name,
          });
        },
      },
    });
  };

  return {
    addCategoryAbove,
    addCategoryBelow,
    moveCategoryUp,
    moveCategoryDown,
    remove,
    edit,
  };
};
