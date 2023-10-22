import { randomUUID } from 'crypto';
import { InferSelectModel, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/server/db';
import { layoutItems, widgetOptions } from '~/server/db/schema';
import { widgetSchema } from '~/validations/widget';

import { BoardSaveDbChanges } from '.';

export const getWidgetsForSectionsAsync = async (sectionIds: string[]) => {
  if (sectionIds.length === 0) return [];
  return await db.query.widgets.findMany({
    with: {
      options: true,
      item: {
        with: {
          layouts: {
            where: inArray(layoutItems.sectionId, sectionIds),
          },
        },
      },
    },
  });
};

export const applyCreateWidgetChanges = (
  changes: BoardSaveDbChanges,
  widget: z.infer<typeof widgetSchema>,
  boardId: string,
  sectionId: string
) => {
  changes.items.create.push({
    id: widget.id,
    kind: 'widget',
    boardId,
  });

  const widgetId = randomUUID();
  changes.widgets.create.push({
    id: widgetId,
    sort: widget.sort,
    itemId: widget.id,
  });

  // TODO: Create widget options
  /*
  changes.widgetOptions.create.push(
    ...widget.options.map((option) => ({
      id: randomUUID(),
      widgetId,
      path: option.path,
      type: option.type,
      value: option.value,
    }))
  );*/

  changes.layoutItems.create.push({
    id: randomUUID(),
    itemId: widget.id,
    sectionId,
    height: widget.height,
    width: widget.width,
    x: widget.x,
    y: widget.y,
  });
};

export const applyUpdateWidgetChanges = (
  changes: BoardSaveDbChanges,
  widget: z.infer<typeof widgetSchema>,
  dbOptions: InferSelectModel<typeof widgetOptions>[],
  sectionId: string
) => {
  // TODO: Update widget options

  changes.layoutItems.update.push({
    sectionId,
    width: widget.width,
    height: widget.height,
    x: widget.x,
    y: widget.y,
    _where: widget.id,
  });
};
