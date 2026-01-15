import type { OldmarrConfig } from "@homarr/old-schema";

import type { OldmarrImportConfiguration } from "../settings";
import { prepareApps } from "./prepare-apps";

export const prepareSingleImport = (config: OldmarrConfig, settings: OldmarrImportConfiguration) => {
  const validAnalyseConfigs = [{ name: settings.name, config, isError: false }];

  return {
    preparedApps: prepareApps(validAnalyseConfigs),
    preparedBoards: settings.onlyImportApps ? [] : validAnalyseConfigs,
  };
};
