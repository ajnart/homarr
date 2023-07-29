import {
  Anchor,
  Avatar,
  Box,
  Flex,
  Group,
  Header,
  Menu,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconDashboard,
  IconLogout,
  IconSun,
  IconUserSearch,
} from '@tabler/icons-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

import { Logo } from '../Logo';
import { Search } from './search';

type MainHeaderProps = {
  logoHref?: string;
  showExperimental?: boolean;
};

export const MainHeader = ({ showExperimental = false, logoHref = '/' }: MainHeaderProps) => {
  const headerHeight = showExperimental ? 60 + 30 : 60;
  return (
    <Header height={headerHeight} pb="sm" pt={0}>
      <ExperimentalHeaderNote visible={showExperimental} />
      <Group spacing="xl" mt="xs" px="md" position="apart" noWrap>
        <UnstyledButton component={Link} href={logoHref}>
          <Logo />
        </UnstyledButton>

        <Search />

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
                <Menu.Item icon={<IconLogout size="1rem" />} color="red" onClick={() => signOut()}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </UnstyledButton>
        </Group>
      </Group>
    </Header>
  );
};

type ExperimentalHeaderNoteProps = {
  visible?: boolean;
};
const ExperimentalHeaderNote = ({ visible = false }: ExperimentalHeaderNoteProps) => {
  if (!visible) return null;

  return (
    <Box bg="red" h={30} p={3} px={6}>
      <Flex h="100%" align="center" columnGap={7}>
        <IconAlertTriangle color="white" size="1rem" />
        <Text color="white">
          This is an experimental feature of Homarr. Please report any issues to the official Homarr
          team.
        </Text>
      </Flex>
    </Box>
  );
};
