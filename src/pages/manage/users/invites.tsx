import { ActionIcon, Button, Center, Flex, Pagination, Table, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import Head from 'next/head';
import { useState } from 'react';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';
import { modals as applicationModals } from '~/modals/modals';
import { api } from '~/utils/api';

const ManageUserInvitesPage = () => {
  const { data, isFetched, fetchPreviousPage, fetchNextPage } =
    api.registrationTokens.getAllInvites.useInfiniteQuery({
      limit: 10,
    });

  const [activePage, _] = useState(0);

  return (
    <MainLayout>
      <Head>
        <title>User invites • Homarr</title>
      </Head>
      <Title mb="md">Manage user invites</Title>
      <Text mb="xl">
        Using registration tokens, you can invite users to your Homarr instance. An invitation will
        only be valid for a certain time-span and can be used once. The expiration must be between 5
        minutes and 12 months upon creation.
      </Text>

      <Flex justify="end" mb="md">
        <Button
          onClick={() => {
            modals.openContextModal({
              modal: 'createRegistrationTokenModal',
              title: 'Create registration token',
              innerProps: {},
            });
          }}
          leftIcon={<IconPlus size="1rem" />}
          variant="default"
        >
          Create invitation
        </Button>
      </Flex>

      {data && (
        <>
          <Table mb="md" withBorder highlightOnHover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.pages[activePage].registrationTokens.map((token, index) => (
                <tr key={index}>
                  <td>
                    <Text>{token.id}</Text>
                  </td>
                  <td>
                    {dayjs(dayjs()).isAfter(token.expires) ? (
                      <Text>expired {dayjs(token.expires).fromNow()}</Text>
                    ) : (
                      <Text>in {dayjs(token.expires).fromNow(true)}</Text>
                    )}
                  </td>
                  <td>
                    <ActionIcon onClick={() => {}} color="red" variant="light">
                      <IconTrash size="1rem" />
                    </ActionIcon>
                  </td>
                </tr>
              ))}
              {data.pages[activePage].registrationTokens.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <Center p="md">
                      <Text color="dimmed">There are no invitations yet.</Text>
                    </Center>
                  </td>
                </tr>
              )}
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

export default ManageUserInvitesPage;
