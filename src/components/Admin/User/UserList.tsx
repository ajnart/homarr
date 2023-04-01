import { Center, Loader, ScrollArea, Text } from '@mantine/core';
import { useScreenSmallerThan } from '../../../hooks/useScreenSmallerThan';
import { RouterInputs, api } from '../../../utils/api';
import { UserListItems } from './List/UserListItems';
import { UserListTable } from './List/UserListTable';

type UserListProps = RouterInputs['user']['list'];

export const UserList = ({ filter, search }: UserListProps) => {
  const { data: users, isLoading, isError } = api.user.list.useQuery({ filter, search });
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
