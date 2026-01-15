import { Group, Text } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import type { IntegrationKind } from "@homarr/definitions";
import { IntegrationAvatar } from "@homarr/ui";

import { createGroup } from "../../lib/group";
import { interaction } from "../../lib/interaction";

export const integrationsSearchGroup = createGroup<{ id: string; kind: IntegrationKind; name: string }>({
  keyPath: "id",
  title: (t) => t("search.mode.appIntegrationBoard.group.integration.title"),
  Component: (integration) => (
    <Group px="md" py="sm">
      <IntegrationAvatar size="sm" kind={integration.kind} />

      <Text>{integration.name}</Text>
    </Group>
  ),
  useInteraction: interaction.link(({ id }) => ({ href: `/manage/integrations/edit/${id}` })),
  useQueryOptions(query) {
    return clientApi.integration.search.useQuery({ query, limit: 5 });
  },
});
