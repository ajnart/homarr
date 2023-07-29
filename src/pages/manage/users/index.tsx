import {
  ActionIcon,
  Autocomplete,
  Avatar,
  Button,
  Flex,
  Group,
  Pagination,
  SegmentedControl,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';
import { api } from '~/utils/api';

const ManageUsersPage = () => {
  const { isLoading, data, fetchNextPage, fetchPreviousPage } = api.user.getAll.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const { mutateAsync: deleteUserMutateAsync } = api.user.deleteUser.useMutation();

  const [activePage, _] = useState(0);

  return (
    <MainLayout>
      <Head>
        <title>Users • Homarr</title>
      </Head>

      <Title mb="xl">Manage users</Title>

      <Group position="apart" mb="md">
        <SegmentedControl
          data={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]}
        />
        <Flex columnGap={10}>
          <Autocomplete
            placeholder="Filter"
            data={['React', 'Angular', 'Svelte', 'Vue']}
            variant="filled"
          />
          <Button
            component={Link}
            leftIcon={<IconPlus size="1rem" />}
            href="/manage/users/create"
            variant="default"
          >
            Create
          </Button>
        </Flex>
      </Group>

      {data && (
        <>
          <Table mb="md" withBorder highlightOnHover>
            <thead>
              <tr>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {data.pages[activePage].users.map((user) => (
                <tr>
                  <td>
                    <Group position="apart">
                      <Group spacing="xs">
                        <Avatar size="sm" />
                        <Text>{user.name}</Text>
                      </Group>
                      <Group>
                        <ActionIcon
                          onClick={() => {
                            openContextModal({
                              modal: 'deleteUserModal',
                              title: <Text weight="bold">Delete user ${user.name}</Text>,
                              innerProps: {
                                userId: user.id,
                                username: user.name ?? ''
                              }
                            });
                          }}
                          color="red"
                          variant="light"
                        >
                          <IconTrash size="1rem" />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            total={data.pages.length}
            value={activePage + 1}
            onNextPage={fetchNextPage}
            onPreviousPage={fetchPreviousPage}
          />
        </>
      )}
    </MainLayout>
  );
};

export default ManageUsersPage;
