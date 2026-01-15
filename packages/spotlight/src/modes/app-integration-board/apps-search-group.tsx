import { Avatar, Group, Stack, Text } from "@mantine/core";
import { IconExternalLink, IconEye } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { useI18n } from "@homarr/translation/client";

import { createChildrenOptions } from "../../lib/children";
import { createGroup } from "../../lib/group";
import { interaction } from "../../lib/interaction";

// This has to be type so it can be interpreted as Record<string, unknown>.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type App = { id: string; name: string; iconUrl: string; href: string | null };

const appChildrenOptions = createChildrenOptions<App>({
  useActions: () => [
    {
      key: "open",
      Component: () => {
        const t = useI18n();

        return (
          <Group mx="md" my="sm">
            <IconExternalLink stroke={1.5} />
            <Text>{t("search.mode.appIntegrationBoard.group.app.children.action.open.label")}</Text>
          </Group>
        );
      },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      useInteraction: interaction.link((option) => ({ href: option.href! })),
      hide(option) {
        return !option.href;
      },
    },
    {
      key: "edit",
      Component: () => {
        const t = useI18n();

        return (
          <Group mx="md" my="sm">
            <IconEye stroke={1.5} />
            <Text>{t("search.mode.appIntegrationBoard.group.app.children.action.edit.label")}</Text>
          </Group>
        );
      },
      useInteraction: interaction.link(({ id }) => ({ href: `/manage/apps/edit/${id}` })),
    },
  ],
  DetailComponent: ({ options }) => {
    const t = useI18n();

    return (
      <Stack mx="md" my="sm">
        <Text>{t("search.mode.appIntegrationBoard.group.app.children.detail.title")}</Text>

        <Group>
          <Avatar
            size="sm"
            src={options.iconUrl}
            radius={0}
            styles={{
              image: {
                objectFit: "contain",
              },
            }}
          />
          <Text>{options.name}</Text>
        </Group>
      </Stack>
    );
  },
});

export const appsSearchGroup = createGroup<App>({
  keyPath: "id",
  title: (t) => t("search.mode.appIntegrationBoard.group.app.title"),
  Component: (app) => (
    <Group px="md" py="sm">
      <Avatar
        size="sm"
        src={app.iconUrl}
        radius={0}
        styles={{
          image: {
            objectFit: "contain",
          },
        }}
      />
      <Text>{app.name}</Text>
    </Group>
  ),
  useInteraction: interaction.children(appChildrenOptions),
  useQueryOptions(query) {
    return clientApi.app.search.useQuery({ query, limit: 5 });
  },
});
