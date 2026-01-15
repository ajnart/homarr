import type { SearchMode } from "../../lib/mode";
import { contextSpecificActionsSearchGroups } from "./context-specific-group";
import { globalCommandGroup } from "./global-group";

export const commandMode = {
  modeKey: "command",
  character: ">",
  groups: [contextSpecificActionsSearchGroups, globalCommandGroup],
} satisfies SearchMode;
