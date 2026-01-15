import { TRPCError } from "@trpc/server";

import type { Session } from "@homarr/auth";
import { constructIntegrationPermissions } from "@homarr/auth/shared";
import type { Database, SQL } from "@homarr/db";
import { eq, inArray } from "@homarr/db";
import { groupMembers, integrationGroupPermissions, integrationUserPermissions } from "@homarr/db/schema";
import type { IntegrationPermission } from "@homarr/definitions";

/**
 * Throws NOT_FOUND if user is not allowed to perform action on integration
 * @param ctx trpc router context
 * @param integrationWhere where clause for the integration
 * @param permission permission required to perform action on integration
 */
export const throwIfActionForbiddenAsync = async (
  ctx: { db: Database; session: Session | null },
  integrationWhere: SQL<unknown>,
  permission: IntegrationPermission,
) => {
  const { db, session } = ctx;
  const groupsOfCurrentUser = await db.query.groupMembers.findMany({
    where: eq(groupMembers.userId, session?.user.id ?? ""),
  });
  const integration = await db.query.integrations.findFirst({
    where: integrationWhere,
    columns: {
      id: true,
    },
    with: {
      userPermissions: {
        where: eq(integrationUserPermissions.userId, session?.user.id ?? ""),
      },
      groupPermissions: {
        where: inArray(
          integrationGroupPermissions.groupId,
          groupsOfCurrentUser.map((group) => group.groupId).concat(""),
        ),
      },
    },
  });

  if (!integration) {
    notAllowed();
  }

  const { hasUseAccess, hasInteractAccess, hasFullAccess } = constructIntegrationPermissions(integration, session);

  if (hasFullAccess) {
    return; // As full access is required and user has full access, allow
  }

  if (["interact", "use"].includes(permission) && hasInteractAccess) {
    return; // As interact access is required and user has interact access, allow
  }

  if (permission === "use" && hasUseAccess) {
    return; // As use access is required and user has use access, allow
  }

  notAllowed();
};

/**
 * This method returns NOT_FOUND to prevent snooping on board existence
 * A function is used to use the method without return statement
 */
function notAllowed(): never {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Integration not found",
  });
}
