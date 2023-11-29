import { useCallback } from 'react';
import { v4 } from 'uuid';
import { z } from 'zod';
import { widgetCreationSchema, widgetSortSchema } from '~/validations/widget';
import { IWidgetDefinition } from '~/widgets/widgets';

import { useUpdateBoard } from '../../board-actions';
import { EmptySection, WidgetItem } from '../../context';

type UpdateWidgetOptions = {
  itemId: string;
  newOptions: Record<string, unknown>;
};

type CreateWidget = {
  sort: z.infer<typeof widgetSortSchema>;
  definition: IWidgetDefinition;
};

export const useWidgetActions = () => {
  const updateBoard = useUpdateBoard();
  const updateWidgetOptions = useCallback(
    ({ itemId, newOptions }: UpdateWidgetOptions) => {
      updateBoard((prev) => {
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
                if (item.id !== itemId || item.kind !== 'widget') return item;
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
    [updateBoard]
  );

  const createWidget = useCallback(
    ({ sort, definition }: CreateWidget) => {
      updateBoard((prev) => {
        if (!prev) return prev;

        let lastSection = prev.sections
          .filter((s): s is EmptySection => s.kind === 'empty')
          .sort((a, b) => a.position - b.position)[0];

        const widget = {
          id: v4(),
          kind: 'widget',
          sort,
          options: Object.entries(definition.options).reduce(
            (prev, [k, v]) => {
              const newPrev = prev;
              newPrev[k] = v.defaultValue;
              return newPrev;
            },
            {} as Record<string, unknown>
          ),
        } satisfies z.infer<typeof widgetCreationSchema>;

        return {
          ...prev,
          sections: prev.sections.map((section) => {
            // Return same section if item is not in it
            if (section.id !== lastSection.id) return section;
            return {
              ...section,
              items: section.items.concat(applyMinSize(widget, definition)),
            };
          }),
        };
      });
    },
    [updateBoard]
  );

  return {
    createWidget,
    updateWidgetOptions,
  };
};

// TODO: When section size is declared it should be used to calculate the min size
const applyMinSize = (
  widget: z.infer<typeof widgetCreationSchema>,
  definition: IWidgetDefinition
): WidgetItem => {
  // Width, height, x, y are defined by gridstack afterwards
  return {
    ...widget,
    width: definition.gridstack.minWidth,
    height: definition.gridstack.minHeight,
  } as WidgetItem;
};
