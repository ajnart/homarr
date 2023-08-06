import {
  AppShell,
  Burger,
  Drawer,
  Flex,
  Footer,
  Group,
  NavLink,
  Navbar,
  Paper,
  Text,
  ThemeIcon,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBook2,
  IconBrandDiscord,
  IconBrandGithub,
  IconGitFork,
  IconHome,
  IconLayoutDashboard,
  IconMailForward,
  IconQuestionMark,
  IconUser,
  IconUsers,
  TablerIconsProps,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, RefObject, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useScreenLargerThan } from '~/hooks/useScreenLargerThan';
import { usePackageAttributesStore } from '~/tools/client/zustands/usePackageAttributesStore';

import { type navigation } from '../../../../public/locales/en/layout/manage.json';
import { MainHeader } from '../header/Header';

interface ManageLayoutProps {
  children: ReactNode;
}

export const ManageLayout = ({ children }: ManageLayoutProps) => {
  const { t } = useTranslation('layout/manage');
  const packageVersion = usePackageAttributesStore((x) => x.attributes.packageVersion);
  const theme = useMantineTheme();

  const screenLargerThanMd = useScreenLargerThan('md');

  const [burgerMenuOpen, { toggle: toggleBurgerMenu, close: closeBurgerMenu }] =
    useDisclosure(false);

  const data = useSession();
  const isAdmin = data.data?.user.isAdmin ?? false;

  const navigationLinkComponents = Object.entries(navigationLinks).map(([name, navigationLink]) => {
    if (navigationLink.onlyAdmin && !isAdmin) {
      return null;
    }

    return (
      <CustomNavigationLink
        key={name}
        name={name as keyof typeof navigationLinks}
        navigationLink={navigationLink}
      />
    );
  });

  const burgerMenu = screenLargerThanMd ? undefined : (
    <Burger opened={burgerMenuOpen} onClick={toggleBurgerMenu} />
  );

  return (
    <>
      <AppShell
        styles={{
          root: {
            background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
          },
        }}
        navbar={
          <Navbar width={{ base: !screenLargerThanMd ? 0 : 220 }} hidden={!screenLargerThanMd}>
            <Navbar.Section pt="xs" grow>
              {navigationLinkComponents}
            </Navbar.Section>
          </Navbar>
        }
        header={<MainHeader showExperimental logoHref="/manage" leftIcon={burgerMenu} />}
        footer={
          <Footer height={25}>
            <Group position="apart" px="md">
              <Flex gap="md" align="center" columnGap={5}>
                <Image src="/imgs/logo/logo.svg" width={20} height={20} alt="" />
                <Text fw="bold" size={15}>
                  Homarr
                </Text>
                {packageVersion && (
                  <Text color="dimmed" size={13}>
                    {packageVersion}
                  </Text>
                )}
              </Flex>
            </Group>
          </Footer>
        }
      >
        <Paper p="xl" mih="100%" withBorder>
          {children}
        </Paper>
      </AppShell>
      <Drawer opened={burgerMenuOpen} onClose={closeBurgerMenu}>
        {navigationLinkComponents}
      </Drawer>
    </>
  );
};

type Icon = (props: TablerIconsProps) => JSX.Element;

type NavigationLinkHref = {
  icon: Icon;
  href: string;
  onlyAdmin?: boolean;
};

type NavigationLinkItems<TItemsObject> = {
  icon: Icon;
  items: Record<keyof TItemsObject, NavigationLinkHref>;
  onlyAdmin?: boolean;
};

type CustomNavigationLinkProps = {
  name: keyof typeof navigationLinks;
  navigationLink: (typeof navigationLinks)[keyof typeof navigationLinks];
};

const CustomNavigationLink = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  CustomNavigationLinkProps
>(({ name, navigationLink }, ref) => {
  const { t } = useTranslation('layout/manage');

  const commonProps = {
    label: t(`navigation.${name}.title`),
    icon: (
      <ThemeIcon size="md" variant="light" color="red">
        <navigationLink.icon size={16} />
      </ThemeIcon>
    ),
  };

  if ('href' in navigationLink) {
    return (
      <NavLink
        {...commonProps}
        ref={ref as RefObject<HTMLAnchorElement>}
        component={Link}
        href={navigationLink.href}
      />
    );
  }

  return (
    <NavLink {...commonProps} ref={ref as RefObject<HTMLButtonElement>}>
      {Object.entries(navigationLink.items).map(([itemName, item]) => {
        const commonItemProps = {
          label: t(`navigation.${name}.items.${itemName}`),
          icon: <item.icon size={16} />,
          href: item.href,
        };

        if (item.href.startsWith('http')) {
          return <NavLink {...commonItemProps} component="a" />;
        }

        return <NavLink {...commonItemProps} component={Link} />;
      })}
    </NavLink>
  );
});

type NavigationLinks = {
  [key in keyof typeof navigation]: (typeof navigation)[key] extends {
    items: Record<string, string>;
  }
    ? NavigationLinkItems<(typeof navigation)[key]['items']>
    : NavigationLinkHref;
};

const navigationLinks: NavigationLinks = {
  home: {
    icon: IconHome,
    href: '/manage',
  },
  boards: {
    icon: IconLayoutDashboard,
    href: '/manage/boards',
  },
  users: {
    icon: IconUser,
    onlyAdmin: true,
    items: {
      manage: {
        icon: IconUsers,
        href: '/manage/users',
      },
      invites: {
        icon: IconMailForward,
        href: '/manage/users/invites',
      },
    },
  },
  help: {
    icon: IconQuestionMark,
    items: {
      documentation: {
        icon: IconBook2,
        href: 'https://homarr.dev/docs/about',
      },
      report: {
        icon: IconBrandGithub,
        href: 'https://github.com/ajnart/homarr/issues/new/choose',
      },
      discord: {
        icon: IconBrandDiscord,
        href: 'https://discord.com/invite/aCsmEV5RgA',
      },
      contribute: {
        icon: IconGitFork,
        href: 'https://github.com/ajnart/homarr',
      },
    },
  },
};
