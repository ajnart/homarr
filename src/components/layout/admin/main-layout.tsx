import {
  AppShell,
  Avatar,
  Group,
  Header,
  Menu,
  Navbar,
  NavLink,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import {
  IconAdjustmentsAlt,
  IconArticle,
  IconBook2,
  IconBrandDiscord,
  IconBrandGithub,
  IconDashboard,
  IconGitFork,
  IconLogout,
  IconMailForward,
  IconQuestionMark,
  IconShield,
  IconShieldLock,
  IconSun,
  IconUser,
  IconUserSearch,
} from '@tabler/icons';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Logo } from '../Logo';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { t } = useTranslation();
  return (
    <AppShell
      navbar={
        <Navbar width={{ base: 300 }}>
          <Navbar.Section pt="xs">
            <NavLink
              label="Users"
              icon={
                <ThemeIcon size="sm" variant="light" color="red">
                  <IconUser size={14} />
                </ThemeIcon>
              }
            >
              <NavLink
                icon={<IconAdjustmentsAlt size={14} />}
                label="Manage"
                component={Link}
                href="/admin/users"
              />
              <NavLink
                icon={<IconMailForward size={14} />}
                label="Invites"
                component={Link}
                href="/admin/users/invites"
              />
            </NavLink>
            <NavLink
              label="Security"
              icon={
                <ThemeIcon size="sm" variant="light" color="red">
                  <IconShield size={14} />
                </ThemeIcon>
              }
            >
              <NavLink
                icon={<IconArticle size={14} />}
                label="Events Log"
                component={Link}
                href="/admin/security/events"
              />
              <NavLink icon={<IconShieldLock size={14} />} label="Security settings" />
            </NavLink>
            <NavLink
              label="Help"
              icon={
                <ThemeIcon size="sm" variant="light" color="red">
                  <IconQuestionMark size={14} />
                </ThemeIcon>
              }
            >
              <NavLink icon={<IconBook2 size={14} />} label="Documentation" />
              <NavLink icon={<IconBrandGithub size={14} />} label="Report an issue / bug" />
              <NavLink icon={<IconBrandDiscord size={14} />} label="Ask a question" />
              <NavLink icon={<IconGitFork size={14} />} label="Contribute" />
            </NavLink>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={60} p="sm" pt="xs">
          <Group spacing="xl" position="apart" noWrap>
            <UnstyledButton component={Link} href="/admin">
              <Logo />
            </UnstyledButton>
            <TextInput radius="xl" w={400} placeholder="Sarch..." variant="filled" />

            <Group noWrap>
              <UnstyledButton>
                <Menu>
                  <Menu.Target>
                    <Avatar />
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item icon={<IconSun size={18} />}>Switch theme</Menu.Item>
                    <Menu.Item icon={<IconUserSearch size={18} />}>View Profile</Menu.Item>
                    <Menu.Item icon={<IconDashboard size={18} />}>Default Dashboard</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      icon={<IconLogout size={18} />}
                      color="red"
                      onClick={() => signOut()}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </UnstyledButton>
            </Group>
          </Group>
        </Header>
      }
    >
      {children}
    </AppShell>
  );
};
