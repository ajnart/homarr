import { Group, Stack, Text } from "@mantine/core";

import { objectEntries } from "@homarr/common";
import { integrationDefs } from "@homarr/definitions";
import { useI18n } from "@homarr/translation/client";
import { IntegrationAvatar } from "@homarr/ui";

import { createChildrenOptions } from "../../../lib/children";
import { interaction } from "../../../lib/interaction";

export const newIntegrationChildrenOptions = createChildrenOptions<Record<string, unknown>>({
  useActions: (_, query) => {
    const normalizedQuery = query.trim().toLowerCase();
    return objectEntries(integrationDefs)
      .filter(([, integrationDef]) => integrationDef.name.toLowerCase().includes(normalizedQuery))
      .sort(
        ([, definitionA], [, definitionB]) =>
          definitionA.name.toLowerCase().indexOf(normalizedQuery) -
          definitionB.name.toLowerCase().indexOf(normalizedQuery),
      )
      .map(([kind, integrationDef]) => ({
        key: kind,
        Component() {
          return (
            <Group mx="md" my="sm" wrap="nowrap" w="100%">
              <IntegrationAvatar kind={kind} size="sm" />
              <Text>{integrationDef.name}</Text>
            </Group>
          );
        },
        useInteraction: interaction.link(() => ({ href: `/manage/integrations/new?kind=${kind}` })),
      }));
  },
  DetailComponent() {
    const t = useI18n();

    return (
      <Stack mx="md" my="sm">
        <Text>{t("search.mode.command.group.globalCommand.option.newIntegration.children.detail.title")}</Text>
      </Stack>
    );
  },
});
