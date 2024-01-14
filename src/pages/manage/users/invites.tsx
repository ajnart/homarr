import { ActionIcon, Button, Center, createStyles, Flex, Pagination, Table, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useState } from 'react';
import { openCreateInviteModal } from '~/components/Manage/User/Invite/create-invite.modal';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

const ManageUserInvitesPage = () => {
  const { classes } = useStyles();
  const { t } = useTranslation('manage/users/invites');
  const [activePage, setActivePage] = useState(0);
  const { data: invites } = api.invites.all.useQuery({
    page: activePage,
  });

  const nextPage = () => {
    setActivePage((prev) => prev + 1);
  };

  const previousPage = () => {
    setActivePage((prev) => prev - 1);
  };

  const metaTitle = `${t('metaTitle')} • Homarr`;
  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>
      <Title mb="md">{t('pageTitle')}</Title>
      <Text mb="xl">{t('description')}</Text>

      <Flex justify="end" mb="md">
        <Button
          onClick={openCreateInviteModal}
          leftIcon={<IconPlus size="1rem" />}
          variant="default"
        >
          {t('button.createInvite')}
        </Button>
      </Flex>

      {invites && (
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
              {invites.invites.map((invite, index) => (
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
              {invites.invites.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <Center p="md">
                      <Text color="dimmed">{t('noInvites')}</Text>
                    </Center>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <Pagination
            total={invites.countPages}
            value={activePage + 1}
            onChange={(targetPage) => {
              setActivePage(targetPage - 1);
            }}
            onNextPage={nextPage}
            onPreviousPage={previousPage}
            onFirstPage={() => {
              setActivePage(0);
            }}
            onLastPage={() => {
              setActivePage(invites.countPages - 1);
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
  const result = checkForSessionOrAskForLogin(ctx, session, () => session?.user.isAdmin == true);
  if (result) {
    return result;
  }

  const translations = await getServerSideTranslations(
    manageNamespaces,
    ctx.locale,
    ctx.req,
    ctx.res
  );

  return {
    props: {
      ...translations,
    },
  };
};

export default ManageUserInvitesPage;
