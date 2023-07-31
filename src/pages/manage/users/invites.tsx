import { ActionIcon, Button, Center, Flex, Pagination, Table, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import Head from 'next/head';
import { useState } from 'react';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';
import { api } from '~/utils/api';

const ManageUserInvitesPage = () => {
  const { data, fetchPreviousPage, fetchNextPage, hasNextPage, hasPreviousPage } =
    api.registrationTokens.getAllInvites.useInfiniteQuery(
      {
        limit: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const [activePage, setActivePage] = useState(0);

  const handleFetchNextPage = async () => {
    await fetchNextPage();
    setActivePage((prev) => prev + 1);
  };

  const handleFetchPreviousPage = async () => {
    await fetchPreviousPage();
    setActivePage((prev) => prev - 1);
  };

  const currentPage = data?.pages[activePage];

  console.log(data?.pages);

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

      {activePage}
      {currentPage ? 'current page is defined' : 'current page is not defined'}

      {data && currentPage && (
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
              {currentPage.registrationTokens.map((token, index) => (
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
                    <ActionIcon
                      onClick={() => {
                        modals.openContextModal({
                          modal: 'deleteRegistrationTokenModal',
                          title: <Text weight="bold">Delete registration token</Text>,
                          innerProps: {
                            tokenId: token.id,
                          },
                        });
                      }}
                      color="red"
                      variant="light"
                    >
                      <IconTrash size="1rem" />
                    </ActionIcon>
                  </td>
                </tr>
              ))}
              {currentPage.registrationTokens.length === 0 && (
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
            total={data.pages[0].countPages}
            value={activePage + 1}
            onNextPage={handleFetchNextPage}
            onPreviousPage={handleFetchPreviousPage}
          />
        </>
      )}
    </MainLayout>
  );
};

export default ManageUserInvitesPage;
