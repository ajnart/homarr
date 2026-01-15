"use client";

import { IconPlayerPlay, IconSelector, IconSettings } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { integrationPermissions, integrationPermissionsMap } from "@homarr/definitions";
import { useI18n } from "@homarr/translation/client";

import { AccessSettings } from "~/components/access/access-settings";

interface Props {
  integration: RouterOutputs["integration"]["byId"];
  initialPermissions: RouterOutputs["integration"]["getIntegrationPermissions"];
}

export const IntegrationAccessSettings = ({ integration, initialPermissions }: Props) => {
  const t = useI18n();
  const utils = clientApi.useUtils();
  const { data } = clientApi.integration.getIntegrationPermissions.useQuery(
    {
      id: integration.id,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      initialData: initialPermissions,
    },
  );
  const usersMutation = clientApi.integration.saveUserIntegrationPermissions.useMutation();
  const groupsMutation = clientApi.integration.saveGroupIntegrationPermissions.useMutation();

  return (
    <AccessSettings
      entity={{
        id: integration.id,
        ownerId: null,
        owner: null,
      }}
      permission={{
        items: integrationPermissions,
        default: "use",
        fullAccessGroupPermission: "integration-full-all",
        icons: {
          use: IconSelector,
          interact: IconPlayerPlay,
          full: IconSettings,
        },
        groupPermissionMapping: integrationPermissionsMap,
      }}
      translate={(key) => t(`integration.permission.${key}`)}
      query={{
        data,
        invalidate: () => utils.integration.getIntegrationPermissions.invalidate(),
      }}
      groupsMutation={groupsMutation}
      usersMutation={usersMutation}
    />
  );
};
