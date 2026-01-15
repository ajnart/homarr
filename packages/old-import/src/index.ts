import type { Database } from "@homarr/db";
import type { OldmarrConfig } from "@homarr/old-schema";

import { importSingleOldmarrConfigAsync } from "./import/import-single-oldmarr";
import type { OldmarrImportConfiguration } from "./settings";

export const importOldmarrAsync = async (
  db: Database,
  old: OldmarrConfig,
  configuration: OldmarrImportConfiguration,
) => {
  await importSingleOldmarrConfigAsync(db, old, configuration);
};
