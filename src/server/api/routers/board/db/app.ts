import { randomUUID } from 'crypto';
import { inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/server/db';
import { layoutItems } from '~/server/db/schema';
import { appSchema } from '~/validations/app';

import { BoardSaveDbChanges } from '.';

export const getAppsForSectionsAsync = async (sectionIds: string[]) => {
  if (sectionIds.length === 0) return [];

  return await db.query.apps.findMany({
    with: {
      statusCodes: {
        columns: {
          code: true,
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
