import { randomUUID } from 'crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/server/db';
import { items, layoutItems } from '~/server/db/schema';
import { appSchema } from '~/validations/app';

import { BoardSaveDbChanges } from '.';

export const getAppsForSectionsAsync = async (boardId: string, sectionIds: string[]) => {
  const dbLayoutItems = await db.query.layoutItems.findMany({
    where: inArray(layoutItems.sectionId, sectionIds),
  });

  const dbItems = await db.query.items.findMany({
    where: and(eq(items.boardId, boardId), eq(items.kind, 'app')),
    with: {
      app: {
        with: {
          statusCodes: {
            columns: {
              code: true,
            },
          },
        },
      },
    },
  });

  return dbItems.map((dbItem) => ({
    ...dbItem,
    app: dbItem.app!,
    layout: dbLayoutItems.find((dbLayoutItem) => dbLayoutItem.itemId === dbItem.id) ?? {
      id: 'hidden',
      itemId: dbItem.id,
      sectionId: 'hidden',
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    },
  }));
};

export const applyCreateAppChanges = (
  changes: BoardSaveDbChanges,
  app: z.infer<typeof appSchema>,
  boardId: string,
  sectionId: string
) => {
  changes.items.create.push({
    id: app.id,
    kind: 'app',
    boardId,
  });

  const appId = randomUUID();
  changes.apps.create.push({
    id: appId,
    name: app.name,
    iconUrl: app.iconUrl,
    internalUrl: app.internalUrl,
    description: app.description,
    externalUrl: app.externalUrl,
    itemId: app.id,
    fontSize: app.fontSize,
    isPingEnabled: app.isPingEnabled,
    nameLineClamp: app.nameLineClamp,
    namePosition: app.namePosition,
    nameStyle: app.nameStyle,
    openInNewTab: app.openInNewTab,
  });

  changes.appStatusCodes.create.push(
    ...app.statusCodes.map((code) => ({
      appId,
      code,
    }))
  );

  changes.layoutItems.create.push({
    id: randomUUID(),
    itemId: app.id,
    sectionId,
    width: app.width,
    height: app.height,
    x: app.x,
    y: app.y,
  });
};

export const applyUpdateAppChanges = async (
  changes: BoardSaveDbChanges,
  app: z.infer<typeof appSchema>,
  dbAppId: string,
  dbStatusCodes: number[],
  sectionId: string
) => {
  changes.apps.update.push({
    name: app.name,
    iconUrl: app.iconUrl,
    internalUrl: app.internalUrl,
    description: app.description,
    externalUrl: app.externalUrl,
    fontSize: app.fontSize,
    isPingEnabled: app.isPingEnabled,
    nameLineClamp: app.nameLineClamp,
    namePosition: app.namePosition,
    nameStyle: app.nameStyle,
    openInNewTab: app.openInNewTab,
    _where: app.id,
  });

  // Update status codes
  const newStatusCodes = app.statusCodes.filter((code) => !dbStatusCodes.includes(code));
  changes.appStatusCodes.create.push(
    ...newStatusCodes.map((code) => ({
      appId: dbAppId,
      code,
    }))
  );
  const deletedStatusCodes = dbStatusCodes.filter((code) => !app.statusCodes.includes(code));
  changes.appStatusCodes.delete.push(
    ...deletedStatusCodes.map((code) => ({
      appId: dbAppId,
      code,
    }))
  );

  changes.layoutItems.update.push({
    sectionId,
    width: app.width,
    height: app.height,
    x: app.x,
    y: app.y,
    _where: app.id,
  });
};
