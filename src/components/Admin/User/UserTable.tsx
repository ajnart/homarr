import {
  ActionIcon,
  Avatar,
  Badge,
  Center,
  Group,
  Loader,
  ScrollArea,
  Table,
  Text,
} from '@mantine/core';
import { User } from '@prisma/client';
import { IconArchive, IconArchiveOff, IconKey, IconShield, IconTrash } from '@tabler/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import { z } from 'zod';
import { queryClient } from '../../../tools/queryClient';
import { userFilterSchema } from '../../../validation/user';

type UserTableProps = UseUsersQueryInput;

export const UserTable = ({ filter, search }: UserTableProps) => {
  const { data: users, isLoading, isError } = useUsersQuery({ filter, search });

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
      {users?.length === 0 ? (
        <Text align="center" mt="md">
          No items have been found
        </Text>
      ) : null}
    </ScrollArea>
  );
};

type UseUsersQueryResponse = (Omit<User, 'password' | 'createdAt' | 'updatedAt' | 'isAdmin'> & {
  role: 'admin' | 'user';
})[];

interface UseUsersQueryInput {
  filter: UserFilterType;
  search?: string;
}

export const useUsersQuery = (params: UseUsersQueryInput = { filter: 'all' }) =>
  useQuery<UseUsersQueryResponse>({
    queryKey: ['users', params.filter, params.search],
    queryFn: async () => {
      const response = await axios.get('/api/users', { params });
      return response.data;
    },
    retry: false,
  });

interface UserTableRowProps {
  user: UseUsersQueryResponse[number];
}

const UserTableRow = ({ user }: UserTableRowProps) => {
  const { mutateAsync: archiveAsync } = useArchiveUserMutation();
  const { mutateAsync: enableAsync } = useEnableUserMutation();

  return (
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
              <ActionIcon onClick={() => archiveAsync(user.id)}>
                <IconArchive color="red" size={16} />
              </ActionIcon>
            </>
          ) : (
            <>
              <ActionIcon onClick={() => enableAsync(user.id)}>
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
};

const useArchiveUserMutation = () =>
  useMutation({
    mutationKey: ['user/archive'],
    mutationFn: async (id: string) => {
      const result = await axios.post(`/api/users/${id}/archive`);
      return result.data;
    },
    onSuccess() {
      // TODO: add showNotification
      queryClient.invalidateQueries(['users']);
    },
    onError() {
      // TODO: add showNotification
    },
  });

const useEnableUserMutation = () =>
  useMutation({
    mutationKey: ['user/enable'],
    mutationFn: async (id: string) => {
      const result = await axios.post(`/api/users/${id}/enable`);
      return result.data;
    },
    onSuccess() {
      // TODO: add showNotification
      queryClient.invalidateQueries(['users']);
    },
    onError() {
      // TODO: add showNotification
    },
  });

export type UserFilterType = z.infer<typeof userFilterSchema>;
