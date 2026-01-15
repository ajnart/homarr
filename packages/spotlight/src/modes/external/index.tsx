import type { SearchMode } from "../../lib/mode";
import { searchEnginesSearchGroups } from "./search-engines-search-group";

export const externalMode = {
  modeKey: "external",
  character: "!",
  groups: [searchEnginesSearchGroups],
} satisfies SearchMode;
