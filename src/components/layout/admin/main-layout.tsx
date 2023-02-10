import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Header,
  Image,
  Menu,
  Navbar,
  NavLink,
  Stack,
  Text,
  TextInput,
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
  IconPlus,
  IconQuestionMark,
  IconShield,
  IconShieldLock,
  IconSun,
  IconTools,
  IconUser,
  IconUserSearch,
} from '@tabler/icons';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { Logo } from '../Logo';

export const MainLayout = () => {
  const { t } = useTranslation();
  return (
    <AppShell
      navbar={
        <Navbar width={{ base: 300 }}>
          <UnstyledButton p="md">
            <Group>
              <IconTools />
              <Title weight="bold" order={3}>
                Admin Dashboard
              </Title>
            </Group>
          </UnstyledButton>
          <Navbar.Section>
            <NavLink
              label="Users"
              icon={
                <ActionIcon size="sm" variant="light" color="red">
                  <IconUser size={14} />
                </ActionIcon>
              }
            >
              <NavLink icon={<IconAdjustmentsAlt size={14} />} label="Manage" />
              <NavLink icon={<IconMailForward size={14} />} label="Invites" />
            </NavLink>
            <NavLink
              label="Security"
              icon={
                <ActionIcon size="sm" variant="light" color="red">
                  <IconShield size={14} />
                </ActionIcon>
              }
            >
              <NavLink icon={<IconArticle size={14} />} label="Events Log" />
              <NavLink icon={<IconShieldLock size={14} />} label="Security settings" />
            </NavLink>
            <NavLink
              label="Help"
              icon={
                <ActionIcon size="sm" variant="light" color="red">
                  <IconQuestionMark size={14} />
                </ActionIcon>
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
          <Group spacing="xl" position="apart">
            <Logo />
            <TextInput radius="xl" w={400} placeholder="Sarch..." />
            <UnstyledButton>
              <Menu>
                <Menu.Target>
                  <Group>
                    <Avatar />
                    <Stack spacing={0}>
                      <Text size="sm">@Username</Text>
                      <Text size="xs" color="dimmed">
                        Administrator
                      </Text>
                    </Stack>
                  </Group>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item icon={<IconSun size={18} />}>Switch theme</Menu.Item>
                  <Menu.Item icon={<IconUserSearch size={18} />}>View Profile</Menu.Item>
                  <Menu.Item icon={<IconDashboard size={18} />}>Default Dashboard</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item icon={<IconLogout size={18} />} color="red" onClick={() => signOut()}>
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </UnstyledButton>
          </Group>
        </Header>
      }
    >
      <Title mb="md">Good evening, @example-user 👋</Title>
      <Group position="apart" mb="sm">
        <Title order={2} color="dimmed" weight="normal">
          Available dashboards
        </Title>
        <Button leftIcon={<IconPlus />} variant="light">
          Create
        </Button>
      </Group>
      <Grid>
        <Grid.Col xs={12} sm={4}>
          <Card>
            <Card.Section>
              <Image
                src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80"
                height={160}
                alt="Norway"
              />
            </Card.Section>
            <Group position="apart" mt="md" mb="xs">
              <Text weight={500}>Default</Text>
              <Badge color="pink" variant="light">
                Recently edited
              </Badge>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </AppShell>
  );
};
