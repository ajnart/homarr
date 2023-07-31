import {
  ActionIcon,
  Button,
  Center,
  Flex,
  Pagination,
  Table,
  Text,
  Title,
  createStyles,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import Head from 'next/head';
import { useState } from 'react';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';
import { api } from '~/utils/api';

const ManageUserInvitesPage = () => {
  const [activePage, setActivePage] = useState(0);
  const { data } =
    api.registrationTokens.getAllInvites.useQuery({
      page: activePage
    });

  const { classes } = useStyles();

  const handleFetchNextPage = async () => {
    setActivePage((prev) => prev + 1);
  };

  const handleFetchPreviousPage = async () => {
    setActivePage((prev) => prev - 1);
  };

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
              {data.registrationTokens.map((token, index) => (
                <tr key={index}>
                  <td className={classes.tableIdCell}>
                    <Text lineClamp={1}>{token.id}</Text>
                  </td>
                  <td className={classes.tableCell}>
                    {dayjs(dayjs()).isAfter(token.expires) ? (
                      <Text>expired {dayjs(token.expires).fromNow()}</Text>
                    ) : (
                      <Text>in {dayjs(token.expires).fromNow(true)}</Text>
                    )}
                  </td>
                  <td className={classes.tableCell}>
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
              {data.registrationTokens.length === 0 && (
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
            total={data.countPages}
            value={activePage + 1}
            onChange={(targetPage) => {
              setActivePage(targetPage - 1);
            }}
            onNextPage={handleFetchNextPage}
            onPreviousPage={handleFetchPreviousPage}
            onFirstPage={() => {
              setActivePage(0);
            }}
            onLastPage={() => {
              setActivePage(data.countPages - 1);
            }}
            withEdges
          />
        </>
      )}
    </MainLayout>
  );
};

const useStyles = createStyles(() => ({
  tableIdCell: {
    width: '100%',
  },
  tableCell: {
    whiteSpace: 'nowrap',
  },
}));

export default ManageUserInvitesPage;
