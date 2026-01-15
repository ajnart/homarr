import type { SearchMode } from "../../lib/mode";
import { contextSpecificSearchGroups } from "./context-specific-group";
import { homeSearchEngineGroup } from "./home-search-engine-group";

export const homeMode = {
  character: undefined,
  modeKey: "home",
  groups: [homeSearchEngineGroup, contextSpecificSearchGroups],
} satisfies SearchMode;
