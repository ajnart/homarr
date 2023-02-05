import {
  ActionIcon,
  Avatar,
  Badge,
  Center,
  Group,
  Loader,
  ScrollArea,
  Select,
  Table,
  Text,
} from '@mantine/core';
import { User } from '@prisma/client';
import {
  IconArchive,
  IconArchiveOff,
  IconDisabled,
  IconKey,
  IconLock,
  IconLockAccess,
  IconPencil,
  IconShield,
  IconShieldLock,
  IconTrash,
} from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';

export const UserTable = () => {
  const { data: users, isLoading, isError } = useUsersQuery();

  return (
    <ScrollArea>
      <Table sx={{ minWidth: 800 }} verticalSpacing="sm">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Last active</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u) => (
            <UserTableRow key={u.id} user={u} />
          ))}
        </tbody>
      </Table>
      {isLoading ? (
        <Center mt="md">
          <Loader />
        </Center>
      ) : null}
      {isError ? (
        <Text align="center" mt="md">
          An error occurred during the query
        </Text>
      ) : null}
    </ScrollArea>
  );
};

type UseUsersQueryResponse = (Omit<User, 'password' | 'createdAt' | 'updatedAt' | 'isAdmin'> & {
  role: 'admin' | 'user';
})[];

const useUsersQuery = () =>
  useQuery<UseUsersQueryResponse>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/users');
      return response.data;
    },
    retry: false,
  });

interface UserTableRowProps {
  user: UseUsersQueryResponse[number];
}

const UserTableRow = ({ user }: UserTableRowProps) => (
  <tr key={user.id}>
    <td>
      <Group spacing="sm">
        <Avatar size={40} radius={40}>
          {user.username?.slice(0, 2).toUpperCase()}
        </Avatar>
        <div>
          <Text size="sm" weight={500}>
            {user.username}
          </Text>
        </div>
      </Group>
    </td>

    <td>{user.role === 'admin' ? 'Admin' : 'User'}</td>
    <td>{dayjs(user.lastActiveAt).fromNow()}</td>
    <td>
      {user.isEnabled ? (
        <Badge fullWidth color="green">
          Enabled
        </Badge>
      ) : (
        <Badge color="red" fullWidth>
          Archived
        </Badge>
      )}
    </td>
    <td>
      <Group>
        {user.isEnabled ? (
          <>
            <ActionIcon>
              <IconKey size={16} />
            </ActionIcon>
            <ActionIcon>
              <IconShield size={16} />
            </ActionIcon>
            <ActionIcon>
              <IconArchive color="red" size={16} />
            </ActionIcon>
          </>
        ) : (
          <>
            <ActionIcon>
              <IconArchiveOff size={16} />
            </ActionIcon>
            <ActionIcon>
              <IconShield size={16} />
            </ActionIcon>
            <ActionIcon>
              <IconTrash color="red" size={16} />
            </ActionIcon>
          </>
        )}
      </Group>
    </td>
  </tr>
);
