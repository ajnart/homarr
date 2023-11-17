import { randomUUID } from 'crypto';
import { InferSelectModel, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/server/db';
import { layoutItems, widgetOptions } from '~/server/db/schema';
import { widgetSchema } from '~/validations/widget';

import { BoardSaveDbChanges } from '.';
import { prepareWidgetOptionsForDb } from '../mapping/options';

export const getWidgetsForSectionsAsync = async (sectionIds: string[]) => {
  if (sectionIds.length === 0) return [];
  return await db.query.widgets.findMany({
    with: {
      options: true,
      integrations: {
        with: {
          integration: true,
        },
      },
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

  changes.widgetOptions.create.push(...prepareWidgetOptionsForDb(widget.options, widgetId));

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
  dbWidgetId: string,
  dbOptions: InferSelectModel<typeof widgetOptions>[],
  sectionId: string
) => {
  const inputOptions = prepareWidgetOptionsForDb(widget.options, dbWidgetId);
  const newOptions = inputOptions.filter((input) => {
    return dbOptions.every((dbOption) => {
      return dbOption.path !== input.path;
    });
  });
  const updatedOptions = inputOptions.filter((input) => {
    return dbOptions.some((dbOption) => {
      return dbOption.path === input.path && dbOption.value !== input.value;
    });
  });
  const deletedOptions = dbOptions.filter((dbOption) => {
    return inputOptions.every((input) => {
      return dbOption.path !== input.path;
    });
  });

  changes.widgetOptions.create.push(...newOptions);
  changes.widgetOptions.update.push(
    ...updatedOptions.map((option) => ({
      value: option.value,
      _where: {
        path: option.path,
        widgetId: option.widgetId,
      },
    }))
  );
  changes.widgetOptions.delete.push(
    ...deletedOptions.map((option) => ({
      path: option.path,
      widgetId: option.widgetId,
    }))
  );

  changes.layoutItems.update.push({
    sectionId,
    width: widget.width,
    height: widget.height,
    x: widget.x,
    y: widget.y,
    _where: widget.id,
  });
};
