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
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { api } from '~/utils/api';

const ManageUserInvitesPage = () => {
  const [activePage, setActivePage] = useState(0);
  const { data } = api.invites.all.useQuery({
    page: activePage,
  });
  const router = useRouter();

  const { classes } = useStyles();

  const handleFetchNextPage = async () => {
    setActivePage((prev) => prev + 1);
  };

  const handleFetchPreviousPage = async () => {
    setActivePage((prev) => prev - 1);
  };

  return (
    <ManageLayout>
      <Head>
        <title>User invites • Homarr</title>
      </Head>
      <Title mb="md">Manage user invites</Title>
      <Text mb="xl">
        Using invites, you can invite users to your Homarr instance. An invitation will only be
        valid for a certain time-span and can be used once. The expiration must be between 5 minutes
        and 12 months upon creation.
      </Text>

      <Flex justify="end" mb="md">
        <Button
          onClick={() => {
            modals.openContextModal({
              modal: 'createInviteModal',
              title: 'Create invite',
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
                <th>Creator</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.invites.map((invite, index) => (
                <tr key={index}>
                  <td className={classes.tableGrowCell}>
                    <Text lineClamp={1}>{invite.id}</Text>
                  </td>
                  <td className={classes.tableGrowCell}>
                    <Text lineClamp={1}>{invite.creator}</Text>
                  </td>
                  <td className={classes.tableCell}>
                    {dayjs(dayjs()).isAfter(invite.expires) ? (
                      <Text>expired {dayjs(invite.expires).fromNow()}</Text>
                    ) : (
                      <Text>in {dayjs(invite.expires).fromNow(true)}</Text>
                    )}
                  </td>
                  <td className={classes.tableCell}>
                    <ActionIcon
                      onClick={() => {
                        modals.openContextModal({
                          modal: 'deleteInviteModal',
                          title: <Text weight="bold">Delete invite</Text>,
                          innerProps: {
                            tokenId: invite.id,
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
              {data.invites.length === 0 && (
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
    </ManageLayout>
  );
};

const useStyles = createStyles(() => ({
  tableGrowCell: {
    width: '50%',
  },
  tableCell: {
    whiteSpace: 'nowrap',
  },
}));

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session?.user.isAdmin) {
    return {
      notFound: true,
    };
  }

  const translations = await getServerSideTranslations(
    ['common'],
    ctx.locale,
    undefined,
    undefined
  );
  return {
    props: {
      ...translations,
    },
  };
};

export default ManageUserInvitesPage;
