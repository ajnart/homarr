import { Avatar, Menu, UnstyledButton, useMantineTheme } from '@mantine/core';
import {
  IconDashboard,
  IconHomeShare,
  IconLogin,
  IconLogout,
  IconMoonStars,
  IconSun,
  IconUserCog,
} from '@tabler/icons-react';
import { createHash } from 'crypto';
import { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { forwardRef } from 'react';
import { useColorScheme } from '~/hooks/use-colorscheme';

import { useBoardLink } from '../Templates/BoardLayout';

export const AvatarMenu = () => {
  const { t } = useTranslation('layout/header');
  const { data: sessionData } = useSession();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const Icon = colorScheme === 'dark' ? IconSun : IconMoonStars;
  const defaultBoardHref = useBoardLink('/board');

  return (
    <UnstyledButton>
      <Menu width={256}>
        <Menu.Target>
          <CurrentUserAvatar user={sessionData?.user ?? null} />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            closeMenuOnClick={false}
            icon={<Icon size="1rem" />}
            onClick={toggleColorScheme}
          >
            {t('actions.avatar.switchTheme')}
          </Menu.Item>
          {sessionData?.user && (
            <>
              <Menu.Item
                component={Link}
                passHref
                href="/user/preferences"
                icon={<IconUserCog size="1rem" />}
              >
                {t('actions.avatar.preferences')}
              </Menu.Item>
              <Menu.Item
                component={Link}
                href={defaultBoardHref}
                icon={<IconDashboard size="1rem" />}
              >
                {t('actions.avatar.defaultBoard')}
              </Menu.Item>
              <Menu.Item component={Link} href="/manage" icon={<IconHomeShare size="1rem" />}>
                {t('actions.avatar.manage')}
              </Menu.Item>
              <Menu.Divider />
            </>
          )}
          {sessionData?.user ? (
            <Menu.Item
              icon={<IconLogout size="1rem" />}
              color="red"
              onClick={() =>
                signOut({
                  redirect: false,
                }).then(() => window.location.reload())
              }
            >
              {t('actions.avatar.logout', {
                username: sessionData.user.name,
              })}
            </Menu.Item>
          ) : (
            <Menu.Item icon={<IconLogin size="1rem" />} component={Link} href="/auth/login">
              {t('actions.avatar.login')}
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
    </UnstyledButton>
  );
};

type CurrentUserAvatarProps = {
  user: User | null;
};

const getGravatar = (email?: string | undefined | null) => {
  if (!email) return null;
  const emailHash = createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
  return `https://gravatar.com/avatar/${emailHash}?d=null`;
};

const CurrentUserAvatar = forwardRef<HTMLDivElement, CurrentUserAvatarProps>(
  ({ user, ...others }, ref) => {
    const { primaryColor } = useMantineTheme();
    const { fn } = useMantineTheme();
    const border = fn.variant({ variant: 'default' }).border;

    if (!user)
      return <Avatar ref={ref} styles={{ root: { border: `1px solid ${border}` } }} {...others} />;

    return (
      <Avatar
        ref={ref}
        color={primaryColor}
        src={getGravatar(user.email)}
        styles={{ root: { border: `1px solid ${border}` } }}
        {...others}
      >
        {user.name?.slice(0, 2).toUpperCase()}
      </Avatar>
    );
  }
);
