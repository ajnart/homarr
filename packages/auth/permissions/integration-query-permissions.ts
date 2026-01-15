import type { Session } from "next-auth";

import type { Database } from "@homarr/db";
import { and, eq, inArray, or } from "@homarr/db";
import { boards, boardUserPermissions, groupMembers } from "@homarr/db/schema";
import type { IntegrationPermission } from "@homarr/definitions";

import { constructIntegrationPermissions } from "./integration-permissions";

interface Integration {
  id: string;
  items: {
    item: {
      boardId: string;
    };
  }[];
  userPermissions: {
    permission: IntegrationPermission;
  }[];
  groupPermissions: {
    permission: IntegrationPermission;
  }[];
}

export const hasQueryAccessToIntegrationsAsync = async (
  db: Database,
  integrations: Integration[],
  session: Session | null,
) => {
  // If the user has board-view-all and every integration has at least one item that is placed on a board he has access.
  if (
    session?.user.permissions.includes("board-view-all") &&
    integrations.every((integration) => integration.items.length >= 1)
  ) {
    return true;
  }

  const integrationsWithUseAccess = integrations.filter(
    (integration) => constructIntegrationPermissions(integration, session).hasUseAccess,
  );

  // If the user has use access to all integrations, he has access.
  if (integrationsWithUseAccess.length === integrations.length) {
    return true;
  }

  const integrationsWithoutUseAccessAndWithoutBoardViewAllAccess = integrations
    .filter((integration) => !integrationsWithUseAccess.includes(integration))
    .filter((integration) => !(session?.user.permissions.includes("board-view-all") && integration.items.length >= 1));

  if (integrationsWithoutUseAccessAndWithoutBoardViewAllAccess.length === 0) {
    return true;
  }

  const integrationsWithBoardIds = integrationsWithoutUseAccessAndWithoutBoardViewAllAccess.map((integration) => ({
    id: integration.id,
    anyOfBoardIds: integration.items.map(({ item }) => item.boardId),
  }));

  const permissionsOfCurrentUserWhenPresent = await db.query.boardUserPermissions.findMany({
    where: eq(boardUserPermissions.userId, session?.user.id ?? ""),
  });

  // If for each integration the user has access to at least of of it's present boards, he has access.
  if (
    checkEveryIntegrationContainsSomeBoardIdIncludedInBoardsWithAccess(
      integrationsWithBoardIds,
      permissionsOfCurrentUserWhenPresent.map(({ boardId }) => boardId),
    )
  ) {
    return true;
  }

  const permissionsOfCurrentUserGroupsWhenPresent = await db.query.groupMembers.findMany({
    where: eq(groupMembers.userId, session?.user.id ?? ""),
    with: {
      group: {
        with: {
          boardPermissions: {},
        },
      },
    },
  });
  const boardIdsWithPermission = permissionsOfCurrentUserWhenPresent
    .map((permission) => permission.boardId)
    .concat(
      permissionsOfCurrentUserGroupsWhenPresent
        .map((groupMember) => groupMember.group.boardPermissions.map((permission) => permission.boardId))
        .flat(),
    );

  // If for each integration the user has access to at least of of it's present boards, he has access.
  if (
    checkEveryIntegrationContainsSomeBoardIdIncludedInBoardsWithAccess(integrationsWithBoardIds, boardIdsWithPermission)
  ) {
    return true;
  }

  const relevantBoardIds = [...new Set(integrationsWithBoardIds.map(({ anyOfBoardIds }) => anyOfBoardIds).flat())];
  const publicBoardsOrBoardsWhereCurrentUserIsOwner = await db.query.boards.findMany({
    where: and(
      or(eq(boards.isPublic, true), eq(boards.creatorId, session?.user.id ?? "")),
      inArray(boards.id, relevantBoardIds),
    ),
  });

  const boardsWithAccess = boardIdsWithPermission.concat(
    publicBoardsOrBoardsWhereCurrentUserIsOwner.map(({ id }) => id),
  );

  // If for each integration the user has access to at least of of it's present boards, he has access.
  return checkEveryIntegrationContainsSomeBoardIdIncludedInBoardsWithAccess(integrationsWithBoardIds, boardsWithAccess);
};

const checkEveryIntegrationContainsSomeBoardIdIncludedInBoardsWithAccess = (
  integration: { id: string; anyOfBoardIds: string[] }[],
  boardIdsWithAccess: string[],
) => {
  return integration.every(({ anyOfBoardIds }) =>
    anyOfBoardIds.some((boardId) => boardIdsWithAccess.includes(boardId)),
  );
};
