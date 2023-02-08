import { Center, Loader, ScrollArea, Text } from '@mantine/core';
import { User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import { useScreenSmallerThan } from '../../../hooks/useScreenSmallerThan';
import { userFilterSchema } from '../../../validation/user';
import { UserListItems } from './List/UserListItems';
import { UserListTable } from './List/UserListTable';

type UserListProps = UseUsersQueryInput;

export const UserList = ({ filter, search }: UserListProps) => {
  const { data: users, isLoading, isError } = useUsersQuery({ filter, search });
  const smallerThanSm = useScreenSmallerThan('sm');

  return (
    <ScrollArea>
      {smallerThanSm ? (
        <UserListItems users={users ?? []} />
      ) : (
        <UserListTable users={users ?? []} />
      )}
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

export type UseUsersQueryResponse = (Omit<
  User,
  'password' | 'createdAt' | 'updatedAt' | 'isAdmin'
> & {
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

export type UserFilterType = z.infer<typeof userFilterSchema>;
