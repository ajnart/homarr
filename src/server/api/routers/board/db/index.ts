import { InferSelectModel } from 'drizzle-orm';
import { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import {
  appStatusCodes,
  apps,
  items,
  layoutItems,
  sections,
  widgetOptions,
  widgets,
} from '~/server/db/schema';

type DbChanges<TSqliteTable extends SQLiteTableWithColumns<any>, TId = string, TWhere = string> = {
  create: InferSelectModel<TSqliteTable>[];
  update: (Partial<InferSelectModel<TSqliteTable>> & { _where: TWhere })[];
  delete: TId[];
};

export type BoardSaveDbChanges = {
  apps: DbChanges<typeof apps>;
  appStatusCodes: DbChanges<typeof appStatusCodes, { code: number; appId: string }>;
  items: DbChanges<typeof items>;
  layoutItems: DbChanges<typeof layoutItems>;
  widgets: DbChanges<typeof widgets>;
  widgetOptions: DbChanges<
    typeof widgetOptions,
    { path: string; widgetId: string },
    { path: string; widgetId: string }
  >;
  sections: DbChanges<typeof sections>;
};

const dbChanges = () => ({
  create: [],
  update: [],
  delete: [],
});

export const createBoardSaveDbChanges = (): BoardSaveDbChanges => ({
  apps: dbChanges(),
  appStatusCodes: dbChanges(),
  items: dbChanges(),
  layoutItems: dbChanges(),
  widgets: dbChanges(),
  widgetOptions: dbChanges(),
  sections: dbChanges(),
});
