import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Flex,
  Grid,
  Group,
  Loader,
  NavLink,
  Pagination,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconPencil,
  IconTrash,
  IconUser,
  IconUserDown,
  IconUserPlus,
  IconUserShield,
  IconUserStar,
  IconUserUp,
  IconX,
} from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import { openRoleChangeModal } from '~/components/Manage/User/change-user-role.modal';
import { openDeleteUserModal } from '~/components/Manage/User/delete-user.modal';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

const PossibleRoleFilter = [
  {
    id: 'all',
    icon: IconUser,
  },
  {
    id: 'owner',
    icon: IconUserStar,
  },
  {
    id: 'admin',
    icon: IconUserShield,
  },
  {
    id: 'normal',
    icon: IconUser,
  },
];

const ManageUsersPage = () => {
  const [activePage, setActivePage] = useState(0);
  const form = useForm({
    initialValues: {
      fullTextSearch: '',
      role: PossibleRoleFilter[0].id,
    },
    validate: zodResolver(
      z.object({
        fullTextSearch: z.string(),
        role: z
          .string()
          .transform((value) => (value.length > 0 ? value : undefined))
          .optional(),
      })
    ),
  });
  const [debouncedForm] = useDebouncedValue(form, 200);
  const { data, isLoading } = api.user.all.useQuery({
    page: activePage,
    search: debouncedForm.values.fullTextSearch,
  });

  const { t } = useTranslation('manage/users');

  const metaTitle = `${t('metaTitle')} • Homarr`;

  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>

      <Title mb="md">{t('pageTitle')}</Title>

      <Flex columnGap={10} mb="md">
        <TextInput
          rightSection={
            <IconX
              onClick={() => {
                form.setFieldValue('fullTextSearch', '');
              }}
              size="1rem"
            />
          }
          style={{
            flexGrow: 1,
          }}
          placeholder="Filter"
          variant="filled"
          {...form.getInputProps('fullTextSearch')}
        />
        <Button
          component={Link}
          leftIcon={<IconUserPlus size="1rem" />}
          href="/manage/users/create"
          color="green"
          variant="light"
          px="xl"
        >
          {t('buttons.create')}
        </Button>
      </Flex>

      <Grid>
        <Grid.Col xs={12} md={4}>
          <Text color="dimmed" size="sm" mb="xs">
            Roles
          </Text>
          {PossibleRoleFilter.map((role) => (
            <NavLink
              key={role.id}
              icon={<role.icon size="1rem" />}
              rightSection={!isLoading && data && <Badge>{data?.stats.roles[role.id]}</Badge>}
              label={t(`filter.roles.${role.id}`)}
              active={form.values.role === role.id}
              onClick={() => {
                form.setFieldValue('role', role.id);
              }}
              sx={(theme) => ({
                borderRadius: theme.radius.md,
                marginBottom: 5,
              })}
            />
          ))}
        </Grid.Col>
        <Grid.Col xs={12} md={8}>
          <Table mb="md" withBorder highlightOnHover>
            <thead>
              <tr>
                <th>{t('table.header.user')}</th>
                <th>{t('table.header.email')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={3}>
                    <Group position="center" p="lg">
                      <Loader variant="dots" />
                    </Group>
                  </td>
                </tr>
              )}
              {data?.users.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <Text p="lg" color="dimmed">
                      {t('searchDoesntMatch')}
                    </Text>
                  </td>
                </tr>
              )}
              {data?.users.map((user, index) => (
                <tr key={index}>
                  <td>
                    <Group position="apart">
                      <Group spacing="xs">
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
                    </Group>
                  </td>
                  <td>
                    {user.email ? <Text>{user.email}</Text> : <Text color="dimmed">No E-Mail</Text>}
                  </td>
                  <td>
                    <Group position="right">
                      <Button
                        component={Link}
                        href={`/manage/users/${user.id}/edit`}
                        leftIcon={<IconPencil size="1rem" />}
                        variant="default"
                      >
                        Edit
                      </Button>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Grid.Col>
        <Group position="right" w="100%" px="sm">
          <Pagination
            onNextPage={() => {
              setActivePage((prev) => prev + 1);
            }}
            onPreviousPage={() => {
              setActivePage((prev) => prev - 1);
            }}
            onChange={(targetPage) => {
              setActivePage(targetPage - 1);
            }}
            total={data?.countPages ?? 0}
            value={activePage + 1}
            withControls
          />
        </Group>
      </Grid>
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
