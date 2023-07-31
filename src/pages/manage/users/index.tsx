import {
  ActionIcon,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Flex,
  Group,
  Pagination,
  SegmentedControl,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { openContextModal } from '@mantine/modals';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';
import { api } from '~/utils/api';

const ManageUsersPage = () => {
  const [activePage, setActivePage] = useState(0);
  const [nonDebouncedSearch, setNonDebouncedSearch] = useState<string | undefined>('');
  const [debouncedSearch] = useDebouncedValue<string | undefined>(nonDebouncedSearch, 200);
  const { data } = api.user.getAll.useQuery({
    page: activePage,
    search: debouncedSearch,
  });

  return (
    <MainLayout>
      <Head>
        <title>Users • Homarr</title>
      </Head>

      <Title mb="md">Manage users</Title>
      <Text mb="xl">
        Using users, you have granular control who can access, edit or delete resources on your
        Homarr instance.
      </Text>

      <Flex columnGap={10} justify="end" mb="md">
        <Autocomplete
          placeholder="Filter"
          data={
            (data?.users.map((user) => user.name).filter((name) => name !== null) as string[]) ?? []
          }
          variant="filled"
          onChange={(value) => {
            setNonDebouncedSearch(value);
          }}
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

      {data && (
        <>
          <Table mb="md" withBorder highlightOnHover>
            <thead>
              <tr>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user, index) => (
                <tr key={index}>
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
                              title: <Text weight="bold">Delete user {user.name}</Text>,
                              innerProps: {
                                userId: user.id,
                                username: user.name ?? '',
                              },
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

              {debouncedSearch && debouncedSearch.length > 0 && (
                <tr>
                  <td colSpan={1}>
                    <Box p={15}>
                      <Text>Your search does not match any entries. Please adjust your filter.</Text>
                    </Box>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <Pagination
            total={data.countPages}
            value={activePage + 1}
            onNextPage={() => {
              setActivePage((prev) => prev + 1);
            }}
            onPreviousPage={() => {
              setActivePage((prev) => prev - 1);
            }}
            onChange={(targetPage) => {
              setActivePage(targetPage - 1);
            }}
          />
        </>
      )}
    </MainLayout>
  );
};

export default ManageUsersPage;
