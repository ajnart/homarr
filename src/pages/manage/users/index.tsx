import {
	ActionIcon,
	Autocomplete,
	Avatar,
	Badge,
	Box,
	Button,
	Flex,
	Group,
	Pagination,
	Table,
	Text,
	Title,
	Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPlus, IconTrash, IconUserDown, IconUserUp } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { openRoleChangeModal } from '~/components/Manage/User/change-user-role.modal';
import { openDeleteUserModal } from '~/components/Manage/User/delete-user.modal';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

const ManageUsersPage = () => {
  const [activePage, setActivePage] = useState(0);
  const [nonDebouncedSearch, setNonDebouncedSearch] = useState<string | undefined>('');
  const [debouncedSearch] = useDebouncedValue<string | undefined>(nonDebouncedSearch, 200);
  const { data } = api.user.all.useQuery({
    page: activePage,
    search: debouncedSearch,
  });
  const { data: sessionData } = useSession();

  const { t } = useTranslation('manage/users');

  const metaTitle = `${t('metaTitle')} • Homarr`;

  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>

      <Title mb="md">{t('pageTitle')}</Title>
      <Text mb="xl">{t('text')}</Text>

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
          leftSection={<IconPlus size="1rem" />}
          href="/manage/users/create"
          variant="default"
        >
          {t('buttons.create')}
        </Button>
      </Flex>

      {data && (
        <>
          <Table mb="md" withBorder highlightOnHover>
            <thead>
              <tr>
                <th>{t('table.header.user')}</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user, index) => (
                <tr key={index}>
                  <td>
                    <Group justify="apart">
                      <Group gap="xs">
                        <Avatar size="sm" />
                        <Text>{user.name}</Text>
                        {user.isOwner && (
                          <Badge color="pink" size="sm">
                            Owner
                          </Badge>
                        )}
                        {user.isAdmin && (
                          <Badge color="red" size="sm">
                            Admin
                          </Badge>
                        )}
                      </Group>
                      <Group>
                        {user.isAdmin ? (
                          <Tooltip label={t('tooltips.demoteAdmin')} withinPortal withArrow>
                            <ActionIcon
                              disabled={user.id === sessionData?.user?.id || user.isOwner}
                              onClick={() => {
                                openRoleChangeModal({
                                  ...user,
                                  type: 'demote',
                                });
                              }}
                            >
                              <IconUserDown size="1rem" />
                            </ActionIcon>
                          </Tooltip>
                        ) : (
                          <Tooltip label={t('tooltips.promoteToAdmin')} withinPortal withArrow>
                            <ActionIcon
                              onClick={() => {
                                openRoleChangeModal({
                                  ...user,
                                  type: 'promote',
                                });
                              }}
                            >
                              <IconUserUp size="1rem" />
                            </ActionIcon>
                          </Tooltip>
                        )}

                        <Tooltip label={t('tooltips.deleteUser')} withinPortal withArrow>
                          <ActionIcon
                            disabled={user.id === sessionData?.user?.id || user.isOwner}
                            onClick={() => {
                              openDeleteUserModal(user);
                            }}
                            color="red"
                            variant="light"
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                  </td>
                </tr>
              ))}

              {debouncedSearch && debouncedSearch.length > 0 && data.countPages === 0 && (
                <tr>
                  <td colSpan={1}>
                    <Box p={15}>
                      <Text>{t('searchDoesntMatch')}</Text>
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
    </ManageLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const result = checkForSessionOrAskForLogin(ctx, session, () => session?.user.isAdmin == true);
  if (result) {
    return result;
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

export default ManageUsersPage;
