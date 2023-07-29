import { Avatar, Badge, Menu, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconInfoCircle,
  IconLogin,
  IconLogout,
  IconSun,
  IconUserSearch,
} from '@tabler/icons-react';
import { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { forwardRef } from 'react';
import { AboutModal } from '~/components/Dashboard/Modals/AboutModal/AboutModal';

export const AvatarMenu = () => {
  const newVersionAvailable = '0.13.0';
  const [aboutModalOpened, aboutModal] = useDisclosure(false);
  const { data: sessionData } = useSession();

  return (
    <>
      <UnstyledButton>
        <Menu>
          <Menu.Target>
            <CurrentUserAvatar user={sessionData?.user ?? null} />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item icon={<IconSun size="1rem" />}>Switch theme</Menu.Item>
            {sessionData?.user && (
              <>
                <Menu.Item icon={<IconUserSearch size="1rem" />}>View Profile</Menu.Item>
                <Menu.Item icon={<IconDashboard size="1rem" />}>Default Dashboard</Menu.Item>
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
                Logout
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
