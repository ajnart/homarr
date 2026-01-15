import type { ValidAnalyseConfig } from "../analyse/types";
import type { BoardSelectionMap } from "../components/initial/board-selection-card";

export const prepareBoards = (analyseConfigs: ValidAnalyseConfig[], selections: BoardSelectionMap) => {
  return analyseConfigs.filter(({ name }) => selections.get(name));
};
