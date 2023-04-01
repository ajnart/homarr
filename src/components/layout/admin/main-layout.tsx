import {
  AppShell,
  Avatar,
  Card,
  Container,
  Flex,
  Group,
  Header,
  Image,
  Menu,
  Navbar,
  NavLink,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
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
import { ReactNode } from 'react';
import { Logo } from '../Logo';

export const MainLayout = () => {
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
              <NavLink icon={<IconAdjustmentsAlt size={14} />} label="Manage" />
              <NavLink icon={<IconMailForward size={14} />} label="Invites" />
            </NavLink>
            <NavLink
              label="Security"
              icon={
                <ThemeIcon size="sm" variant="light" color="red">
                  <IconShield size={14} />
                </ThemeIcon>
              }
            >
              <NavLink icon={<IconArticle size={14} />} label="Events Log" />
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
            <Logo />
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
      <Container h={200} style={{ overflow: 'hidden' }} pos="relative">
        <Image
          src="https://homarr.dev/img/pictures/homarr-devices-preview/compressed/homarr-devices-2d-mockup-flat-shadow-light-compressed.png"
          pos="absolute"
          h="100%"
          w="auto"
          style={{ zIndex: -2 }}
          opacity={0.5}
        />
        <Container
          pos="absolute"
          h="100%"
          w="100%"
          bg="linear-gradient(180deg, transparent, rgba(255,255,255,1) 95%, white 100%);"
          style={{ zIndex: -1 }}
        />

        <Stack p="md">
          <Text size="xl" style={{ lineHeight: 1 }}>
            Welcome back to Homarr
          </Text>
          <Title order={1} style={{ lineHeight: 1 }}>
            Your Dashboard
          </Title>
        </Stack>
      </Container>

      <Text mt="lg" mb="xs">
        Quick Actions
      </Text>
      <Flex gap="md">
        <QuickAction name="Dashboards" icon={<IconDashboard size={50} strokeWidth={1.4} />} />
        <QuickAction name="Users" icon={<IconUser size={50} strokeWidth={1.4} />} />
        <QuickAction name="A" icon={<></>} />
      </Flex>

      <Text mt="xl">Changelog</Text>
    </AppShell>
  );
};

const QuickAction = ({ icon, name }: { icon: ReactNode; name: string }) => {
  return (
    <UnstyledButton>
      <Card bg="gray" w={120} h={120}>
        <Stack align="center" spacing="xs">
          {icon}
          <Text weight="bold">{name}</Text>
        </Stack>
      </Card>
    </UnstyledButton>
  );
};
