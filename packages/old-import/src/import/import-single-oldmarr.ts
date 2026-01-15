import { handleTransactionsAsync, inArray } from "@homarr/db";
import type { Database } from "@homarr/db";
import { apps } from "@homarr/db/schema";
import type { OldmarrConfig } from "@homarr/old-schema";

import { doAppsMatch } from "../prepare/prepare-apps";
import { prepareSingleImport } from "../prepare/prepare-single";
import type { OldmarrImportConfiguration } from "../settings";
import { createBoardInsertCollection } from "./collections/board-collection";

export const importSingleOldmarrConfigAsync = async (
  db: Database,
  config: OldmarrConfig,
  settings: OldmarrImportConfiguration,
) => {
  const { preparedApps, preparedBoards } = prepareSingleImport(config, settings);
  const existingApps = await db.query.apps.findMany({
    where: inArray(
      apps.href,
      preparedApps.map((app) => app.href).filter((href) => href !== null),
    ),
  });

  preparedApps.forEach((app) => {
    const existingApp = existingApps.find((existingApp) => doAppsMatch(existingApp, app));
    if (existingApp) {
      app.existingId = existingApp.id;
    }
    return app;
  });

  const boardInsertCollection = createBoardInsertCollection({ preparedApps, preparedBoards }, settings);

  await handleTransactionsAsync(db, {
    async handleAsync(db) {
      await boardInsertCollection.insertAllAsync(db);
    },
    handleSync(db) {
      boardInsertCollection.insertAll(db);
    },
  });
};
