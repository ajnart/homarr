import { Avatar, Badge, Menu, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconInfoCircle,
  IconLogin,
  IconLogout,
  IconMoonStars,
  IconSun,
  IconUserCog,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { forwardRef } from 'react';
import { AboutModal } from '~/components/Dashboard/Modals/AboutModal/AboutModal';
import { useColorScheme } from '~/hooks/use-colorscheme';
import { usePackageAttributesStore } from '~/tools/client/zustands/usePackageAttributesStore';

import { REPO_URL } from '../../../../data/constants';

export const AvatarMenu = () => {
  const [aboutModalOpened, aboutModal] = useDisclosure(false);
  const { data: sessionData } = useSession();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const newVersionAvailable = useNewVersionAvailable();

  const Icon = colorScheme === 'dark' ? IconSun : IconMoonStars;

  return (
    <>
      <UnstyledButton>
        <Menu width={256}>
          <Menu.Target>
            <CurrentUserAvatar user={sessionData?.user ?? null} />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item icon={<Icon size="1rem" />} onClick={toggleColorScheme}>
              Switch theme
            </Menu.Item>
            {sessionData?.user && (
              <>
                <Menu.Item
                  component={Link}
                  href="/user/preferences"
                  icon={<IconUserCog size="1rem" />}
                >
                  User preferences
                </Menu.Item>
                <Menu.Item component={Link} href="/board" icon={<IconDashboard size="1rem" />}>
                  Default Dashboard
                </Menu.Item>
                <Menu.Divider />
              </>
            )}
            <Menu.Item
              icon={<IconInfoCircle size="1rem" />}
              rightSection={
                newVersionAvailable && (
                  <Badge variant="light" color="blue">
                    New
                  </Badge>
                )
              }
              onClick={() => aboutModal.open()}
            >
              About
            </Menu.Item>
            {sessionData?.user ? (
              <Menu.Item icon={<IconLogout size="1rem" />} color="red" onClick={() => signOut()}>
                Logout from {sessionData.user.name}
              </Menu.Item>
            ) : (
              <Menu.Item icon={<IconLogin size="1rem" />} component={Link} href="/auth/login">
                Login
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </UnstyledButton>

      <AboutModal
        opened={aboutModalOpened}
        closeModal={aboutModal.close}
        newVersionAvailable={newVersionAvailable}
      />
    </>
  );
};

type CurrentUserAvatarProps = {
  user: User | null;
};

const CurrentUserAvatar = forwardRef<HTMLDivElement, CurrentUserAvatarProps>(
  ({ user, ...others }, ref) => {
    const { primaryColor } = useMantineTheme();
    if (!user) return <Avatar ref={ref} {...others} />;
    return (
      <Avatar ref={ref} color={primaryColor} {...others}>
        {user.name?.slice(0, 2).toUpperCase()}
      </Avatar>
    );
  }
);

const useNewVersionAvailable = () => {
  const { attributes } = usePackageAttributesStore();
  const { data } = useQuery({
    queryKey: ['github/latest'],
    cacheTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 5,
    queryFn: () =>
      fetch(`https://api.github.com/repos/${REPO_URL}/releases/latest`).then((res) => res.json()),
  });
  return data?.tag_name > `v${attributes.packageVersion}` ? data?.tag_name : undefined;
};
