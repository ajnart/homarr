import { Group, Text } from "@mantine/core";
import {
  IconBox,
  IconBrandDocker,
  IconHome,
  IconInfoSmall,
  IconLayoutDashboard,
  IconLogs,
  IconMailForward,
  IconPhoto,
  IconPlug,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";

import { useSession } from "@homarr/auth/client";
import { useScopedI18n } from "@homarr/translation/client";
import type { TablerIcon } from "@homarr/ui";

import { createGroup } from "../../lib/group";
import { interaction } from "../../lib/interaction";

export const pagesSearchGroup = createGroup<{
  icon: TablerIcon;
  name: string;
  path: string;
}>({
  keyPath: "path",
  title: (t) => t("search.mode.page.group.page.title"),
  Component: ({ name, icon: Icon }) => (
    <Group px="md" py="sm">
      <Icon stroke={1.5} />
      <Text>{name}</Text>
    </Group>
  ),
  useInteraction: interaction.link(({ path }) => ({ href: path })),
  filter: (query, { name, path }) => {
    const normalizedQuery = query.trim().toLowerCase();
    return name.toLowerCase().includes(normalizedQuery) || path.toLowerCase().includes(normalizedQuery);
  },
  sort: (query, options) => {
    const normalizedQuery = query.trim().toLowerCase();

    const nameMatches = options.map((option) => option.name.toLowerCase().includes(normalizedQuery));
    const pathMatches = options.map((option) => option.path.toLowerCase().includes(normalizedQuery));

    if (nameMatches.every(Boolean) && pathMatches.every(Boolean)) {
      return 0;
    }

    if (nameMatches.every(Boolean) && !pathMatches.every(Boolean)) {
      return pathMatches[0] ? -1 : 1;
    }

    return nameMatches[0] ? -1 : 1;
  },
  useOptions() {
    const { data: session } = useSession();
    const t = useScopedI18n("search.mode.page.group.page.option");

    const managePages = [
      {
        icon: IconHome,
        path: "/manage",
        name: t("manageHome.label"),
      },
      {
        icon: IconLayoutDashboard,
        path: "/manage/boards",
        name: t("manageBoard.label"),
      },
      {
        icon: IconBox,
        path: "/manage/apps",
        name: t("manageApp.label"),
        hidden: !session,
      },
      {
        icon: IconPlug,
        path: "/manage/integrations",
        name: t("manageIntegration.label"),
        hidden: !session,
      },
      {
        icon: IconSearch,
        path: "/manage/search-engines",
        name: t("manageSearchEngine.label"),
        hidden: !session,
      },
      {
        icon: IconPhoto,
        path: "/manage/medias",
        name: t("manageMedia.label"),
        hidden: !session,
      },
      {
        icon: IconUsers,
        path: "/manage/users",
        name: t("manageUser.label"),
        hidden: !session?.user.permissions.includes("admin"),
      },
      {
        icon: IconMailForward,
        path: "/manage/users/invites",
        name: t("manageInvite.label"),
        hidden: !session?.user.permissions.includes("admin"),
      },
      {
        icon: IconUsersGroup,
        path: "/manage/users/groups",
        name: t("manageGroup.label"),
        hidden: !session?.user.permissions.includes("admin"),
      },
      {
        icon: IconBrandDocker,
        path: "/manage/tools/docker",
        name: "Manage Docker",
        hidden: !session?.user.permissions.includes("admin"),
      },
      {
        icon: IconPlug,
        path: "/manage/tools/api",
        name: t("manageApi.label"),
        hidden: !session?.user.permissions.includes("admin"),
      },
      {
        icon: IconLogs,
        path: "/manage/tools/logs",
        name: t("manageLog.label"),
        hidden: !session?.user.permissions.includes("other-view-logs"),
      },
      {
        icon: IconReport,
        path: "/manage/tools/tasks",
        name: t("manageTask.label"),
        hidden: !session?.user.permissions.includes("admin"),
      },
      {
        icon: IconSettings,
        path: "/manage/settings",
        name: t("manageSettings.label"),
        hidden: !session?.user.permissions.includes("admin"),
      },
      {
        icon: IconInfoSmall,
        path: "/manage/about",
        name: t("about.label"),
      },
    ];

    const otherPages = [
      {
        icon: IconHome,
        path: "/boards",
        name: t("homeBoard.label"),
      },
      {
        icon: IconSettings,
        path: `/manage/users/${session?.user.id}/general`,
        name: t("preferences.label"),
        hidden: !session,
      },
    ];

    return otherPages.concat(managePages).filter(({ hidden }) => !hidden);
  },
});
