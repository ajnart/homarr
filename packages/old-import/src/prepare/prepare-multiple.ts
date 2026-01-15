import type { AnalyseConfig, ValidAnalyseConfig } from "../analyse/types";
import type { BoardSelectionMap } from "../components/initial/board-selection-card";
import type { InitialOldmarrImportSettings } from "../settings";
import { prepareApps } from "./prepare-apps";
import { prepareBoards } from "./prepare-boards";
import { prepareIntegrations } from "./prepare-integrations";

export const prepareMultipleImports = (
  analyseConfigs: AnalyseConfig[],
  settings: InitialOldmarrImportSettings,
  selections: BoardSelectionMap,
) => {
  const invalidConfigs = analyseConfigs.filter((item) => item.config === null);
  invalidConfigs.forEach(({ name }) => {
    console.warn(`Skipping import of ${name} due to error in configuration. See logs of container for more details.`);
  });

  const filteredConfigs = analyseConfigs.filter((item): item is ValidAnalyseConfig => item.config !== null);

  return {
    preparedApps: prepareApps(filteredConfigs),
    preparedBoards: settings.onlyImportApps ? [] : prepareBoards(filteredConfigs, selections),
    preparedIntegrations: prepareIntegrations(filteredConfigs),
  };
};
