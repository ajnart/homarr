import {
  AppShell,
  Avatar,
  Flex,
  Footer,
  Group,
  Header,
  Menu,
  NavLink,
  Navbar,
  Paper,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import {
  IconBook2,
  IconBrandDiscord,
  IconBrandGithub,
  IconDashboard,
  IconGitFork,
  IconHome,
  IconLogout,
  IconMailForward,
  IconQuestionMark,
  IconSun,
  IconUser,
  IconUserSearch,
  IconUsers,
} from '@tabler/icons-react';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { usePackageAttributesStore } from '~/tools/client/zustands/usePackageAttributesStore';

import { Logo } from '../Logo';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { t } = useTranslation();
  const { attributes } = usePackageAttributesStore();
  return (
    <AppShell
      styles={{
        root: {
          background: '#f1f1f1',
        },
      }}
      navbar={
        <Navbar width={{ base: 300 }}>
          <Navbar.Section pt="xs" grow>
            <NavLink
              icon={
                <ThemeIcon size="md" variant="light" color="red">
                  <IconHome size="1rem" />
                </ThemeIcon>
              }
              label="Home"
              component={Link}
              href="/manage/"
            />
            <NavLink
              label="Users"
              icon={
                <ThemeIcon size="md" variant="light" color="red">
                  <IconUser size="1rem" />
                </ThemeIcon>
              }
            >
              <NavLink
                icon={<IconUsers size="1rem" />}
                label="Manage"
                component={Link}
                href="/manage/users"
              />
              <NavLink
                icon={<IconMailForward size="1rem" />}
                label="Invites"
                component={Link}
                href="/manage/users/invites"
              />
            </NavLink>
            <NavLink
              label="Help"
              icon={
                <ThemeIcon size="md" variant="light" color="red">
                  <IconQuestionMark size="1rem" />
                </ThemeIcon>
              }
            >
              <NavLink icon={<IconBook2 size="1rem" />} label="Documentation" />
              <NavLink icon={<IconBrandGithub size="1rem" />} label="Report an issue / bug" />
              <NavLink icon={<IconBrandDiscord size="1rem" />} label="Ask a question" />
              <NavLink icon={<IconGitFork size="1rem" />} label="Contribute" />
            </NavLink>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={60} p="sm" pt="xs">
          <Group spacing="xl" position="apart" noWrap>
            <UnstyledButton component={Link} href="/manage">
              <Logo />
            </UnstyledButton>
            <TextInput radius="xl" w={400} placeholder="Search..." variant="filled" />

            <Group noWrap>
              <UnstyledButton>
                <Menu>
                  <Menu.Target>
                    <Avatar />
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item icon={<IconSun size="1rem" />}>Switch theme</Menu.Item>
                    <Menu.Item icon={<IconUserSearch size="1rem" />}>View Profile</Menu.Item>
                    <Menu.Item icon={<IconDashboard size="1rem" />}>Default Dashboard</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      icon={<IconLogout size="1rem" />}
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
      footer={
        <Footer height={25}>
          <Group position="apart" px="md">
            <Flex gap="md" align="center" columnGap={5}>
              <Image src="/imgs/logo/logo.svg" width={20} height={20} alt="" />
              <Text fw="bold" size={15}>
                Homarr
              </Text>
              {attributes.packageVersion && (
                <Text color="dimmed" size={13}>
                  {attributes.packageVersion}
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
  );
};
