import type { PropsWithChildren } from "react";
import { AppShellMain } from "@mantine/core";
import {
  IconAffiliateFilled,
  IconBook2,
  IconBox,
  IconBrandDiscord,
  IconBrandDocker,
  IconBrandGithub,
  IconBrandTablerFilled,
  IconCertificate,
  IconClipboardListFilled,
  IconDirectionsFilled,
  IconGitFork,
  IconHelpSquareRoundedFilled,
  IconHomeFilled,
  IconLayoutDashboardFilled,
  IconMailForward,
  IconPhotoFilled,
  IconPointerFilled,
  IconSearch,
  IconSettingsFilled,
  IconUserFilled,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";

import { auth } from "@homarr/auth/next";
import { isProviderEnabled } from "@homarr/auth/server";
import { createDocumentationLink } from "@homarr/definitions";
import { env } from "@homarr/docker/env";
import { getScopedI18n } from "@homarr/translation/server";

import { MainHeader } from "~/components/layout/header";
import { homarrLogoPath } from "~/components/layout/logo/homarr-logo";
import type { NavigationLink } from "~/components/layout/navigation";
import { MainNavigation } from "~/components/layout/navigation";
import { ClientShell } from "~/components/layout/shell";

export default async function ManageLayout({ children }: PropsWithChildren) {
  const t = await getScopedI18n("management.navbar");
  const session = await auth();
  const navigationLinks: NavigationLink[] = [
    {
      label: t("items.home"),
      icon: IconHomeFilled,
      href: "/manage",
    },
    {
      icon: IconLayoutDashboardFilled,
      href: "/manage/boards",
      label: t("items.boards"),
    },
    {
      icon: IconBox,
      href: "/manage/apps",
      label: t("items.apps"),
      hidden: !session,
      iconProps: {
        strokeWidth: 2.5,
      },
    },
    {
      icon: IconAffiliateFilled,
      href: "/manage/integrations",
      label: t("items.integrations"),
      hidden: !session,
    },
    {
      icon: IconSearch,
      href: "/manage/search-engines",
      label: t("items.searchEngies"),
      hidden: !session,
      iconProps: {
        strokeWidth: 2.5,
      },
    },
    {
      icon: IconPhotoFilled,
      href: "/manage/medias",
      label: t("items.medias"),
      hidden: !session,
    },
    {
      icon: IconUserFilled,
      label: t("items.users.label"),
      hidden: !session?.user.permissions.includes("admin"),
      items: [
        {
          label: t("items.users.items.manage"),
          icon: IconUsers,
          href: "/manage/users",
        },
        {
          label: t("items.users.items.invites"),
          icon: IconMailForward,
          href: "/manage/users/invites",
          hidden: !isProviderEnabled("credentials"),
        },
        {
          label: t("items.users.items.groups"),
          icon: IconUsersGroup,
          href: "/manage/users/groups",
        },
      ],
    },
    {
      label: t("items.tools.label"),
      icon: IconPointerFilled,
      // As permissions always include there children permissions, we can check other-view-logs as admin includes it
      hidden: !session?.user.permissions.includes("other-view-logs"),
      items: [
        {
          label: t("items.tools.items.docker"),
          icon: IconBrandDocker,
          href: "/manage/tools/docker",
          hidden: !(session?.user.permissions.includes("admin") && env.ENABLE_DOCKER),
        },
        {
          label: t("items.tools.items.kubernetes"),
          icon: IconBox,
          href: "/manage/tools/kubernetes",
          hidden: !(session?.user.permissions.includes("admin") && env.ENABLE_KUBERNETES),
        },
        {
          label: t("items.tools.items.api"),
          icon: IconDirectionsFilled,
          href: "/manage/tools/api",
          hidden: !session?.user.permissions.includes("admin"),
        },
        {
          label: t("items.tools.items.logs"),
          icon: IconBrandTablerFilled,
          href: "/manage/tools/logs",
          hidden: !session?.user.permissions.includes("other-view-logs"),
        },
        {
          label: t("items.tools.items.certificates"),
          icon: IconCertificate,
          href: "/manage/tools/certificates",
          hidden: !session?.user.permissions.includes("admin"),
        },
        {
          label: t("items.tools.items.tasks"),
          icon: IconClipboardListFilled,
          href: "/manage/tools/tasks",
          hidden: !session?.user.permissions.includes("admin"),
        },
      ],
    },
    {
      label: t("items.settings"),
      href: "/manage/settings",
      icon: IconSettingsFilled,
      hidden: !session?.user.permissions.includes("admin"),
    },
    {
      label: t("items.help.label"),
      icon: IconHelpSquareRoundedFilled,
      items: [
        {
          label: t("items.help.items.documentation"),
          icon: IconBook2,
          href: createDocumentationLink("/docs/getting-started"),
          external: true,
        },
        {
          label: t("items.help.items.submitIssue"),
          icon: IconBrandGithub,
          href: "https://github.com/homarr-labs/homarr/issues/new/choose",
          external: true,
        },
        {
          label: t("items.help.items.discord"),
          icon: IconBrandDiscord,
          href: "https://discord.com/invite/aCsmEV5RgA",
          external: true,
        },
        {
          label: t("items.help.items.sourceCode"),
          icon: IconGitFork,
          href: "https://github.com/homarr-labs/homarr",
          external: true,
        },
      ],
    },
    {
      label: t("items.about"),
      icon: homarrLogoPath,
      href: "/manage/about",
    },
  ];

  return (
    <ClientShell hasNavigation>
      <MainHeader></MainHeader>
      <MainNavigation links={navigationLinks}></MainNavigation>
      <AppShellMain>{children}</AppShellMain>
    </ClientShell>
  );
}
