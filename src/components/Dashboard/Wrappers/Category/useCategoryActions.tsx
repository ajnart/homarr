import { v4 as uuidv4 } from 'uuid';
import { useConfigStore } from '~/config/store';
import { openContextModalGeneric } from '~/tools/mantineModalManagerExtensions';
import { AppType } from '~/types/app';
import { CategoryType } from '~/types/category';
import { WrapperType } from '~/types/wrapper';
import { IWidget } from '~/widgets/widgets';

import { CategoryEditModalInnerProps } from './CategoryEditModal';

export const useCategoryActions = (configName: string | undefined, category: CategoryType) => {
  const updateConfig = useConfigStore((x) => x.updateConfig);

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
          if (!configName) return;

          const newWrapper: WrapperType = {
            id: uuidv4(),
            position: abovePosition + 2,
          };

          // Adding category and wrapper and moving other items down
          await updateConfig(
            configName,
            (previous) => {
              const aboveWrappers = previous.wrappers.filter((x) => x.position <= abovePosition);
              const aboveCategories = previous.categories.filter(
                (x) => x.position <= abovePosition
              );

              const belowWrappers = previous.wrappers.filter((x) => x.position > abovePosition);
              const belowCategories = previous.categories.filter((x) => x.position > abovePosition);

              return {
                ...previous,
                categories: [
                  ...aboveCategories,
                  category,
                  // Move categories below down
                  ...belowCategories.map((x) => ({ ...x, position: x.position + 1 })),
                ],
                wrappers: [
                  ...aboveWrappers,
                  newWrapper,
                  // Move wrappers below down
                  ...belowWrappers.map((x) => ({ ...x, position: x.position + 1 })),
                ],
              };
            },
            true
          );
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
          if (!configName) return;

          const newWrapper: WrapperType = {
            id: uuidv4(),
            position: belowPosition,
          };

          // Adding category and wrapper and moving other items down
          await updateConfig(
            configName,
            (previous) => {
              const aboveWrappers = previous.wrappers.filter((x) => x.position < belowPosition);
              const aboveCategories = previous.categories.filter((x) => x.position < belowPosition);

              const belowWrappers = previous.wrappers.filter((x) => x.position >= belowPosition);
              const belowCategories = previous.categories.filter(
                (x) => x.position >= belowPosition
              );

              return {
                ...previous,
                categories: [
                  ...aboveCategories,
                  category,
                  // Move categories below down
                  ...belowCategories.map((x) => ({ ...x, position: x.position + 2 })),
                ],
                wrappers: [
                  ...aboveWrappers,
                  newWrapper,
                  // Move wrappers below down
                  ...belowWrappers.map((x) => ({ ...x, position: x.position + 2 })),
                ],
              };
            },
            true
          );
        },
      },
    });
  };

  const moveCategoryUp = () => {
    if (!configName) return;

    updateConfig(
      configName,
      (previous) => {
        const currentItem = previous.categories.find((x) => x.id === category.id);
        if (!currentItem) return previous;

        const upperItem = previous.categories.find((x) => x.position === currentItem.position - 1);

        if (!upperItem) return previous;

        currentItem.position -= 1;
        upperItem.position += 1;

        return {
          ...previous,
          categories: [
            ...previous.categories.filter((c) => ![currentItem.id, upperItem.id].includes(c.id)),
            { ...upperItem },
            { ...currentItem },
          ],
        };
      },
      true
    );
  };

  const moveCategoryDown = () => {
    if (!configName) return;

    updateConfig(
      configName,
      (previous) => {
        const currentItem = previous.categories.find((x) => x.id === category.id);
        if (!currentItem) return previous;

        const belowItem = previous.categories.find((x) => x.position === currentItem.position + 1);

        if (!belowItem) return previous;

        currentItem.position += 1;
        belowItem.position -= 1;

        return {
          ...previous,
          categories: [
            ...previous.categories.filter((c) => ![currentItem.id, belowItem.id].includes(c.id)),
            { ...currentItem },
            { ...belowItem },
          ],
        };
      },
      true
    );
  };

  // Removes the current category
  const remove = () => {
    if (!configName) return;
    updateConfig(
      configName,
      (previous) => {
        const currentItem = previous.categories.find(
          (previousCategory) => previousCategory.id === category.id
        );
        if (!currentItem) return previous;

        const currentWrapper = previous.wrappers.find(
          (previousWrapper) => previousWrapper.position === currentItem?.position
        );
        if (!currentWrapper) return previous;

        // Find the main wrapper
        const mainWrapper = previous.wrappers.find(
          (previousWrapper) => previousWrapper.position === 0
        );
        const mainWrapperId = mainWrapper?.id ?? 'default';

        const isAppAffectedFilter = (app: AppType): boolean => {
          if (!app.area) {
            return false;
          }

          if (app.area.type === 'sidebar') {
            return false;
          }

          if (app.area.properties.id === mainWrapperId) {
            return false;
          }

          return (
            app.area.properties.id === currentItem.id ||
            app.area.properties.id === currentWrapper.id
          );
        };

        const isWidgetAffectedFilter = (widget: IWidget<string, any>): boolean => {
          if (!widget.area) {
            return false;
          }

          if (widget.area.type === 'sidebar') {
            return false;
          }

          if (widget.area.properties.id === mainWrapperId) {
            return false;
          }

          return (
            widget.area.properties.id === currentItem.id ||
            widget.area.properties.id === currentWrapper.id
          );
        };

        return {
          ...previous,
          apps: [
            ...previous.apps.filter((x) => !isAppAffectedFilter(x)),
            ...previous.apps
              .filter((x) => isAppAffectedFilter(x))
              .map(
                (app): AppType => ({
                  ...app,
                  area: {
                    ...app.area,
                    type: 'wrapper',
                    properties: {
                      ...app.area.properties,
                      id: mainWrapperId,
                    },
                  },
                })
              ),
          ],
          widgets: [
            ...previous.widgets.filter((widget) => !isWidgetAffectedFilter(widget)),
            ...previous.widgets
              .filter((widget) => isWidgetAffectedFilter(widget))
              .map(
                (widget): IWidget<string, any> => ({
                  ...widget,
                  area: {
                    ...widget.area,
                    type: 'wrapper',
                    properties: {
                      ...widget.area.properties,
                      id: mainWrapperId,
                    },
                  },
                })
              ),
          ],
          categories: previous.categories.filter(
            (previousCategory) => previousCategory.id !== category.id
          ),
          wrappers: previous.wrappers.filter(
            (previousWrapper) => previousWrapper.position !== currentItem.position
          ),
        };
      },
      true
    );
  };

  const edit = async () => {
    openContextModalGeneric<CategoryEditModalInnerProps>({
      modal: 'categoryEditModal',
      withCloseButton: false,
      innerProps: {
        category,
        onSuccess: async (category) => {
          if (!configName) return;
          await updateConfig(configName, (prev) => {
            const currentCategory = prev.categories.find((c) => c.id === category.id);
            if (!currentCategory) return prev;
            return {
              ...prev,
              categories: [...prev.categories.filter((c) => c.id !== category.id), { ...category }],
            };
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
