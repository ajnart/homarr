import { Avatar, Badge, Box, Button, Group, Stack, Text } from '@mantine/core';
import {
  IconArchive,
  IconArchiveOff,
  IconClock,
  IconKey,
  IconShield,
  IconTrash,
} from '@tabler/icons';
import dayjs from 'dayjs';
import { UseUsersQueryResponse } from '../UserList';
import { openUserPermissionModal } from '../UserPermissionModal';
import { useUserListActions } from './actions';

interface UserListItemsProps {
  users: UseUsersQueryResponse;
}

export const UserListItems = ({ users }: UserListItemsProps) => (
  <Stack>
    {users.map((user) => (
      <UserListItem key={user.id} user={user} />
    ))}
  </Stack>
);

interface UserListItemProps {
  user: UseUsersQueryResponse[number];
}

const UserListItem = ({ user }: UserListItemProps) => {
  const { archiveAsync, unarchiveAsync } = useUserListActions();

  return (
    <Box
      p="md"
      sx={(theme) => ({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
      })}
    >
      <Group noWrap>
        <Avatar size={40}>{user.username?.slice(0, 2).toUpperCase()}</Avatar>
        <Stack w="100%" spacing={0}>
          <Group position="apart">
            <Text weight={500}>{user.username}</Text>
            {user.isEnabled ? (
              <Badge size="xs" color="green">
                Enabled
              </Badge>
            ) : (
              <Badge size="xs" color="red">
                Archived
              </Badge>
            )}
          </Group>
          <Group position="apart">
            <Group spacing={4}>
              <IconShield size={12} />
              <Text color="dimmed" size="xs">
                {user.role === 'admin' ? 'Admin' : 'User'}
              </Text>
            </Group>
            <Group spacing={4}>
              <IconClock size={12} />
              <Text color="dimmed" size="xs">
                {dayjs(user.lastActiveAt).fromNow()}
              </Text>
            </Group>
          </Group>
        </Stack>
      </Group>

      {user.role !== 'admin' ? (
        <Group position="right" mt="sm" grow>
          <Group grow maw="400px">
            {user.isEnabled ? (
              <>
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => openUserPermissionModal({ user })}
                  leftIcon={<IconKey size={14} />}
                >
                  Manage permissions
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={() => archiveAsync(user.id)}
                  leftIcon={<IconArchive size={14} />}
                >
                  Archive user
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => unarchiveAsync(user.id)}
                  leftIcon={<IconArchiveOff size={14} />}
                >
                  Unarchive user
                </Button>
                <Button
                  size="xs"
                  color="red"
                  variant="light"
                  onClick={() => {}}
                  leftIcon={<IconTrash size={14} />}
                >
                  Delete user
                </Button>
              </>
            )}
          </Group>
        </Group>
      ) : null}
    </Box>
  );
};
