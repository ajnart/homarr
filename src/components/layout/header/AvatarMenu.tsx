import { Avatar, Badge, Menu, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconHomeShare,
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
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { forwardRef } from 'react';
import { AboutModal } from '~/components/layout/header/About/AboutModal';
import { useColorScheme } from '~/hooks/use-colorscheme';
import { usePackageAttributesStore } from '~/tools/client/zustands/usePackageAttributesStore';

import { REPO_URL } from '../../../../data/constants';

export const AvatarMenu = () => {
  const { t } = useTranslation('layout/header');
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
              {t('actions.avatar.switchTheme')}
            </Menu.Item>
            {sessionData?.user && (
              <>
                <Menu.Item
                  component={Link}
                  href="/user/preferences"
                  icon={<IconUserCog size="1rem" />}
                >
                  {t('actions.avatar.preferences')}
                </Menu.Item>
                <Menu.Item component={Link} href="/board" icon={<IconDashboard size="1rem" />}>
                  {t('actions.avatar.defaultBoard')}
                </Menu.Item>
                <Menu.Item component={Link} href="/manage" icon={<IconHomeShare size="1rem" />}>
                  {t('actions.avatar.manage')}
                </Menu.Item>
                <Menu.Divider />
              </>
            )}
            <Menu.Item
              icon={<IconInfoCircle size="1rem" />}
              rightSection={
                newVersionAvailable && (
                  <Badge variant="light" color="blue">
                    {t('actions.avatar.about.new')}
                  </Badge>
                )
              }
              onClick={() => aboutModal.open()}
            >
              {t('actions.avatar.about.label')}
            </Menu.Item>
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
