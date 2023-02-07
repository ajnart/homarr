import {
  ActionIcon,
  AppShell,
  Avatar,
  Group,
  Header,
  Menu,
  Navbar,
  NavLink,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { IconShield, IconUser } from '@tabler/icons';
import { Logo } from '../Logo';

export const MainLayout = () => {
  return (
    <AppShell
      navbar={
        <Navbar width={{ base: 300 }}>
          <Navbar.Section>
            <NavLink
              label="Users"
              icon={
                <ActionIcon size="sm" variant="light" color="red">
                  <IconUser size={14} />
                </ActionIcon>
              }
            >
              <NavLink label="Manage" />
              <NavLink label="Invites" />
            </NavLink>
            <NavLink
              label="Security"
              icon={
                <ActionIcon size="sm" variant="light" color="red">
                  <IconShield size={14} />
                </ActionIcon>
              }
            >
              <NavLink label="Events Log" />
            </NavLink>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={60} p="sm">
          <Group spacing="xl" position="apart">
            <Logo />
            <TextInput />
            <UnstyledButton>
              <Menu>
                <Menu.Target>
                  <Group>
                    <Avatar />
                    <Stack spacing={0}>
                      <Text weight="bold">@Username</Text>
                      <Text size="xs">Administrator</Text>
                    </Stack>
                  </Group>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item>Test</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </UnstyledButton>
          </Group>
        </Header>
      }
    >
      iefife
    </AppShell>
  );
};
