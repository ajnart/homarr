import type { Session } from "next-auth";

import { db, eq, inArray } from "@homarr/db";
import { groupMembers, integrationGroupPermissions, integrationUserPermissions } from "@homarr/db/schema";

import { constructIntegrationPermissions } from "./integration-permissions";

export const getIntegrationsWithPermissionsAsync = async (session: Session | null) => {
  const groupsOfCurrentUser = await db.query.groupMembers.findMany({
    where: eq(groupMembers.userId, session?.user.id ?? ""),
  });
  const integrations = await db.query.integrations.findMany({
    columns: {
      id: true,
      name: true,
      url: true,
      kind: true,
    },
    with: {
      userPermissions: {
        where: eq(integrationUserPermissions.userId, session?.user.id ?? ""),
      },
      groupPermissions: {
        where: inArray(
          integrationGroupPermissions.groupId,
          groupsOfCurrentUser.map((group) => group.groupId),
        ),
      },
    },
  });

  return integrations.map(({ userPermissions, groupPermissions, ...integration }) => ({
    ...integration,
    permissions: constructIntegrationPermissions({ userPermissions, groupPermissions }, session),
  }));
};
