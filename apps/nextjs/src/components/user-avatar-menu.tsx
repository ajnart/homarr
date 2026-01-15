"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Menu, Stack, Text, useMantineColorScheme } from "@mantine/core";
import { useHotkeys, useTimeout } from "@mantine/hooks";
import {
  IconCheck,
  IconHome,
  IconLogin,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
  IconTool,
} from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { signOut, useSession } from "@homarr/auth/client";
import { hotkeys } from "@homarr/definitions";
import { createModal, useModalAction } from "@homarr/modals";
import { useScopedI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";

import { useAuthContext } from "~/app/[locale]/_client-providers/session";
import { CurrentLanguageCombobox } from "./language/current-language-combobox";
import { AvailableUpdatesMenuItem } from "./layout/header/update";

interface UserAvatarMenuProps {
  children: ReactNode;
  availableUpdatesPromise?: Promise<RouterOutputs["updateChecker"]["getAvailableUpdates"]>;
}

export const UserAvatarMenu = ({ children, availableUpdatesPromise }: UserAvatarMenuProps) => {
  const t = useScopedI18n("common.userAvatar.menu");
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  useHotkeys([[hotkeys.toggleColorScheme, toggleColorScheme]]);

  const ColorSchemeIcon = colorScheme === "dark" ? IconSun : IconMoon;

  const colorSchemeText = colorScheme === "dark" ? t("switchToLightMode") : t("switchToDarkMode");

  const session = useSession();
  const router = useRouter();

  const { logoutUrl } = useAuthContext();
  const { openModal } = useModalAction(LogoutModal);

  const handleSignout = useCallback(async () => {
    await signOut({
      redirect: false,
    });
    openModal({
      onTimeout: () => {
        if (logoutUrl) {
          window.location.assign(logoutUrl);
          return;
        }
        router.refresh();
      },
    });
  }, [logoutUrl, openModal, router]);

  return (
    // We use keepMounted so we can add event listeners to prevent navigating away without saving the board
    <Menu width={300} withArrow withinPortal keepMounted>
      <Menu.Dropdown>
        <AvailableUpdatesMenuItem availableUpdatesPromise={availableUpdatesPromise} />
        <Menu.Item onClick={toggleColorScheme} leftSection={<ColorSchemeIcon size="1rem" />}>
          {colorSchemeText}
        </Menu.Item>
        <Menu.Item component={Link} href="/boards" leftSection={<IconHome size="1rem" />}>
          {t("homeBoard")}
        </Menu.Item>
        <Menu.Divider />

        <Menu.Item p={0} closeMenuOnClick={false} component="div">
          <CurrentLanguageCombobox />
        </Menu.Item>
        <Menu.Divider />
        {Boolean(session.data) && (
          <>
            <Menu.Item
              component={Link}
              href={`/manage/users/${session.data?.user.id}/general`}
              leftSection={<IconSettings size="1rem" />}
            >
              {t("preferences")}
            </Menu.Item>

            <Menu.Item component={Link} href="/manage" leftSection={<IconTool size="1rem" />}>
              {t("management")}
            </Menu.Item>
          </>
        )}
        <Menu.Divider />
        {session.status === "authenticated" ? (
          <Menu.Item onClick={handleSignout} leftSection={<IconLogout size="1rem" />} color="red">
            {t("logout")}
          </Menu.Item>
        ) : (
          <Menu.Item component={Link} href="/auth/login" leftSection={<IconLogin size="1rem" />}>
            {t("login")}
          </Menu.Item>
        )}
      </Menu.Dropdown>
      <Menu.Target>{children}</Menu.Target>
    </Menu>
  );
};

const LogoutModal = createModal<{ onTimeout: () => void }>(({ actions, innerProps }) => {
  const t = useScopedI18n("common.userAvatar.menu");
  const { start } = useTimeout(() => {
    actions.closeModal();
    innerProps.onTimeout();
  }, 1500);

  useEffect(() => {
    start();
  }, [start]);

  return (
    <Center h={200 - 2 * 16}>
      <Stack align="center" c="green">
        <IconCheck size={50} />
        <Text ta="center" fw="bold">
          {t("loggedOut")}
        </Text>
      </Stack>
    </Center>
  );
}).withOptions({
  centered: true,
  withCloseButton: false,
  transitionProps: {
    transition: "pop",
  },
  size: 200,
  closeOnClickOutside: false,
  closeOnEscape: false,
});
