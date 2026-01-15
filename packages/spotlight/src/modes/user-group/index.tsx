import type { SearchMode } from "../../lib/mode";
import { groupsSearchGroup } from "./groups-search-group";
import { usersSearchGroup } from "./users-search-group";

export const userGroupMode = {
  modeKey: "userGroup",
  character: "@",
  groups: [usersSearchGroup, groupsSearchGroup],
} satisfies SearchMode;
