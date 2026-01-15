import { useSession } from "@homarr/auth/client";

import type { SearchGroup } from "../../lib/group";
import type { SearchMode } from "../../lib/mode";
import { appsSearchGroup } from "./apps-search-group";
import { boardsSearchGroup } from "./boards-search-group";
import { integrationsSearchGroup } from "./integrations-search-group";

export const appIntegrationBoardMode = {
  modeKey: "appIntegrationBoard",
  character: "#",
  useGroups() {
    const { data: session } = useSession();
    const groups: SearchGroup[] = [boardsSearchGroup];

    if (!session?.user) {
      return groups;
    }

    return groups.concat([appsSearchGroup, integrationsSearchGroup]);
  },
} satisfies SearchMode;
