import { Group, Stack, Text } from "@mantine/core";
import { IconEye, IconUsersGroup } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { useI18n } from "@homarr/translation/client";

import { createChildrenOptions } from "../../lib/children";
import { createGroup } from "../../lib/group";
import { interaction } from "../../lib/interaction";

// This has to be type so it can be interpreted as Record<string, unknown>.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Group = { id: string; name: string };

const groupChildrenOptions = createChildrenOptions<Group>({
  useActions: () => [
    {
      key: "detail",
      Component: () => {
        const t = useI18n();
        return (
          <Group mx="md" my="sm">
            <IconEye stroke={1.5} />
            <Text>{t("search.mode.userGroup.group.group.children.action.detail.label")}</Text>
          </Group>
        );
      },
      useInteraction: interaction.link(({ id }) => ({ href: `/manage/users/groups/${id}` })),
    },
    {
      key: "manageMember",
      Component: () => {
        const t = useI18n();
        return (
          <Group mx="md" my="sm">
            <IconUsersGroup stroke={1.5} />
            <Text>{t("search.mode.userGroup.group.group.children.action.manageMember.label")}</Text>
          </Group>
        );
      },
      useInteraction: interaction.link(({ id }) => ({ href: `/manage/users/groups/${id}/members` })),
    },
    {
      key: "managePermission",
      Component: () => {
        const t = useI18n();
        return (
          <Group mx="md" my="sm">
            <IconEye stroke={1.5} />
            <Text>{t("search.mode.userGroup.group.group.children.action.managePermission.label")}</Text>
          </Group>
        );
      },
      useInteraction: interaction.link(({ id }) => ({ href: `/manage/users/groups/${id}/permissions` })),
    },
  ],
  DetailComponent: ({ options }) => {
    const t = useI18n();
    return (
      <Stack mx="md" my="sm">
        <Text>{t("search.mode.userGroup.group.group.children.detail.title")}</Text>

        <Group>
          <Text>{options.name}</Text>
        </Group>
      </Stack>
    );
  },
});

export const groupsSearchGroup = createGroup<Group>({
  keyPath: "id",
  title: "Groups",
  Component: ({ name }) => (
    <Group px="md" py="sm">
      <Text>{name}</Text>
    </Group>
  ),
  useInteraction: interaction.children(groupChildrenOptions),
  useQueryOptions(query) {
    return clientApi.group.search.useQuery({ query, limit: 5 });
  },
});
