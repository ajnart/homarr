import type { Session } from "next-auth";

import type { IntegrationPermission } from "@homarr/definitions";

export interface IntegrationPermissionsProps {
  userPermissions: {
    permission: IntegrationPermission;
  }[];
  groupPermissions: {
    permission: IntegrationPermission;
  }[];
}

export const constructIntegrationPermissions = (integration: IntegrationPermissionsProps, session: Session | null) => {
  const permissions = integration.userPermissions
    .concat(integration.groupPermissions)
    .map(({ permission }) => permission);

  return {
    hasFullAccess:
      (session?.user.permissions.includes("integration-full-all") ?? false) || permissions.includes("full"),
    hasInteractAccess:
      permissions.includes("full") ||
      permissions.includes("interact") ||
      (session?.user.permissions.includes("integration-interact-all") ?? false),
    hasUseAccess: permissions.length >= 1 || (session?.user.permissions.includes("integration-use-all") ?? false),
  };
};
