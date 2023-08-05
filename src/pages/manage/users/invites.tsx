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
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

const ManageUserInvitesPage = () => {
  const [activePage, setActivePage] = useState(0);
  const { data } = api.invites.all.useQuery({
    page: activePage,
  });

  const { classes } = useStyles();

  const handleFetchNextPage = async () => {
    setActivePage((prev) => prev + 1);
  };

  const handleFetchPreviousPage = async () => {
    setActivePage((prev) => prev - 1);
  };

  const { t } = useTranslation('user/invites');

  return (
    <ManageLayout>
      <Head>
        <title>User invites • Homarr</title>
      </Head>
      <Title mb="md">{t('title')}</Title>
      <Text mb="xl">{t('text')}</Text>

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
          {t('button.createInvite')}
        </Button>
      </Flex>

      {data && (
        <>
          <Table mb="md" withBorder highlightOnHover>
            <thead>
              <tr>
                <th>{t('table.header.id')}</th>
                <th>{t('table.header.creator')}</th>
                <th>{t('table.header.expires')}</th>
                <th>{t('table.header.action')}</th>
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
                      <Text>
                        {t('table.data.expiresAt', { at: dayjs(invite.expires).fromNow() })}
                      </Text>
                    ) : (
                      <Text>
                        {t('table.data.expiresIn', { in: dayjs(invite.expires).fromNow(true) })}
                      </Text>
                    )}
                  </td>
                  <td className={classes.tableCell}>
                    <ActionIcon
                      onClick={() => {
                        modals.openContextModal({
                          modal: 'deleteInviteModal',
                          title: <Text weight="bold">{t('button.deleteInvite')}</Text>,
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
                      <Text color="dimmed">{t('noInvites')}</Text>
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
    manageNamespaces,
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
