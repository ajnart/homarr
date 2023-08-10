import {
  ActionIcon,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Flex,
  Group,
  Pagination,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { openDeleteUserModal } from '~/components/Manage/User/delete-user.modal';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
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
          leftIcon={<IconPlus size="1rem" />}
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
                    <Group position="apart">
                      <Group spacing="xs">
                        <Avatar size="sm" />
                        <Text>{user.name}</Text>
                      </Group>
                      <Group>
                        <ActionIcon
                          onClick={() => {
                            openDeleteUserModal(user);
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

export default ManageUsersPage;
